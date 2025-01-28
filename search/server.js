const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Elasticsearch client
const esClient = new Client({ node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200' });

// API Base URL and Elasticsearch index name
const API_BASE_URL = 'http://host.docker.internal:8000'; // Replace with your API URL
const INDEX_NAME = 'videos';

// Function to check and create index if not existing
const ensureIndexExists = async (indexName) => {
  try {
    const indexExists = await esClient.indices.exists({ index: indexName });
    if (!indexExists.body) {
      console.log(`Index '${indexName}' does not exist. Creating index...`);
      await esClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              id: { type: 'integer' },
              user_id: { type: 'integer' },
              source: { type: 'text' },
              created_at: { type: 'date' },
              enabled: { type: 'boolean' },
              views: { type: 'integer' },
            },
          },
        },
      });
      console.log(`Index '${indexName}' created successfully.`);
    } else {
      console.log(`Index '${indexName}' already exists.`);
    }
  } catch (error) {
    console.error(`Error ensuring index '${indexName}' exists:`, error.message);
  }
};

// Function to fetch videos and index them into Elasticsearch
const fetchAndIndexVideos = async () => {
  console.log('Starting periodic indexing...');
  try {
    const response = await axios.get(`${API_BASE_URL}/videos`);
    const videos = response.data.data?.videos || [];

    if (videos.length === 0) {
      console.log('No videos to index.');
      return;
    }

    const body = videos.flatMap((video) => [
      { index: { _index: INDEX_NAME, _id: video.id } },
      video,
    ]);

    const bulkResponse = await esClient.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      console.error('Errors during bulk indexing:', bulkResponse.items);
    } else {
      console.log('Videos indexed successfully');
    }
  } catch (error) {
    console.error('Error fetching or indexing videos:', error.message);
  }
};

// Periodically run the `fetchAndIndexVideos` function every 30 seconds
setInterval(fetchAndIndexVideos, 30 * 1000);

// Trigger index creation and periodic indexing on startup
ensureIndexExists(INDEX_NAME).then(fetchAndIndexVideos);

// Search videos endpoint (search by name only)
app.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).send({ error: 'Query parameter is required' });
  }

  try {
    const sanitizedQuery = query.toLowerCase();
    console.log(`Searching for '${sanitizedQuery}' in index '${INDEX_NAME}'`);

    const searchQuery = {
      index: INDEX_NAME,
      body: {
        query: {
          wildcard: {
            name: {
              value: `*${sanitizedQuery}*`,
              case_insensitive: true,
            },
          },
        },
      },
    };

    console.log('Executing Elasticsearch query:', JSON.stringify(searchQuery, null, 2));

    const response = await esClient.search(searchQuery);

    const hits = response.body?.hits?.hits || response.hits?.hits;
    if (!hits || hits.length === 0) {
      return res.status(404).send({ error: `No results found for query: '${sanitizedQuery}'` });
    }

    const results = hits.map((hit) => hit._source);
    res.status(200).json(results);
  } catch (error) {
    console.error('Elasticsearch error:', error.meta?.body?.error || error.message);
    res.status(500).send({ error: `Failed to search videos: ${error.message}` });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Search microservice is running on port ${PORT}`);
});
