import axios from 'axios';

const LOCAL_API_BASE_URL = 'http://localhost:8000';
const isLocalFrontend =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In local development, always hit the local backend to avoid stale/incorrect .env endpoints.
const API_BASE_URL = (
  isLocalFrontend ? LOCAL_API_BASE_URL : (import.meta.env.VITE_API_URL || LOCAL_API_BASE_URL)
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Properties ---

export const getProperties = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/api/properties${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', {
      baseURL: API_BASE_URL,
      status: error?.response?.status,
      message: error?.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getProperty = async (id) => {
  try {
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/api/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const response = await api.put(`/api/properties/${id}`, propertyData);
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

export const deleteProperty = async (id) => {
  try {
    const response = await api.delete(`/api/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// --- Wishlist ---

export const addToWishlist = async (propertyId) => {
  try {
    const response = await api.post('/api/wishlist', { propertyId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (propertyId) => {
  try {
    const response = await api.delete(`/api/wishlist/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const getWishlist = async () => {
  try {
    const response = await api.get('/api/wishlist');
    return response.data;
  } catch (error) {
    // Expired/invalid token should not break public pages.
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      return { success: true, wishlist: [] };
    }
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const checkWishlist = async (propertyId) => {
  try {
    const response = await api.get(`/api/wishlist/check/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};
