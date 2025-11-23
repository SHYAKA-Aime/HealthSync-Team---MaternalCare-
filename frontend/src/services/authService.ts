import api from './api';
import { saveToken, saveUser } from '../utils/auth';

interface RegisterData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      saveToken(response.data.token);
      saveUser(response.data.user);
    }
    return response.data;
  },

  async login(identifier: string, password: string) {
    try {
      // Clear any existing tokens first to prevent auth state issues
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');
      const loginData = isEmail 
        ? { email: identifier, password }
        : { phone: identifier, password };
      
      const response = await api.post('/auth/login', loginData);
      
      if (response.data.success) {
        saveToken(response.data.token);
        saveUser(response.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      // Make sure tokens stay cleared on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Re-throw the error so the Login component can handle it
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};