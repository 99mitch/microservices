<template>
  <div>
    <!-- Search Field -->
    <v-text-field
      v-model="searchQuery"
      label="Search videos"
      prepend-icon="mdi-magnify"
      @input="handleSearch"
    ></v-text-field>

    <!-- Video List -->
    <v-row v-if="videos.length">
      <v-col v-for="video in videos" :key="video.id" cols="12" sm="6" md="4" lg="3">
        <VideoCard :video="video" />
      </v-col>
    </v-row>

    <!-- No Videos Found -->
    <div v-else-if="hasSearched" class="text-center mt-4">
      No videos found
    </div>
  </div>
</template>



<script setup>

const searchQuery = ref('') // User's search query
const videos = ref([]) // List of videos returned from the search
const hasSearched = ref(false) // Indicates if a search has been performed

// Handle search with debounce to limit API calls
const handleSearch = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    videos.value = [] // Clear videos if search query is empty
    hasSearched.value = false
    return
  }

  try {
    // Fetch videos from the search microservice
    const response = await fetch(
      `http://localhost:3001/search?query=${encodeURIComponent(searchQuery.value.trim())}`
    )

    if (!response.ok) {
      throw new Error('Search API call failed')
    }

    videos.value = await response.json() // Assign the array of videos
    hasSearched.value = true
  } catch (error) {
    console.error('Search failed:', error)
    videos.value = [] // Clear videos on error
    hasSearched.value = true
  }
}, 300) // Debounce for 300ms
</script>


