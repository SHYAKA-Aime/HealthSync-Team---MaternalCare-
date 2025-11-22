import api from './api';

export const visitService = {
  async getVisits() {
    const response = await api.get('/visits');
    return response.data.data;
  },

  async getVisit(id: number) {
    const response = await api.get(`/visits/${id}`);
    return response.data.data;
  },

  async getVisitsByMother(motherId: number) {
    const response = await api.get(`/visits/mother/${motherId}`);
    return response.data.data;
  },

  async createVisit(data: any) {
    const response = await api.post('/visits', data);
    return response.data;
  },

  async updateVisitStatus(visitId: number, status: 'scheduled' | 'completed' | 'cancelled') {
    const response = await api.patch(`/visits/${visitId}/status`, { status });
    return response.data;
  },
};