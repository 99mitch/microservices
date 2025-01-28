import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// En développement, utilisez localhost pour le web et 10.0.2.2 pour Android (émulateur)
const BASE_URL = Platform.select({
  web: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000', // Pour l'émulateur Android
  ios: 'http://192.168.1.98:8000',    // Pour iOS
  default: 'http://localhost:8000'
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 minutes de timeout par défaut
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: false,
});

// Configuration des intercepteurs
api.interceptors.request.use(
  async (config) => {
    // Pour toutes les requêtes
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de la configuration finale
    console.log('🔵 Configuration de la requête:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data ? JSON.stringify(config.data).substring(0, 500) : undefined
    });

    return config;
  },
  (error) => {
    console.error('❌ Erreur de configuration:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse reçue:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Erreur serveur:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('❌ Erreur réseau:', {
        request: error.request,
        config: error.config
      });
    } else {
      console.error('❌ Erreur de configuration:', error.message);
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    console.log('🔵 Tentative de connexion avec:', { username });
    
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    console.log('🔵 Données de connexion préparées:', formData.toString());

    const response = await api.post('/auth', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
    });

    console.log('✅ Réponse complète:', response);
    console.log('✅ Données de réponse:', response.data);

    if (!response.data) {
      console.error('❌ Pas de données dans la réponse');
      throw new Error('Pas de données dans la réponse');
    }

    const { token, user } = response.data;
    
    if (!token) {
      console.error('❌ Pas de token dans la réponse');
      throw new Error('Pas de token dans la réponse');
    }

    console.log('✅ Token reçu, stockage...');
    await AsyncStorage.setItem('userToken', token);
    
    if (user) {
      console.log('✅ Données utilisateur reçues:', user);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userId', user.id.toString());
    }

    return {
      success: true,
      data: {
        token: token,
        user: user
      }
    };

  } catch (error) {
    console.error('❌ Erreur détaillée:', {
      message: error.message,
      response: error.response,
      data: error.response?.data
    });

    return {
      success: false,
      error: error.message || 'Échec de la connexion'
    };
  }
};

export const register = async (username, email, password) => {
  try {
    console.log('🔵 Tentative d\'inscription avec:', { 
      username, 
      email,
      passwordLength: password.length 
    });

    // Les données doivent être envoyées en JSON selon le modèle UserCreate
    const data = {
      username: username,
      email: email,
      password: password,
      pseudo: username  // Optionnel, on utilise le username par défaut
    };

    console.log('🔵 Données d\'inscription préparées:', {
      ...data,
      password: '[MASQUÉ]'
    });

    const response = await api.post('/user', data);

    console.log('✅ Réponse d\'inscription:', {
      status: response.status,
      data: response.data
    });

    if (response.data) {
      console.log('✅ Inscription réussie, tentative de connexion automatique...');
      try {
        const loginResponse = await login(username, password);
        console.log('✅ Connexion automatique réussie:', loginResponse.data);
        return response;
      } catch (loginError) {
        console.error('⚠️ Échec de la connexion automatique:', loginError);
        // On continue même si la connexion automatique échoue
        return response;
      }
    }

    return response;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      console.error('❌ Erreur serveur:', {
        status: error.response.status,
        data: errorData
      });

      // Gestion des erreurs spécifiques
      if (error.response.status === 400) {
        if (errorData.detail === "User already exists") {
          throw new Error('Un utilisateur avec ce nom ou cet email existe déjà');
        }
      }
      
      throw new Error(errorData.detail || 'Échec de l\'inscription');
    }
    console.error('❌ Erreur réseau:', error);
    throw new Error('Erreur de connexion au serveur');
  }
};

export const updateProfile = async (userId, data) => {
  try {
    console.log('🔵 Tentative de mise à jour du profil:', { 
      userId, 
      ...data,
      password: '[MASQUÉ]'
    });

    // Les données doivent être envoyées en JSON selon le modèle UserCreate
    const userUpdate = {
      username: data.username,
      email: data.email,
      password: data.password,
      pseudo: data.pseudo || data.username
    };

    const response = await api.put(`/user/${userId}`, userUpdate);
    console.log('✅ Réponse de mise à jour:', {
      status: response.status,
      data: response.data
    });

    // Après la mise à jour réussie, on se reconnecte pour obtenir un nouveau token
    if (response.data && response.data.data) {
      console.log('✅ Mise à jour réussie, obtention d\'un nouveau token...');
      try {
        const loginResponse = await login(data.username, data.password);
        console.log('✅ Nouveau token obtenu');
        return response.data;
      } catch (loginError) {
        console.error('⚠️ Erreur lors de l\'obtention du nouveau token:', loginError);
        throw loginError;
      }
    }

    return response.data;
  } catch (error) {
    console.error('❌ Erreur de mise à jour du profil:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getVideos = async () => {
  try {
    console.log('🔵 Récupération des vidéos...');
    const response = await api.get('/videos');
    console.log('✅ Réponse des vidéos:', response.data);
    
    // Retourner directement les données de la réponse
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vidéos:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error('Impossible de récupérer les vidéos');
  }
};

export const getUserVideos = async (userId) => {
  try {
    console.log('🔵 Récupération des vidéos de l\'utilisateur:', userId);
    const response = await api.get(`/user/${userId}/videos`);
    console.log('✅ Réponse des vidéos utilisateur:', response.data);
    
    // Retourner directement les données de la réponse
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vidéos utilisateur:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error('Impossible de récupérer les vidéos de l\'utilisateur');
  }
};

export const uploadVideo = async (userId, name, file) => {
  try {
    console.log('Starting video upload:', { 
      userId, 
      name, 
      file: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });
    
    // Vérifier le token avant l'upload
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token before upload:', token);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    console.log('FormData created, sending request...');

    const response = await api.post(`/user/${userId}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`, // Ajouter explicitement le token
      },
      transformRequest: [(data) => data],
    });
    
    console.log('Upload response:', response.data);

    // Déclencher l'encodage après l'upload réussi avec un timeout plus long
    if (response.data && response.data.id) {
      try {
        console.log('Starting video encoding...');
        const encodeResponse = await api.post(
          `/video/${response.data.id}/encode`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 300000, // 5 minutes de timeout pour l'encodage
          }
        );
        console.log('Encoding started:', encodeResponse.data);
      } catch (encodeError) {
        console.error('Error starting encoding:', encodeError);
        // On ne relance pas l'erreur car l'upload a réussi
      }
    }

    return response;
  } catch (error) {
    console.error('Upload Video API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

export const updateVideo = async (videoId, data) => {
  try {
    const response = await api.put(`/video/${videoId}`, data);
    return response;
  } catch (error) {
    console.error('Update Video API error:', error);
    throw error;
  }
};

export const deleteVideo = async (videoId) => {
  try {
    const response = await api.delete(`/video/${videoId}`);
    return response;
  } catch (error) {
    console.error('Delete Video API error:', error);
    throw error;
  }
};

export const getVideoComments = async (videoId) => {
  try {
    const response = await api.get(`/video/${videoId}/comments`);
    return response;
  } catch (error) {
    console.error('Get Video Comments API error:', error);
    throw error;
  }
};

export const addComment = async (videoId, body) => {
  try {
    const response = await api.post(`/video/${videoId}/comment`, { body });
    return response;
  } catch (error) {
    console.error('Add Comment API error:', error);
    throw error;
  }
};

export const searchVideos = async (params) => {
  try {
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
};

export default api;
