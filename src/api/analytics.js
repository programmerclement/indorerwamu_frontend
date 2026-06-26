import apiClient from '@/services/axios'

export const analyticsApi = {
  getMoods: (days = 30) => apiClient.get('/admin/moods', { params: { days } }).then(r => r.data),
}
