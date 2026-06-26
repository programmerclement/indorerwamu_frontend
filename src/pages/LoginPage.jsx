import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, WifiOff, ServerCrash, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

/* ─── helpers ─────────────────────────────────────────── */

/**
 * Maps a caught Axios error into a user-friendly { message, type } object.
 * type: 'credentials' | 'network' | 'server' | 'info' | 'generic'
 */
function parseLoginError(err) {
  // No response at all → network / backend not reachable
  if (!err.response) {
    return {
      type: 'network',
      message: 'Cannot reach the server. Make sure the backend is running and try again.',
    }
  }

  const status  = err.response.status
  const msg     = err.response?.data?.message || ''

  // 400 "Invalid credentials" → wrong email or password
  if (status === 400 && msg.toLowerCase().includes('invalid credentials')) {
    return { type: 'credentials', message: 'Incorrect email or password. Please try again.' }
  }

  // 403 suspended
  if (status === 403) {
    return { type: 'info', message: msg || 'Your account has been suspended.' }
  }

  // 500+ → server-side crash
  if (status >= 500) {
    return { type: 'server', message: 'A server error occurred. Please try again later.' }
  }

  // Everything else → use the backend message or generic
  return { type: 'generic', message: msg || 'Login failed. Please check your credentials.' }
}

const errorStyles = {
  credentials: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', Icon: AlertCircle },
  network:     { bg: 'bg-red-500/10  border-red-500/30',    text: 'text-red-400',    Icon: WifiOff },
  server:      { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', Icon: ServerCrash },
  info:        { bg: 'bg-blue-500/10  border-blue-500/30',   text: 'text-blue-400',   Icon: AlertCircle },
  generic:     { bg: 'bg-red-500/10  border-red-500/30',    text: 'text-red-400',    Icon: AlertCircle },
}

/* ─── Component ───────────────────────────────────────── */

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Login state
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)   // { type, message }

  // Forgot-password state
  const [showForgot,      setShowForgot]      = useState(false)
  const [fpEmail,         setFpEmail]         = useState('')
  const [otp,             setOtp]             = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [fpLoading,       setFpLoading]       = useState(false)
  const [fpError,         setFpError]         = useState('')
  const [fpSuccess,       setFpSuccess]       = useState(false)
  const [otpVerified,     setOtpVerified]     = useState(false)

  /* ── login submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError({ type: 'generic', message: 'Please fill in all fields.' })
      return
    }
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      if (!data.user?.isAdmin) {
        setError({ type: 'info', message: 'Access denied — admin accounts only.' })
        setLoading(false)
        return
      }
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(parseLoginError(err))
    } finally {
      setLoading(false)
    }
  }

  /* ── forgot-password submit ── */
  const handleForgot = async (e) => {
    e.preventDefault()
    setFpError('')
    if (!fpEmail) { setFpError('Please enter your email address.'); return }
    setFpLoading(true)
    try {
      const data = await authApi.forgotPassword(fpEmail)
      setFpSuccess(true)
      toast.success(data.message || 'Reset code sent to your email.')
    } catch (err) {
      if (!err.response) {
        setFpError('Cannot reach the server. Make sure the backend is running.')
      } else {
        setFpError(err.response?.data?.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setFpLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setFpError('')
    if (!fpEmail || !otp) {
      setFpError('Please enter your email and OTP.')
      return
    }
    setFpLoading(true)
    try {
      await authApi.verifyOtp({ email: fpEmail, otp })
      setOtpVerified(true)
      toast.success('OTP verified. Please enter your new password.')
    } catch (err) {
      setFpError(err.response?.data?.message || 'Unable to verify OTP.')
    } finally {
      setFpLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setFpError('')
    if (!fpEmail || !otp || !newPassword) {
      setFpError('Please complete all fields before resetting your password.')
      return
    }
    setFpLoading(true)
    try {
      const data = await authApi.resetPassword({ email: fpEmail, otp, password: newPassword })
      toast.success(data.message || 'Password reset successful.')
      backToLogin()
      setPassword('')
      setEmail(fpEmail)
    } catch (err) {
      setFpError(err.response?.data?.message || 'Unable to reset password.')
    } finally {
      setFpLoading(false)
    }
  }

  const backToLogin = () => {
    setShowForgot(false)
    setFpEmail('')
    setOtp('')
    setNewPassword('')
    setShowNewPassword(false)
    setFpError('')
    setFpSuccess(false)
    setOtpVerified(false)
  }

  /* ─── render ─────────────────────────────────────────── */

  const errStyle = error ? (errorStyles[error.type] || errorStyles.generic) : null

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 shadow-2xl shadow-blue-500/10 mb-4 p-2"
          >
            <img src="/logo.png" alt="Indorerwamu logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-100">Indorerwamu Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            {showForgot ? 'Reset your password' : 'Sign in to manage your platform'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ── Login form ── */}
            {!showForgot && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`flex items-start gap-3 ${errStyle.bg} border rounded-xl px-4 py-3`}
                    >
                      <errStyle.Icon size={16} className={`${errStyle.text} flex-shrink-0 mt-0.5`} />
                      <p className={`text-sm ${errStyle.text}`}>{error.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setFpEmail(email) }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : 'Sign in'}
                </motion.button>
              </motion.form>
            )}

            {/* ── Forgot-password form ── */}
            {showForgot && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Back */}
                <button
                  type="button"
                  onClick={backToLogin}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </button>

                {fpSuccess && !otpVerified ? (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-4"
                  >
                    <div className="text-center py-2 space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/15 mb-1">
                        <CheckCircle2 size={24} className="text-green-400" />
                      </div>
                      <p className="text-slate-200 font-medium">OTP sent to your email</p>
                      <p className="text-sm text-slate-400">Enter the 6-digit code we sent to {fpEmail}.</p>
                    </div>

                    <AnimatePresence>
                      {fpError && (
                        <motion.div
                          key="fp-err"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                        >
                          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-400">{fpError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">One-time password</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={fpLoading}
                      whileHover={{ scale: fpLoading ? 1 : 1.02 }}
                      whileTap={{ scale: fpLoading ? 1 : 0.98 }}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {fpLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying…
                        </>
                      ) : 'Verify OTP'}
                    </motion.button>
                  </motion.form>
                ) : otpVerified ? (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleResetPassword}
                    className="space-y-4"
                  >
                    <div className="text-center py-2 space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/15 mb-1">
                        <CheckCircle2 size={24} className="text-green-400" />
                      </div>
                      <p className="text-slate-200 font-medium">Create a new password</p>
                      <p className="text-sm text-slate-400">Choose a strong password for {fpEmail}.</p>
                    </div>

                    <AnimatePresence>
                      {fpError && (
                        <motion.div
                          key="fp-err"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                        >
                          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-400">{fpError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">New password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          autoComplete="new-password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={fpLoading}
                      whileHover={{ scale: fpLoading ? 1 : 1.02 }}
                      whileTap={{ scale: fpLoading ? 1 : 0.98 }}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {fpLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Resetting…
                        </>
                      ) : 'Reset password'}
                    </motion.button>
                  </motion.form>
                ) : (
                  /* Forgot form */
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-4">
                        Enter your account email and we will send a one-time password to your inbox.
                      </p>

                      {/* Error */}
                      <AnimatePresence>
                        {fpError && (
                          <motion.div
                            key="fp-err"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4"
                          >
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{fpError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={fpEmail}
                          onChange={e => setFpEmail(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={fpLoading}
                      whileHover={{ scale: fpLoading ? 1 : 1.02 }}
                      whileTap={{ scale: fpLoading ? 1 : 0.98 }}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      {fpLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : 'Send OTP'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {!showForgot && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Admin access only · Unauthorized access is prohibited
            </p>
          )}
        </div>

      </motion.div>
    </div>
  )
}
