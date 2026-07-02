import apiClient from '@/services/axios'

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data).then(r => r.data),
  googleSignIn: (idToken) => apiClient.post('/auth/google', { idToken }).then(r => r.data),
  sendPhoneLoginOtp: (phone) => apiClient.post('/auth/phone/send-otp', { phone }).then(r => r.data),
  phoneLogin: (phone, otp) => apiClient.post('/auth/phone/login', { phone, otp }).then(r => r.data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }).then(r => r.data),
  sendPhoneResetOtp: (phone) => apiClient.post('/auth/phone/reset-otp', { phone }).then(r => r.data),
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data).then(r => r.data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data).then(r => r.data),
}
