import apiClient from '@/services/axios'

export const articlesApi = {
  getArticles: () => apiClient.get('/admin/articles').then(r => r.data),
  createArticle: (data) => apiClient.post('/admin/articles', data).then(r => r.data),
  updateArticle: (id, data) => apiClient.put(`/admin/articles/${id}`, data).then(r => r.data),
  deleteArticle: (id) => apiClient.delete(`/admin/articles/${id}`).then(r => r.data),
}
