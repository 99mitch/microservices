import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../config/config';
import { searchVideos } from '../services/api';
import { debounce } from 'lodash';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const searchInputRef = useRef(null);

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await searchVideos({ query: query.trim() });
      setSearchResults(response || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search to avoid too many API calls
  const debouncedSearch = debounce(handleSearch, 300);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => navigation.navigate('VideoDetails', { video: item })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: `${BASE_URL}/${item.source}` }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.name || 'Untitled Video'}
        </Text>
        <Text style={styles.videoMeta}>
          {item.views || 0} views • {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery.trim() 
          ? 'No videos found'
          : 'Start searching for videos'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search videos..."
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            if (text.length > 2) {
              debouncedSearch(text);
            } else if (!text) {
              setSearchResults([]);
            }
          }}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => handleSearch()}
          placeholderTextColor="#999"
        />
        {loading && <ActivityIndicator style={styles.loader} color="#007AFF" />}
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderVideoItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 8,
  },
  loader: {
    marginLeft: 10,
  },
  resultsList: {
    padding: 10,
    flexGrow: 1,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    padding: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SearchScreen;
