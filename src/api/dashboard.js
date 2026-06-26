import apiClient from '@/services/axios'

export const dashboardApi = {
  getStats: () => apiClient.get('/admin/stats').then(r => r.data),
}
