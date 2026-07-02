import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Mail, Lock, Phone,
  AlertCircle, CheckCircle2, WifiOff, ServerCrash, ArrowLeft,
} from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/auth'
import toast from 'react-hot-toast'

/* ─── helpers ─────────────────────────────────────────── */

function parseLoginError(err) {
  if (!err.response) {
    return { type: 'network', message: 'Unable to reach the server due to a network problem. Please try again.' }
  }
  const status = err.response.status
  const msg = err.response?.data?.message || ''
  if (status === 400 && msg.toLowerCase().includes('invalid credentials')) {
    return { type: 'credentials', message: 'Incorrect email or password. Please try again.' }
  }
  if (status === 403) {
    return { type: 'info', message: msg || 'Your account has been suspended.' }
  }
  if (status >= 500) {
    return { type: 'server', message: 'A server error occurred. Please try again later.' }
  }
  return { type: 'generic', message: msg || 'Login failed. Please check your credentials.' }
}

const errorStyles = {
  credentials: { bg: 'bg-amber-500/10 border-amber-500/30',  text: 'text-amber-400',  Icon: AlertCircle  },
  network:     { bg: 'bg-red-500/10  border-red-500/30',     text: 'text-red-400',    Icon: WifiOff      },
  server:      { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', Icon: ServerCrash  },
  info:        { bg: 'bg-blue-500/10  border-blue-500/30',   text: 'text-blue-400',   Icon: AlertCircle  },
  generic:     { bg: 'bg-red-500/10  border-red-500/30',     text: 'text-red-400',    Icon: AlertCircle  },
}

const inputCls = 'w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all'
const submitCls = 'w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20'

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
}

function FpErrorBanner({ msg }) {
  if (!msg) return null
  return (
    <motion.div
      key="fp-err"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
    >
      <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-400">{msg}</p>
    </motion.div>
  )
}

/* ─── Component ───────────────────────────────────────── */

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // ── Login
  const [loginMode, setLoginMode]     = useState('email') // 'email' | 'phone'
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  // ── Phone login
  const [phone, setPhone]             = useState('')
  const [phoneOtp, setPhoneOtp]       = useState('')
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneSending, setPhoneSending] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)

  // ── Google
  const [googleLoading, setGoogleLoading] = useState(false)

  // ── Forgot password
  const [showForgot, setShowForgot]   = useState(false)
  const [fpMode, setFpMode]           = useState('email') // 'email' | 'phone'
  const [fpEmail, setFpEmail]         = useState('')
  const [fpPhone, setFpPhone]         = useState('')
  const [otp, setOtp]                 = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPwd, setShowNewPwd]   = useState(false)
  const [fpLoading, setFpLoading]     = useState(false)
  const [fpError, setFpError]         = useState('')
  const [fpSent, setFpSent]           = useState(false)  // OTP request succeeded
  const [otpVerified, setOtpVerified] = useState(false)

  /* ── helpers ── */
  const tabBtn = (active) => clsx(
    'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all',
    active ? 'bg-slate-600 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
  )

  const switchLoginMode = (mode) => {
    setLoginMode(mode)
    setError(null)
    setPhone('')
    setPhoneOtp('')
    setPhoneOtpSent(false)
  }

  /* ── Google sign-in ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null)
    setGoogleLoading(true)
    try {
      const data = await authApi.googleSignIn(credentialResponse.credential)
      if (!data.user?.isAdmin) {
        setError({ type: 'info', message: 'Access denied — admin accounts only.' })
        return
      }
      login(data.token, data.user)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(parseLoginError(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  /* ── Email login ── */
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

  /* ── Phone login ── */
  const handleSendPhoneOtp = async () => {
    setError(null)
    if (!phone) { setError({ type: 'generic', message: 'Please enter your phone number.' }); return }
    setPhoneSending(true)
    try {
      await authApi.sendPhoneLoginOtp(phone)
      setPhoneOtpSent(true)
      toast.success('Verification code sent to your phone.')
    } catch (err) {
      setError(parseLoginError(err))
    } finally {
      setPhoneSending(false)
    }
  }

  const handlePhoneLogin = async (e) => {
    e.preventDefault()
    setError(null)
    if (!phone || !phoneOtp) {
      setError({ type: 'generic', message: 'Please enter your phone number and verification code.' })
      return
    }
    setPhoneLoading(true)
    try {
      const data = await authApi.phoneLogin(phone, phoneOtp)
      if (!data.user?.isAdmin) {
        setError({ type: 'info', message: 'Access denied — admin accounts only.' })
        return
      }
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(parseLoginError(err))
    } finally {
      setPhoneLoading(false)
    }
  }

  /* ── Forgot password ── */
  const handleForgot = async (e) => {
    e.preventDefault()
    setFpError('')
    setFpLoading(true)
    try {
      if (fpMode === 'phone') {
        if (!fpPhone) { setFpError('Please enter your phone number.'); return }
        await authApi.sendPhoneResetOtp(fpPhone)
        setFpSent(true)
        toast.success('Reset code sent to your phone.')
      } else {
        if (!fpEmail) { setFpError('Please enter your email address.'); return }
        const data = await authApi.forgotPassword(fpEmail)
        setFpSent(true)
        toast.success(data.message || 'Reset code sent to your email.')
      }
    } catch (err) {
      if (!err.response) {
        setFpError('Unable to reach the server due to a network problem. Please try again.')
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
    if (!otp) { setFpError('Please enter the verification code.'); return }
    setFpLoading(true)
    try {
      const id = fpMode === 'phone' ? { phone: fpPhone } : { email: fpEmail }
      await authApi.verifyOtp({ ...id, otp })
      setOtpVerified(true)
      toast.success('Code verified. Please enter your new password.')
    } catch (err) {
      setFpError(err.response?.data?.message || 'Unable to verify code.')
    } finally {
      setFpLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setFpError('')
    if (!newPassword) { setFpError('Please enter a new password.'); return }
    setFpLoading(true)
    try {
      const id = fpMode === 'phone' ? { phone: fpPhone } : { email: fpEmail }
      const data = await authApi.resetPassword({ ...id, otp, password: newPassword })
      toast.success(data.message || 'Password reset successful.')
      backToLogin()
      setPassword('')
      if (fpMode === 'email') setEmail(fpEmail)
    } catch (err) {
      setFpError(err.response?.data?.message || 'Unable to reset password.')
    } finally {
      setFpLoading(false)
    }
  }

  const backToLogin = () => {
    setShowForgot(false)
    setFpMode('email')
    setFpEmail('')
    setFpPhone('')
    setOtp('')
    setNewPassword('')
    setShowNewPwd(false)
    setFpError('')
    setFpSent(false)
    setOtpVerified(false)
  }

  /* ─── render ─────────────────────────────────────────── */
  const errStyle = error ? (errorStyles[error.type] || errorStyles.generic) : null
  const fpContact = fpMode === 'phone' ? fpPhone : fpEmail

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
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

            {/* ════ LOGIN ════ */}
            {!showForgot && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Mode tabs */}
                <div className="flex gap-1 p-1 bg-slate-700/40 rounded-xl">
                  <button type="button" onClick={() => switchLoginMode('email')} className={tabBtn(loginMode === 'email')}>
                    <Mail size={14} /> Email
                  </button>
                  <button type="button" onClick={() => switchLoginMode('phone')} className={tabBtn(loginMode === 'phone')}>
                    <Phone size={14} /> Phone
                  </button>
                </div>

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

                <AnimatePresence mode="wait">
                  {/* ── Email form ── */}
                  {loginMode === 'email' && (
                    <motion.form
                      key="email-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Email address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            className={clsx(inputCls, 'pl-11 pr-4')}
                            autoComplete="email"
                          />
                        </div>
                      </div>

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
                            className={clsx(inputCls, 'pl-11 pr-12')}
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

                      <motion.button
                        type="submit"
                        disabled={loading || googleLoading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={submitCls}
                      >
                        {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
                      </motion.button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-xs text-slate-500">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                      </div>

                      <div className={`flex justify-center transition-opacity ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => setError({ type: 'generic', message: 'Google Sign-In failed. Please try again.' })}
                          theme="filled_black"
                          shape="rectangular"
                          text="signin_with"
                          width="368"
                        />
                      </div>
                    </motion.form>
                  )}

                  {/* ── Phone form ── */}
                  {loginMode === 'phone' && (
                    <motion.form
                      key="phone-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={handlePhoneLogin}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Phone number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+250 7XX XXX XXX"
                            className={clsx(inputCls, 'pl-11 pr-4', phoneOtpSent && 'opacity-60 cursor-not-allowed')}
                            autoComplete="tel"
                            disabled={phoneOtpSent}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {phoneOtpSent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1.5 overflow-hidden"
                          >
                            <label className="block text-sm font-medium text-slate-300">Verification code</label>
                            <input
                              type="text"
                              value={phoneOtp}
                              onChange={e => setPhoneOtp(e.target.value)}
                              placeholder="123456"
                              className={clsx(inputCls, 'px-4')}
                              autoComplete="one-time-code"
                              inputMode="numeric"
                              maxLength={6}
                              autoFocus
                            />
                            <p className="text-xs text-slate-500">Code sent to {phone}. Valid for 10 minutes.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!phoneOtpSent ? (
                        <motion.button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneSending}
                          whileHover={{ scale: phoneSending ? 1 : 1.02 }}
                          whileTap={{ scale: phoneSending ? 1 : 0.98 }}
                          className={submitCls}
                        >
                          {phoneSending ? <><Spinner /> Sending…</> : 'Send verification code'}
                        </motion.button>
                      ) : (
                        <div className="space-y-2">
                          <motion.button
                            type="submit"
                            disabled={phoneLoading}
                            whileHover={{ scale: phoneLoading ? 1 : 1.02 }}
                            whileTap={{ scale: phoneLoading ? 1 : 0.98 }}
                            className={submitCls}
                          >
                            {phoneLoading ? <><Spinner /> Signing in…</> : 'Sign in'}
                          </motion.button>
                          <button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            disabled={phoneSending}
                            className="w-full text-xs text-slate-400 hover:text-blue-400 transition-colors py-1 disabled:opacity-50"
                          >
                            {phoneSending ? 'Sending…' : 'Resend code'}
                          </button>
                        </div>
                      )}
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ════ FORGOT PASSWORD ════ */}
            {showForgot && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <button
                  type="button"
                  onClick={backToLogin}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to login
                </button>

                {/* Mode toggle — hidden once OTP is sent */}
                {!fpSent && (
                  <div className="flex gap-1 p-1 bg-slate-700/40 rounded-xl">
                    <button type="button" onClick={() => { setFpMode('email'); setFpError('') }} className={tabBtn(fpMode === 'email')}>
                      <Mail size={14} /> Email
                    </button>
                    <button type="button" onClick={() => { setFpMode('phone'); setFpError('') }} className={tabBtn(fpMode === 'phone')}>
                      <Phone size={14} /> Phone
                    </button>
                  </div>
                )}

                {/* ── Step 1: send OTP ── */}
                {!fpSent && (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <p className="text-sm text-slate-400">
                      {fpMode === 'phone'
                        ? 'Enter your registered phone number and we will send a reset code via SMS.'
                        : 'Enter your account email and we will send a one-time password to your inbox.'}
                    </p>

                    <AnimatePresence>
                      {fpError && <FpErrorBanner msg={fpError} />}
                    </AnimatePresence>

                    {fpMode === 'phone' ? (
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Phone number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="tel"
                            value={fpPhone}
                            onChange={e => setFpPhone(e.target.value)}
                            placeholder="+250 7XX XXX XXX"
                            className={clsx(inputCls, 'pl-11 pr-4')}
                            autoComplete="tel"
                            autoFocus
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Email address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            value={fpEmail}
                            onChange={e => setFpEmail(e.target.value)}
                            placeholder="admin@example.com"
                            className={clsx(inputCls, 'pl-11 pr-4')}
                            autoComplete="email"
                            autoFocus
                          />
                        </div>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={fpLoading}
                      whileHover={{ scale: fpLoading ? 1 : 1.02 }}
                      whileTap={{ scale: fpLoading ? 1 : 0.98 }}
                      className={submitCls}
                    >
                      {fpLoading ? <><Spinner /> Sending…</> : 'Send code'}
                    </motion.button>
                  </form>
                )}

                {/* ── Step 2: verify OTP ── */}
                {fpSent && !otpVerified && (
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
                      <p className="text-slate-200 font-medium">Code sent</p>
                      <p className="text-sm text-slate-400">
                        Enter the 6-digit code we sent to{' '}
                        <span className="text-slate-200">{fpContact}</span>.
                      </p>
                    </div>

                    <AnimatePresence>
                      {fpError && <FpErrorBanner msg={fpError} />}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">One-time code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        className={clsx(inputCls, 'px-4')}
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
                      className={submitCls}
                    >
                      {fpLoading ? <><Spinner /> Verifying…</> : 'Verify code'}
                    </motion.button>
                  </motion.form>
                )}

                {/* ── Step 3: new password ── */}
                {otpVerified && (
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
                      <p className="text-sm text-slate-400">Choose a strong password for your account.</p>
                    </div>

                    <AnimatePresence>
                      {fpError && <FpErrorBanner msg={fpError} />}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-300">New password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className={clsx(inputCls, 'pl-11 pr-12')}
                          autoComplete="new-password"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={fpLoading}
                      whileHover={{ scale: fpLoading ? 1 : 1.02 }}
                      whileTap={{ scale: fpLoading ? 1 : 0.98 }}
                      className={submitCls}
                    >
                      {fpLoading ? <><Spinner /> Resetting…</> : 'Reset password'}
                    </motion.button>
                  </motion.form>
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
