import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleClick = () => {
    setToastMsg('Google Authentication is currently unavailable (Backend connection coming soon).')
    setTimeout(() => setToastMsg(null), 4000)
  }

  return (
    <div className="min-h-screen bg-[#111315] flex flex-col md:flex-row text-[#F1F3F4] font-sans">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#202428] border border-[#343A40] px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-3 duration-250 max-w-sm">
          <AlertTriangle className="w-4.5 h-4.5 text-[#D4A72C] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#A7ADB4]">{toastMsg}</span>
        </div>
      )}

      {/* Left side: Branding */}
      <div className="flex-1 bg-[#181B1F] text-white flex flex-col justify-between p-8 md:p-12 lg:p-16 select-none border-r border-[#343A40]/40">
        {/* Top brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2A9D8F] text-white shadow-sm">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight block text-left">CyberWatch</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block text-left">UNIFIED PROTECTION</span>
          </div>
        </div>

        {/* Center tagline */}
        <div className="my-auto max-w-md py-12 md:py-0 text-left">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Unified Web &amp; Browser Threat Detection Platform
          </h1>
          <p className="text-sm text-[#A7ADB4] mt-4 leading-relaxed font-medium">
            Monitor, scan, and secure client browsers and remote network connections from a single centralized operations console.
          </p>

          {/* Feature points */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" />
              <span className="text-xs font-bold text-slate-350">AI-Powered Security</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" />
              <span className="text-xs font-bold text-slate-355">Real-Time Threat Detection</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" />
              <span className="text-xs font-bold text-slate-360">Web &amp; Browser Protection</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" />
              <span className="text-xs font-bold text-slate-365">Privacy First</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-slate-500 font-semibold tracking-wide text-left">
          &copy; {new Date().getFullYear()} CyberWatch Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Panel */}
      <div className="w-full md:max-w-md lg:max-w-lg bg-[#202428] flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 border-t md:border-t-0 md:border-l border-[#343A40] shadow-sm">
        <div className="max-w-sm w-full mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#F1F3F4]">Welcome Back</h2>
            <p className="text-xs text-[#A7ADB4] font-semibold">Sign in to your account</p>
          </div>

          {/* Form error block */}
          {error && (
            <div className="p-3 bg-[#D9534F]/10 border border-[#D9534F]/20 text-[#D9534F] rounded-lg text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-left">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cyberwatch.ai"
                className="w-full px-3.5 py-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg focus:outline-none focus:border-[#2A9D8F] text-[#F1F3F4] font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-[#A7ADB4]">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#2A9D8F] hover:text-[#238276] font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg focus:outline-none focus:border-[#2A9D8F] text-[#F1F3F4] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#A7ADB4] hover:text-[#F1F3F4]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-[#3A4147] text-[#2A9D8F] focus:ring-[#2A9D8F] rounded bg-[#171A1D] cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-[#A7ADB4] cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 font-bold text-white bg-[#2A9D8F] hover:bg-[#238276] rounded-lg shadow-sm transition-all text-center flex items-center justify-center space-x-2 disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Social login separator */}
          <div className="relative my-4 flex items-center justify-center text-[10px] uppercase font-bold text-[#747B82] select-none">
            <div className="absolute inset-x-0 h-[1px] bg-[#343A40]" />
            <span className="relative bg-[#202428] px-3.5 z-10">or continue with</span>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-2.5 border border-[#343A40] bg-[#202428] hover:bg-[#272C30] text-xs font-bold text-[#F1F3F4] rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            {/* Inline Google SVG Icon */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.03-1.37-1.19-2.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Footer Navigation link */}
          <div className="text-center text-[11px] font-semibold text-[#A7ADB4] pt-2">
            <span>Don't have an account? </span>
            <Link to="/signup" className="text-[#2A9D8F] hover:text-[#238276] font-bold">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
