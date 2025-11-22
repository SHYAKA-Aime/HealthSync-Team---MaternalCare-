import api from './api';

export const motherService = {
  async getMothers() {
    const response = await api.get('/mothers');
    return response.data.data;
  },

  async getMother(id: number) {
    const response = await api.get(`/mothers/${id}`);
    return response.data.data;
  },

  async createMother(data: any) {
    const response = await api.post('/mothers', data);
    return response.data;
  },

  async updateMother(id: number, data: any) {
    const response = await api.put(`/mothers/${id}`, data);
    return response.data;
  },
};
