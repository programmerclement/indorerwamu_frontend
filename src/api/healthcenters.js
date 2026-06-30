import apiClient from '@/services/axios'

export const healthCentersApi = {
  getHealthCenters: ()           => apiClient.get('/admin/healthcenters').then(r => r.data),
  createHealthCenter: (data)     => apiClient.post('/admin/healthcenters', data).then(r => r.data),
  updateHealthCenter: (id, data) => apiClient.put(`/admin/healthcenters/${id}`, data).then(r => r.data),
  deleteHealthCenter: (id)       => apiClient.delete(`/admin/healthcenters/${id}`).then(r => r.data),
}
