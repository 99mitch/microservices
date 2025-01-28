import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function VideoCard({ video, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.card, { pointerEvents: 'auto' }]} 
      onPress={onPress}
    >
      <Image
        source={{ uri: video.thumbnail || 'https://via.placeholder.com/300x200' }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{video.name}</Text>
        <Text style={styles.views}>{video.views || 0} views</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  views: {
    fontSize: 14,
    color: '#666',
  },
});
