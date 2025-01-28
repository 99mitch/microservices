import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadVideo } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UploadScreen({ navigation }) {
  const [videoName, setVideoName] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: false,
        multiple: false
      });

      console.log('DocumentPicker result:', result);

      if (!result.canceled && result.output) {
        // For web platform
        const file = result.output[0]; // Get the first file from FileList
        console.log('Selected file:', file);
        setSelectedVideo(file);
        setError('');
      }
    } catch (err) {
      console.log('Error picking video:', err);
      setError('Error selecting video');
    }
  };

  const handleUpload = async () => {
    if (!videoName.trim() || !selectedVideo) {
      setError('Please provide a video name and select a video');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      console.log('Starting upload with:', {
        userId,
        videoName,
        selectedVideo: {
          name: selectedVideo.name,
          type: selectedVideo.type,
          size: selectedVideo.size
        }
      });

      await uploadVideo(userId, videoName, selectedVideo);
      
      console.log('Upload successful');
      setVideoName('');
      setSelectedVideo(null);
      navigation.navigate('Home');
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to upload video. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Video Name"
        value={videoName}
        onChangeText={(text) => {
          setVideoName(text);
          setError('');
        }}
        editable={!uploading}
      />
      
      <TouchableOpacity 
        style={[styles.button, styles.selectButton]} 
        onPress={pickVideo}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>Choose Video File</Text>
      </TouchableOpacity>
      
      {selectedVideo && (
        <View style={styles.fileInfo}>
          <Text style={styles.selectedFile}>
            Selected: {selectedVideo.name}
          </Text>
          <Text style={styles.fileDetails}>
            Size: {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
          </Text>
          <Text style={styles.fileDetails}>
            Type: {selectedVideo.type}
          </Text>
        </View>
      )}
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={uploading || !selectedVideo}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    gap: 15,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#5856D6',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFile: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  fileDetails: {
    color: '#888',
    fontSize: 12,
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
});
