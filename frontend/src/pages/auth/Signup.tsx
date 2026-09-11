import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react'
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setIsSubmitting(true)
    try {
      await signup(name.trim(), email.trim(), password)
      navigate('/')
    } catch (err: any) {
      setError(err?.message || 'Failed to create account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="signup-page w-screen h-screen min-h-screen max-h-screen overflow-y-auto lg:overflow-hidden bg-[#040812] text-[#F1F3F4] font-sans selection:bg-[#00D2B4]/25 selection:text-white relative box-border flex flex-col lg:grid lg:grid-cols-[52%_48%]">
      {/* Subtle Ambient Teal Lighting */}
      <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-[#00D2B4]/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-[#0284C7]/[0.025] rounded-full blur-[140px] pointer-events-none" />

      {/* ════════════════ LEFT SIDE: ~52% WIDTH (TYPOGRAPHY-DRIVEN) ════════════════ */}
      <div className="relative w-full h-full flex flex-col justify-between p-[clamp(1.5rem,3.5vh,3.5rem)] lg:p-[clamp(2.5rem,5vh,4.5rem)] box-border overflow-hidden text-left">
        {/* Top: Brand Logo & Subtitle */}
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00D2B4]/15 border border-[#00D2B4]/40 text-[#00D2B4]">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-lg lg:text-xl font-extrabold tracking-tight leading-none">
              <span className="text-white">Cyber</span>
              <span className="text-[#00D2B4]">Watch</span>
            </div>
          </div>
          <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-400 uppercase mt-2 block">
            SECURE BROWSER INTELLIGENCE
          </span>
        </div>

        {/* Main Typography Narrative (Vertically Centered) */}
        <div className="my-auto py-4 max-w-lg">
          {/* Headline */}
          <h1 className="text-[clamp(2rem,3.2vw,3.25rem)] font-extrabold tracking-tight text-white leading-[1.12]">
            Build a{' '}
            <span className="bg-gradient-to-r from-[#00D2B4] via-[#00E5C8] to-[#38BDF8] bg-clip-text text-transparent">
              safer
            </span>
            <br />
            browsing workspace.
          </h1>

          {/* Description */}
          <p className="text-[clamp(0.85rem,1.05vw,1rem)] text-slate-400 font-normal leading-relaxed mt-4 max-w-md">
            Create your CyberWatch workspace and gain clear visibility into browser activity, security risks, and extension intelligence.
          </p>

          {/* 3 Elegant Minimal Text Rows (No cards, simple typography & subtle accents) */}
          <div className="mt-8 sm:mt-10 space-y-3.5 max-w-sm">
            <div className="flex items-center space-x-4 py-2 border-b border-[#142236]/70">
              <span className="font-mono text-xs font-semibold text-[#00D2B4] tracking-wider">01</span>
              <span className="w-1 h-1 rounded-full bg-[#00D2B4]/70" />
              <span className="text-xs sm:text-sm font-medium text-slate-200">Real-time protection</span>
            </div>
            <div className="flex items-center space-x-4 py-2 border-b border-[#142236]/70">
              <span className="font-mono text-xs font-semibold text-[#00D2B4] tracking-wider">02</span>
              <span className="w-1 h-1 rounded-full bg-[#00D2B4]/70" />
              <span className="text-xs sm:text-sm font-medium text-slate-200">Extension intelligence</span>
            </div>
            <div className="flex items-center space-x-4 py-2 border-b border-[#142236]/70">
              <span className="font-mono text-xs font-semibold text-[#00D2B4] tracking-wider">03</span>
              <span className="w-1 h-1 rounded-full bg-[#00D2B4]/70" />
              <span className="text-xs sm:text-sm font-medium text-slate-200">Actionable security insights</span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="flex-shrink-0 text-xs text-slate-500 font-normal tracking-wide">
          Trusted security intelligence for modern browsing.
        </div>
      </div>

      {/* ════════════════ RIGHT SIDE: ~48% WIDTH (MINIMAL REGISTRATION AREA) ════════════════ */}
      <div className="w-full h-full flex flex-col justify-center items-center p-[clamp(1.5rem,3.5vh,3.5rem)] lg:p-[clamp(2.5rem,5vh,4rem)] lg:border-l lg:border-[#132032]/60 box-border overflow-hidden">
        <div className="w-full max-w-[400px] my-auto">
          {/* Header */}
          <div className="space-y-1 mb-5 text-left">
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white">Create your account</h2>
            <p className="text-xs sm:text-[13px] text-slate-400 font-normal">
              Start securing your browsing workspace.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/25 text-red-300 rounded-lg text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-medium text-slate-300 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Jane Doe"
                className="w-full h-10 px-3.5 bg-[#080E1A] border border-[#162438] rounded-lg focus:outline-none focus:border-[#00D2B4] focus:ring-1 focus:ring-[#00D2B4] text-white text-xs placeholder-slate-500 transition-all disabled:opacity-50"
                autoComplete="name"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-medium text-slate-300 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="name@company.com"
                className="w-full h-10 px-3.5 bg-[#080E1A] border border-[#162438] rounded-lg focus:outline-none focus:border-[#00D2B4] focus:ring-1 focus:ring-[#00D2B4] text-white text-xs placeholder-slate-500 transition-all disabled:opacity-50"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-medium text-slate-300 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Create a secure password"
                  className="w-full h-10 pl-3.5 pr-10 bg-[#080E1A] border border-[#162438] rounded-lg focus:outline-none focus:border-[#00D2B4] focus:ring-1 focus:ring-[#00D2B4] text-white text-xs placeholder-slate-500 transition-all disabled:opacity-50"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-medium text-slate-300 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Confirm your password"
                  className="w-full h-10 pl-3.5 pr-10 bg-[#080E1A] border border-[#162438] rounded-lg focus:outline-none focus:border-[#00D2B4] focus:ring-1 focus:ring-[#00D2B4] text-white text-xs placeholder-slate-500 transition-all disabled:opacity-50"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2.5 pt-1 text-xs text-left">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isSubmitting}
                className="w-3.5 h-3.5 border-[#162438] text-[#00D2B4] focus:ring-[#00D2B4] rounded bg-[#080E1A] cursor-pointer accent-[#00D2B4] mt-0.5 flex-shrink-0"
              />
              <label htmlFor="agree-terms" className="text-slate-400 font-normal cursor-pointer select-none leading-snug text-[11px]">
                I agree to the{' '}
                <a href="#terms" className="text-[#00D2B4] hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#privacy" className="text-[#00D2B4] hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 px-4 font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00A896] to-[#00C4B2] hover:from-[#00B8A5] hover:to-[#00D2B4] rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed mt-3 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Link: Already have an account? Sign In */}
          <div className="text-center text-xs text-slate-400 mt-4 pt-3 border-t border-[#132032]/60">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00D2B4] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
