import axios from 'axios';

const api = axios.create({
  baseURL: 'https://easystay-backend-1.onrender.com/',
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
    console.error('Error fetching properties:', error);
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