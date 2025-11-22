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

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      saveToken(response.data.token);
      saveUser(response.data.user);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};