import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import CommentSection from '../components/CommentSection';

const BASE_URL = Platform.select({
  web: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000'
});

const QUALITY_OPTIONS = [
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: '240p', value: '240' },
  { label: '144p', value: '144' },
];

export default function VideoDetailsScreen({ route }) {
  const { video } = route.params;
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('720');
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    // Initialiser l'URL de la vidéo au chargement
    const initVideoUrl = () => {
      if (video.format) {
        // Trouver la meilleure qualité disponible
        const availableQualities = Object.entries(video.format)
          .filter(([_, url]) => url)
          .map(([quality]) => quality);

        if (availableQualities.length > 0) {
          // Prendre la meilleure qualité disponible
          const bestQuality = availableQualities[0];
          setSelectedQuality(bestQuality);
          const videoUrl = video.format[bestQuality];
          setCurrentVideoUrl(videoUrl.startsWith('http') ? videoUrl : `${BASE_URL}/public/videos/encoded/${video.id}/${bestQuality}.mp4`);
        } else {
          // Utiliser l'URL source si aucun format n'est disponible
          setCurrentVideoUrl(video.source.startsWith('http') ? video.source : `${BASE_URL}/public/videos/${video.source.split('/').pop()}`);
        }
      } else {
        // Utiliser l'URL source si pas de formats
        setCurrentVideoUrl(video.source.startsWith('http') ? video.source : `${BASE_URL}/public/videos/${video.source.split('/').pop()}`);
      }
    };

    initVideoUrl();
  }, [video]);

  const handleVideoError = (error) => {
    console.error('Erreur de lecture vidéo:', error);
    setError('Impossible de charger la vidéo');
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    console.log('Vidéo chargée avec succès');
    setError(null);
    setIsLoading(false);
  };

  const handleFullscreenUpdate = ({ fullscreenUpdate }) => {
    if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS) {
      setIsFullscreen(false);
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    } else if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT) {
      setIsFullscreen(true);
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
    }
  };

  const handleQualityChange = async (quality) => {
    if (!video.format || !video.format[quality]) {
      console.log('Format non disponible:', quality);
      return;
    }

    setIsLoading(true);
    setSelectedQuality(quality);

    try {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        const currentPosition = status.positionMillis;
        
        const newUrl = video.format[quality].startsWith('http') 
          ? video.format[quality] 
          : `${BASE_URL}/public/videos/encoded/${video.id}/${quality}.mp4`;
        
        setCurrentVideoUrl(newUrl);
        
        await videoRef.current.loadAsync(
          { uri: newUrl },
          { positionMillis: currentPosition },
          false
        );
      }
    } catch (error) {
      console.error('Erreur lors du changement de qualité:', error);
      setError('Erreur lors du changement de qualité');
    } finally {
      setIsLoading(false);
    }
  };

  const VideoControls = () => (
    <View style={styles.controls}>
      <TouchableOpacity 
        onPress={() => setShowQualityModal(true)} 
        style={styles.controlButton}
      >
        <Ionicons name="settings-sharp" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        <Video
          ref={videoRef}
          source={{ uri: currentVideoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          shouldPlay
          onError={handleVideoError}
          onLoad={handleVideoLoad}
          onLoadStart={() => setIsLoading(true)}
          onFullscreenUpdate={handleFullscreenUpdate}
        />
        <VideoControls />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!isFullscreen && (
        <ScrollView style={styles.infoContainer}>
          <Text style={styles.title}>{video.name}</Text>
          <Text style={styles.subtitle}>Qualité: {selectedQuality}p</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={20} color="#666" />
              <Text style={styles.statText}>{video.views || 0} vues</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.statText}>
                {formatDate(video.created_at)}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Ionicons name="person-circle-outline" size={40} color="#666" />
            </View>
            <View style={styles.userData}>
              <Text style={styles.username}>
                {video.user ? video.user.username : `Utilisateur #${video.user_id}`}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <CommentSection videoId={video.id} />
        </ScrollView>
      )}

      <Modal
        visible={showQualityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQualityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner la qualité</Text>
            {QUALITY_OPTIONS.map((option) => {
              const isAvailable = video.format && video.format[option.value];
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.qualityOption,
                    selectedQuality === option.value && styles.selectedQuality,
                    !isAvailable && styles.disabledQuality
                  ]}
                  onPress={() => {
                    if (isAvailable) {
                      handleQualityChange(option.value);
                      setShowQualityModal(false);
                    }
                  }}
                  disabled={!isAvailable}
                >
                  <Text style={[
                    styles.qualityText,
                    selectedQuality === option.value && styles.selectedQualityText,
                    !isAvailable && styles.disabledQualityText
                  ]}>
                    {option.label}
                    {!isAvailable && ' (Non disponible)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQualityModal(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    marginLeft: 5,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 10,
  },
  userData: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  qualityOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedQuality: {
    backgroundColor: '#e3f2fd',
  },
  disabledQuality: {
    opacity: 0.5,
  },
  qualityText: {
    fontSize: 16,
  },
  selectedQualityText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  disabledQualityText: {
    color: '#999',
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});
