import apiClient from '@/services/axios'

export const usersApi = {
  getUsers: (params = {}) => apiClient.get('/admin/users', { params }).then(r => r.data),
  getUser: (id) => apiClient.get(`/admin/users/${id}`).then(r => r.data),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data).then(r => r.data),
  createAdmin: (data) => apiClient.post('/admin/users/admin', data).then(r => r.data),
  suspendUser: (id) => apiClient.put(`/admin/users/${id}/suspend`).then(r => r.data),
  resetPassword: (id, password) => apiClient.put(`/admin/users/${id}/reset-password`, { password }).then(r => r.data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`).then(r => r.data),
}
