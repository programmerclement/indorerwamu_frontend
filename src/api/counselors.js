import apiClient from '@/services/axios'

export const counselorsApi = {
  getCounselors: ()           => apiClient.get('/admin/counselors').then(r => r.data),
  createCounselor: (data)     => apiClient.post('/admin/counselors', data).then(r => r.data),
  updateCounselor: (id, data) => apiClient.put(`/admin/counselors/${id}`, data).then(r => r.data),
  deleteCounselor: (id)       => apiClient.delete(`/admin/counselors/${id}`).then(r => r.data),
}
