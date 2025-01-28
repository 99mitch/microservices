import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { getVideos } from '../services/api';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [pager, setPager] = useState({ current: 1, total: 1 });

  const fetchVideos = async () => {
    try {
      setError('');
      const response = await getVideos();
      console.log('Fetched videos:', response);
      
      const videosData = response.videos || [];
      setPager(response.pager || { current: 1, total: 1 });
      console.log('Videos to display:', videosData);
      
      setVideos(videosData);
      filterVideos(videosData, searchQuery);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Impossible de charger les vidéos');
    }
  };

  const filterVideos = (videosData, query) => {
    if (!query.trim()) {
      setFilteredVideos(videosData);
      return;
    }
    
    const filtered = videosData.filter(video => 
      video.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVideos(filtered);
  };

  const onSearch = (text) => {
    setSearchQuery(text);
    filterVideos(videos, text);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVideos();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchVideos();
    });

    return unsubscribe;
  }, [navigation]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderVideo = ({ item }) => {
    console.log('Rendering video:', item);
    const videoUrl = item.source.startsWith('http') 
      ? item.source 
      : `http://localhost:8000/${item.source}`;
    console.log('Video URL:', videoUrl);

    return (
      <TouchableOpacity 
        style={styles.videoCard}
        onPress={() => navigation.navigate('VideoDetails', { video: item })}
      >
        <Video
          source={{ uri: videoUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          shouldPlay={false}
          isMuted={true}
          useNativeControls={false}
        />
        <View style={styles.videoInfo}>
          <View style={styles.videoHeader}>
            <Ionicons name="person-circle-outline" size={40} color="#666" style={styles.userIcon} />
            <View style={styles.videoTextInfo}>
              <Text style={styles.videoName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.videoMeta}>
                {item.views || 0} vues • {formatDate(item.created_at)}
              </Text>
              {item.user && (
                <Text style={styles.userName}>{item.user.username}</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des vidéos..."
          value={searchQuery}
          onChangeText={onSearch}
        />
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Aucune vidéo trouvée' : 'Aucune vidéo disponible'}
              </Text>
              <Text style={styles.emptySubText}>Tirez vers le bas pour actualiser</Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            filteredVideos.length === 0 && styles.emptyList,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  listContent: {
    padding: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  videoCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    padding: 10,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userIcon: {
    marginRight: 10,
  },
  videoTextInfo: {
    flex: 1,
  },
  videoName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
});
