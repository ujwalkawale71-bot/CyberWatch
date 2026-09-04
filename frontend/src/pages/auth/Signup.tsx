import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms and Privacy Policy')
      return
    }

    setIsSubmitting(true)
    try {
      await signup(name, email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111315] flex flex-col md:flex-row text-[#F1F3F4] font-sans">
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
            Create an Account to Protect Your Browsing Workspace
          </h1>
          <p className="text-sm text-[#A7ADB4] mt-4 leading-relaxed font-medium">
            Gain immediate insight into extension vulnerability permissions, technological stacks vulnerabilities, phishing links reputation scores, and raw behavior monitor metrics logs.
          </p>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-slate-500 font-semibold tracking-wide text-left">
          &copy; {new Date().getFullYear()} CyberWatch Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Signup Form panel */}
      <div className="w-full md:max-w-md lg:max-w-lg bg-[#202428] flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 border-t md:border-t-0 md:border-l border-[#343A40] shadow-sm">
        <div className="max-w-sm w-full mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#F1F3F4]">Create Account</h2>
            <p className="text-xs text-[#A7ADB4] font-semibold">Join the CyberWatch threat detection platform</p>
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg focus:outline-none focus:border-[#2A9D8F] text-[#F1F3F4] font-medium"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@organization.com"
                className="w-full px-3.5 py-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg focus:outline-none focus:border-[#2A9D8F] text-[#F1F3F4] font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Password</label>
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[#A7ADB4]">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#171A1D] border border-[#3A4147] rounded-lg focus:outline-none focus:border-[#2A9D8F] text-[#F1F3F4] font-medium"
              />
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start space-x-2 pt-1 text-left">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 border-[#3A4147] text-[#2A9D8F] focus:ring-[#2A9D8F] rounded bg-[#171A1D] cursor-pointer mt-0.5"
              />
              <label htmlFor="agree-terms" className="text-[#A7ADB4] cursor-pointer select-none leading-relaxed">
                <span>I agree to the </span>
                <a href="#terms" className="text-[#2A9D8F] hover:underline">Terms of Service</a>
                <span> and </span>
                <a href="#privacy" className="text-[#2A9D8F] hover:underline">Privacy Policy</a>
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
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Footer Navigation link */}
          <div className="text-center text-[11px] font-semibold text-[#A7ADB4] pt-2">
            <span>Already have an account? </span>
            <Link to="/login" className="text-[#2A9D8F] hover:text-[#238276] font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
