import api from './axios';

// 1. Authentication Endpoints
export const register = (data) => api.post('/auth/register', data);

export const login = async (data) => {
    const response = await api.post('/auth/login', data);
    if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
    }
    if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
};

export const getMe = () => api.get('/auth/me');

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (api.defaults?.headers?.common?.Authorization) {
        delete api.defaults.headers.common.Authorization;
    }
};

// 2. Profile Management
export const updateProfile = (data) => api.put('/profile', data);
export const changePassword = (data) => api.put('/profile/change-password', data);

// 3. Password Reset
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });

// 4. Wishlist Operations
export const addToWishlist = (propertyId) => api.post('/wishlist', { propertyId });
export const removeFromWishlist = (propertyId) => api.delete(`/wishlist/${propertyId}`);
export const toggleWishlist = (propertyId) => api.post('/wishlist', { propertyId });
export const getWishlist = () => api.get('/wishlist');