// API service for backend communication

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
};

// Upload API calls
export const uploadAPI = {
  uploadArtwork: async (formData) => {
    const response = await api.post('/upload/artwork', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getArtwork: async (artworkId) => {
    const response = await api.get(`/upload/artwork/${artworkId}`);
    return response.data;
  },

  deleteArtwork: async (artworkId) => {
    const response = await api.delete(`/upload/artwork/${artworkId}`);
    return response.data;
  },
};

// Gallery API calls
export const galleryAPI = {
  getAllArtworks: async (params = {}) => {
    const response = await api.get('/gallery/artworks', { params });
    return response.data;
  },

  getUserArtworks: async (userId, params = {}) => {
    const response = await api.get(`/gallery/artworks/user/${userId}`, { params });
    return response.data;
  },

  getArtworksByStyle: async (styleName, params = {}) => {
    const response = await api.get(`/gallery/artworks/style/${styleName}`, { params });
    return response.data;
  },

  getRecentArtworks: async (limit = 10) => {
    const response = await api.get('/gallery/artworks/recent', { params: { limit } });
    return response.data;
  },

  searchArtworks: async (query, params = {}) => {
    const response = await api.get('/gallery/search', { params: { q: query, ...params } });
    return response.data;
  },

  getGalleryStats: async () => {
    const response = await api.get('/gallery/stats');
    return response.data;
  },
};

// ML API calls
export const mlAPI = {
  classifyImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await api.post('/ml/classify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  classifyAndSaveArtwork: async (artworkId) => {
    const response = await api.post(`/ml/classify-and-save/${artworkId}`);
    return response.data;
  },

  styleTransfer: async (imageFile, targetStyle) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('target_style', targetStyle);
    
    const response = await api.post('/ml/style-transfer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for style transfer
    });
    return response.data;
  },

  getModelMetrics: async () => {
    const response = await api.get('/ml/model-metrics');
    return response.data;
  },
};

// Dashboard API calls
export const dashboardAPI = {
  getMetrics: async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },

  getConfusionMatrix: async () => {
    const response = await api.get('/dashboard/confusion-matrix');
    return response.data;
  },

  getUserAnalytics: async () => {
    const response = await api.get('/dashboard/user-analytics');
    return response.data;
  },

  getPlatformStats: async () => {
    const response = await api.get('/dashboard/platform-stats');
    return response.data;
  },
};

// Utility functions
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construct full URL for uploaded images
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  return `${baseUrl}/${imagePath}`;
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.detail || error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export default api;
