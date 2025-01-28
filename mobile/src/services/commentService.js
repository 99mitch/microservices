import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = Platform.select({
  web: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000'
});

export const getComments = async (videoId, page = 1, perPage = 5) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.get(
      `${BASE_URL}/video/${videoId}/comments?page=${page}&perPage=${perPage}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Réponse des commentaires:', response.data);
    
    // La réponse contient {message: 'OK', data: {comments: [], pager: {}}}
    if (response.data && response.data.message === 'OK' && response.data.data && Array.isArray(response.data.data.comments)) {
      return response.data.data.comments;
    }
    
    // Si la structure est différente, retourner un tableau vide
    console.warn('Format de réponse inattendu pour les commentaires:', response.data);
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    throw new Error('Impossible de récupérer les commentaires');
  }
};

export const addComment = async (videoId, body) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await axios.post(
      `${BASE_URL}/video/${videoId}/comment`,
      { body },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Réponse ajout commentaire:', response.data);
    
    // La réponse contient {message: 'OK', data: Comment}
    if (response.data && response.data.message === 'OK' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Format de réponse invalide pour l\'ajout de commentaire');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    throw new Error('Impossible d\'ajouter le commentaire');
  }
};

// Note: La suppression n'est pas disponible dans l'API
export const deleteComment = async (videoId, commentId) => {
  throw new Error('La suppression de commentaires n\'est pas supportée par l\'API');
};
