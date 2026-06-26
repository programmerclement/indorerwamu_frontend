import apiClient from '@/services/axios'

export const rewardsApi = {
  getRewards: () => apiClient.get('/admin/rewards').then(r => r.data),
}
