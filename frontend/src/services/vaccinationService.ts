import api from './api';

export const vaccinationService = {
  async getVaccinations() {
    const response = await api.get('/vaccinations');
    return response.data.data;
  },

  async getVaccination(id: number) {
    const response = await api.get(`/vaccinations/${id}`);
    return response.data.data;
  },

  async getVaccinationsByChild(childId: number) {
    const response = await api.get(`/vaccinations/child/${childId}`);
    return response.data.data;
  },

  async createVaccination(data: any) {
    const response = await api.post('/vaccinations', data);
    return response.data;
  },
};