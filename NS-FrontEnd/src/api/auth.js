import api from './config';

export const authApi = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  getCurrentUser: async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    // On s'assure que le header est présent explicitement si l'intercepteur fait défaut
    const response = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // .NET renvoie souvent l'objet directement, donc response.data est ce qu'on veut
    return response.data;
  } catch (error) {
    // ... ton code d'erreur ...
  }
},

  logout: async () => {
    try {
      // Optionnel: appeler API de déconnexion
      // await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  }
};