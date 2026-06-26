import apiClient from '@/services/axios'

export const challengesApi = {
  getChallenges: () => apiClient.get('/admin/challenges').then(r => r.data),
  createChallenge: (data) => apiClient.post('/admin/challenges', data).then(r => r.data),
  updateChallenge: (id, data) => apiClient.put(`/admin/challenges/${id}`, data).then(r => r.data),
  deleteChallenge: (id) => apiClient.delete(`/admin/challenges/${id}`).then(r => r.data),
}
