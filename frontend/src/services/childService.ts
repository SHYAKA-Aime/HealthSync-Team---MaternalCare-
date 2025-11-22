import api from './api';

export const childService = {
  async getChildren() {
    const response = await api.get('/children');
    return response.data.data;
  },

  async getChild(id: number) {
    const response = await api.get(`/children/${id}`);
    return response.data.data;
  },

  async getChildrenByMother(motherId: number) {
    const response = await api.get(`/children/mother/${motherId}`);
    return response.data.data;
  },

  async createChild(data: any) {
    const response = await api.post('/children', data);
    return response.data;
  },

  async updateChild(id: number, data: any) {
    const response = await api.put(`/children/${id}`, data);
    return response.data;
  },
};