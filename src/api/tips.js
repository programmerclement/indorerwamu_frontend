import apiClient from '@/services/axios'

export const tipsApi = {
  getTips: () => apiClient.get('/admin/tips').then(r => r.data),
  createTip: (data) => apiClient.post('/admin/tips', data).then(r => r.data),
  updateTip: (id, data) => apiClient.put(`/admin/tips/${id}`, data).then(r => r.data),
  deleteTip: (id) => apiClient.delete(`/admin/tips/${id}`).then(r => r.data),
}
