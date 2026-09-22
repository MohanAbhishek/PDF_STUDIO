import api from './api';

export const authService = {
  async register(fullName, email, password, confirmPassword) {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};