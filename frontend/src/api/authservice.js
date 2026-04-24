import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');
export const logout   = ()     => localStorage.removeItem('token');
export const updateProfile  = (data) => api.put('/auth/updateprofile', data);
export const changePassword = (data) => api.put('/auth/changepassword', data);
export const toggleWishlist = (id)   => api.post(`/auth/wishlist/${id}`);