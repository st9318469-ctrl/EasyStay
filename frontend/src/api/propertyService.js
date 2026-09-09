import axios from 'axios';
import { API_BASE_URL } from './config';

// Get all properties
export const getProperties = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/api/properties${queryParams ? `?${queryParams}` : ''}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching properties:', error);
        throw error;
    }
};

// Get single property
export const getProperty = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching property:', error);
        throw error;
    }
};

// Create property (for hosts)
export const createProperty = async (propertyData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/api/properties`, propertyData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating property:', error);
        throw error;
    }
};

// Update property
export const updateProperty = async (id, propertyData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/api/properties/${id}`, propertyData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating property:', error);
        throw error;
    }
};

// Delete property
export const deleteProperty = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/api/properties/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
    }
};

// Wishlist functions
export const addToWishlist = async (propertyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/api/wishlist`, 
            { propertyId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
};

export const removeFromWishlist = async (propertyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${propertyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
};

export const getWishlist = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
};

export const checkWishlist = async (propertyId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/wishlist/check/${propertyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking wishlist:', error);
        throw error;
    }
};
