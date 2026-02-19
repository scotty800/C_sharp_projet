import api from './config';

export const authApi = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data; // ✅ Retourner directement response.data
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; // ✅ Retourner directement response.data
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/users/me');
      return response.data; // ✅ Retourner directement response.data
      
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error.message);
      
      // ✅ Si erreur 400 ou 401, token invalide
      if (error.response?.status === 400 || error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      
      throw error;
    }
  },

  // Déconnexion (optionnel)
  logout: async () => {
    try {
      // Si ton API a un endpoint de déconnexion
      // await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  }
};