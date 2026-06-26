import apiClient from '@/services/axios'

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data).then(r => r.data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then(r => r.data),
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data).then(r => r.data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data).then(r => r.data),
}
