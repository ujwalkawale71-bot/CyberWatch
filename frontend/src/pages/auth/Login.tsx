import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Shield, Globe, Puzzle, ShieldCheck, Search, BarChart2, Lock, Mail, Eye, EyeOff, ArrowRight, WifiOff, AlertTriangle 
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isNetworkError, setIsNetworkError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsNetworkError(false)

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.')
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please verify your credentials.'
      setError(msg)
      if (
        msg.toLowerCase().includes('network error') ||
        msg.toLowerCase().includes('connect') ||
        msg.toLowerCase().includes('port 8000') ||
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('failed to fetch')
      ) {
        setIsNetworkError(true)
      } else {
        setIsNetworkError(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleClick = () => {
    setToastMsg('Google Single Sign-On is configured via corporate identity federation.')
    setTimeout(() => setToastMsg(null), 4000)
  }

  return (
    <div className="login-page w-screen h-screen min-h-screen max-h-screen overflow-y-auto lg:overflow-hidden bg-[#040812] text-[#F1F3F4] font-sans selection:bg-[#00D2B4]/25 selection:text-white relative box-border flex flex-col lg:grid lg:grid-cols-[58%_42%]">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#00D2B4]/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] bg-[#0284C7]/[0.03] rounded-full blur-[130px] pointer-events-none" />

      {/* Floating Notification Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#07111E] border border-[#16263B] px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2.5 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2 duration-200 max-w-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-[#00D2B4] flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ════════════════ LEFT SIDE: 58% WIDTH ════════════════ */}
      <div className="relative w-full h-full flex flex-col justify-between p-[clamp(1rem,2.2vh,2.5rem)] lg:px-[clamp(2rem,3.6vw,3.5rem)] lg:py-[clamp(1.2rem,2.6vh,2.4rem)] box-border overflow-hidden">
        {/* Top: Brand Logo */}
        <div className="flex-shrink-0 flex items-center space-x-3 text-left mb-[clamp(0.75rem,2vh,1.6rem)]">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#00D2B4]/20 to-[#00A896]/10 border border-[#00D2B4]/50 shadow-[0_0_15px_rgba(0,210,180,0.25)]">
            {/* SVG Shield outline matching reference */}
            <svg className="w-5 h-5 text-[#00D2B4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 18s5-2.5 5-6.5V7l-5-2-5 2v4.5c0 4 5 6.5 5 6.5z" fill="#00D2B4" fillOpacity="0.25" stroke="#00D2B4" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-extrabold tracking-tight leading-none">
              <span className="text-white">Cyber</span>
              <span className="text-[#00D2B4]">Watch</span>
            </div>
            <span className="text-[8.5px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-1 block">
              UNIFIED THREAT DEFENSE
            </span>
          </div>
        </div>

        {/* Center Content Section: Headline + Radar + Feature Bar */}
        <div className="flex-1 flex flex-col justify-center max-w-xl w-full text-left my-auto">
          {/* Headline & Description */}
          <div className="space-y-1">
            <h1 className="text-[clamp(1.75rem,2.5vw,2.4rem)] font-extrabold tracking-tight leading-tight">
              <span className="text-white">Secure. Detect. </span>
              <span className="text-[#00D2B4]">Protect.</span>
            </h1>
            <p className="text-[clamp(0.75rem,0.92vw,0.875rem)] text-slate-400 font-normal leading-relaxed max-w-lg">
              Real-time threat detection, website security analysis,<br className="hidden sm:inline" /> and browser extension protection for modern security operations.
            </p>
          </div>

          {/* ── CYBERSECURITY RADAR VISUALIZATION CONTAINER ── */}
          <div className="relative w-full h-[clamp(200px,25vh,245px)] flex items-center justify-center mt-[clamp(0.75rem,1.8vh,1.4rem)]">
            {/* 1. Subtle Dotted World Map Background */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 600 300" fill="none">
              <g fill="#38BDF8" opacity="0.4">
                {/* North America dots */}
                <circle cx="90" cy="70" r="1.5" /><circle cx="105" cy="65" r="1.5" /><circle cx="120" cy="60" r="1.5" /><circle cx="135" cy="65" r="1.5" />
                <circle cx="85" cy="85" r="1.5" /><circle cx="100" cy="80" r="1.5" /><circle cx="115" cy="80" r="1.5" /><circle cx="130" cy="85" r="1.5" />
                <circle cx="145" cy="80" r="1.5" /><circle cx="95" cy="100" r="1.5" /><circle cx="110" cy="95" r="1.5" /><circle cx="125" cy="100" r="1.5" />
                <circle cx="140" cy="105" r="1.5" /><circle cx="105" cy="115" r="1.5" /><circle cx="120" cy="115" r="1.5" /><circle cx="135" cy="120" r="1.5" />
                {/* South America dots */}
                <circle cx="150" cy="160" r="1.5" /><circle cx="165" cy="165" r="1.5" /><circle cx="155" cy="180" r="1.5" /><circle cx="170" cy="185" r="1.5" />
                <circle cx="160" cy="200" r="1.5" /><circle cx="175" cy="205" r="1.5" /><circle cx="165" cy="225" r="1.5" />
                {/* Europe dots */}
                <circle cx="280" cy="65" r="1.5" /><circle cx="295" cy="60" r="1.5" /><circle cx="310" cy="65" r="1.5" /><circle cx="275" cy="80" r="1.5" />
                <circle cx="290" cy="75" r="1.5" /><circle cx="305" cy="80" r="1.5" /><circle cx="320" cy="75" r="1.5" />
                {/* Africa dots */}
                <circle cx="285" cy="115" r="1.5" /><circle cx="300" cy="110" r="1.5" /><circle cx="315" cy="115" r="1.5" /><circle cx="290" cy="135" r="1.5" />
                <circle cx="305" cy="135" r="1.5" /><circle cx="320" cy="140" r="1.5" /><circle cx="295" cy="155" r="1.5" /><circle cx="310" cy="160" r="1.5" />
                <circle cx="325" cy="165" r="1.5" /><circle cx="305" cy="185" r="1.5" /><circle cx="315" cy="190" r="1.5" />
                {/* Asia dots */}
                <circle cx="360" cy="60" r="1.5" /><circle cx="380" cy="55" r="1.5" /><circle cx="400" cy="60" r="1.5" /><circle cx="420" cy="65" r="1.5" />
                <circle cx="370" cy="80" r="1.5" /><circle cx="390" cy="75" r="1.5" /><circle cx="410" cy="80" r="1.5" /><circle cx="430" cy="85" r="1.5" />
                <circle cx="380" cy="100" r="1.5" /><circle cx="400" cy="95" r="1.5" /><circle cx="420" cy="100" r="1.5" /><circle cx="440" cy="105" r="1.5" />
                <circle cx="370" cy="120" r="1.5" /><circle cx="390" cy="125" r="1.5" /><circle cx="410" cy="130" r="1.5" />
                {/* Australia dots */}
                <circle cx="450" cy="190" r="1.5" /><circle cx="465" cy="185" r="1.5" /><circle cx="480" cy="190" r="1.5" /><circle cx="455" cy="205" r="1.5" /><circle cx="470" cy="210" r="1.5" />
              </g>
            </svg>

            {/* 2. Perspective Cyber Grid at the bottom */}
            <div 
              className="absolute inset-x-0 bottom-0 h-28 opacity-25 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(0, 210, 180, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 210, 180, 0.15) 1px, transparent 1px)',
                backgroundSize: '24px 16px',
                transform: 'perspective(300px) rotateX(60deg)',
                transformOrigin: 'bottom center',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)'
              }}
            />

            {/* 3. Radar Circle Graphics & Sweep */}
            <div className="relative w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] flex items-center justify-center">
              {/* Concentric Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-[#00D2B4]/20" />
              <div className="absolute inset-6 rounded-full border border-[#00D2B4]/25" />
              <div className="absolute inset-13 rounded-full border border-[#00D2B4]/30" />
              <div className="absolute inset-19 rounded-full border border-[#00D2B4]/40" />

              {/* Crosshairs */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#00D2B4]/25" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#00D2B4]/25" />

              {/* Diagonal 45° line */}
              <div className="absolute w-full h-[1px] bg-[#00D2B4]/20 rotate-45 pointer-events-none" />

              {/* Subtle Scanning Radar Sector (45° wedge) */}
              <div 
                className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none opacity-40"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(0, 210, 180, 0.45) 0deg, rgba(0, 210, 180, 0.1) 45deg, transparent 65deg)'
                }}
              />

              {/* Connection Lines & Glowing Nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 220 220" fill="none">
                {/* Horizontal line to left card */}
                <line x1="55" y1="110" x2="0" y2="110" stroke="#00D2B4" strokeWidth="1" strokeOpacity="0.8" />
                <circle cx="55" cy="110" r="3" fill="#00D2B4" className="animate-pulse" />

                {/* Horizontal line to right card */}
                <line x1="165" y1="110" x2="220" y2="110" stroke="#00D2B4" strokeWidth="1" strokeOpacity="0.8" />
                <circle cx="165" cy="110" r="3" fill="#00D2B4" className="animate-pulse" />

                {/* Vertical line to bottom card */}
                <line x1="110" y1="165" x2="110" y2="220" stroke="#00D2B4" strokeWidth="1" strokeOpacity="0.8" />
                <circle cx="110" cy="165" r="3" fill="#00D2B4" className="animate-pulse" />

                {/* Decorative nodes on radar rings */}
                <circle cx="172" cy="62" r="2.5" fill="#00D2B4" opacity="0.9" />
                <circle cx="68" cy="152" r="2" fill="#00D2B4" opacity="0.7" />
              </svg>

              {/* Central Shield Icon with Checkmark */}
              <div className="relative z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-[#04141F] border border-[#00D2B4] text-[#00D2B4] shadow-[0_0_20px_rgba(0,210,180,0.4)]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#00D2B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* ── THREE FLOATING SECURITY STATUS CARDS ── */}
            {/* Card 1: URL Scanning (Left) */}
            <div className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 bg-[#07111E]/95 border border-[#16273D] rounded-xl p-3 shadow-lg flex flex-col justify-between w-[125px] sm:w-[135px] text-left">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-4 h-4 text-[#00D2B4]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D2B4] shadow-[0_0_6px_#00D2B4]" />
              </div>
              <div className="text-[11px] font-semibold text-white leading-tight">URL Scanning</div>
              <div className="text-[10px] font-semibold text-[#00D2B4] mt-0.5">Active</div>
            </div>

            {/* Card 2: Website Security (Right) */}
            <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 bg-[#07111E]/95 border border-[#16273D] rounded-xl p-3 shadow-lg flex flex-col justify-between w-[125px] sm:w-[135px] text-left">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-4 h-4 text-[#00D2B4]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D2B4] shadow-[0_0_6px_#00D2B4]" />
              </div>
              <div className="text-[11px] font-semibold text-white leading-tight">Website Security</div>
              <div className="text-[10px] font-semibold text-[#00D2B4] mt-0.5">Monitoring</div>
            </div>

            {/* Card 3: Extension Audit (Bottom Center) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 bg-[#07111E]/95 border border-[#16273D] rounded-xl px-3.5 py-2 shadow-lg flex items-center space-x-2.5 text-left">
              <Puzzle className="w-4 h-4 text-[#00D2B4] flex-shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-white leading-tight">Extension Audit</div>
                <div className="text-[10px] font-semibold text-[#00D2B4] leading-tight">Protected</div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D2B4] shadow-[0_0_6px_#00D2B4] ml-1" />
            </div>
          </div>

          {/* ── BOTTOM FEATURE BAR: Positioned naturally lower with 28px-42px breathing room below Extension Audit ── */}
          <div className="w-full mt-[clamp(28px,3.8vh,42px)]">
            <div className="w-full rounded-xl border border-[#122236] bg-[#060E1A]/80 px-3.5 py-2.5 flex items-center justify-between shadow-sm">
              {/* Item 1: Real-Time Detection */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-center">
                <ShieldCheck className="w-5 h-5 text-[#00D2B4] flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">Real-Time</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Detection</div>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-[#14243B]" />

              {/* Item 2: Secure Analysis */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-center">
                <Search className="w-5 h-5 text-[#00D2B4] flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">Secure</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Analysis</div>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-[#14243B]" />

              {/* Item 3: Threat Intelligence */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-center">
                <BarChart2 className="w-5 h-5 text-[#00D2B4] flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">Threat</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Intelligence</div>
                </div>
              </div>

              <div className="w-[1px] h-6 bg-[#14243B]" />

              {/* Item 4: Privacy Protected */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-center">
                <Lock className="w-5 h-5 text-[#00D2B4] flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">Privacy</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Footer: Near bottom with comfortable 60px-85px vertical clearance to feature bar */}
        <div className="flex-shrink-0 pt-[clamp(24px,4vh,50px)] flex items-center justify-between text-[11px] text-slate-500 font-normal text-left">
          <span>&copy; 2026 CyberWatch Inc.</span>
          <div className="flex items-center space-x-3">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* ════════════════ RIGHT SIDE: 42% WIDTH (LOGIN CARD) ════════════════ */}
      <div className="w-full h-full flex flex-col justify-center items-center p-[clamp(1rem,2.2vh,2.5rem)] bg-[#040812] box-border overflow-hidden">
        <div className="w-full max-w-[420px] my-auto">
          {/* Main Login Card matching reference image */}
          <div className="rounded-[20px] border border-[rgba(56,96,138,0.35)] bg-[#07111E]/95 shadow-2xl p-[clamp(1.4rem,2.4vh,2.2rem)] text-left box-border backdrop-blur-md">
            {/* Top Center Circular Shield Icon */}
            <div className="w-14 h-14 rounded-full bg-[#051C26] border border-[#00A896]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,210,180,0.2)] mx-auto mb-3.5">
              <Shield className="w-7 h-7 text-[#00D2B4]" />
            </div>

            {/* Heading & Subheading */}
            <div className="text-center space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
              <p className="text-[12px] text-slate-400 font-normal mt-1">
                Sign in to access your security workspace.
              </p>
            </div>

            {/* Horizontal Divider */}
            <div className="border-t border-[#132338] w-full my-4" />

            {/* Error Banners */}
            {error && isNetworkError && (
              <div className="mb-3.5 p-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded-lg text-[11px] flex items-start space-x-2">
                <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[10px] text-amber-200">
                    Connection Unavailable
                  </span>
                  <span className="text-amber-300/90 font-normal leading-tight">{error}</span>
                </div>
              </div>
            )}

            {error && !isNetworkError && (
              <div className="mb-3.5 p-2.5 bg-red-500/10 border border-red-500/25 text-red-300 rounded-lg text-[11px] flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-medium text-slate-300 block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="name@company.com"
                    className="w-full h-11 pl-10 pr-3.5 bg-[#040A14] border border-[#18283E] rounded-lg focus:outline-none focus:border-[#00D2B4] focus:ring-1 focus:ring-[#00D2B4] text-white text-xs placeholder-slate-500 transition-all disabled:opacity-50"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-medium text-slate-300 block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-10 bg-[#040A14] border border-[#18283E] rounded-lg focus:outline-none focus:border-[#00D2B4] focus:ring-1 focus:ring-[#00D2B4] text-white text-xs placeholder-slate-500 transition-all disabled:opacity-50"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center space-x-2 text-slate-300 font-normal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="w-3.5 h-3.5 border-[#18283E] text-[#00D2B4] focus:ring-[#00D2B4] rounded bg-[#040A14] cursor-pointer accent-[#00D2B4]"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#00D2B4] hover:underline font-normal transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 px-4 font-semibold text-sm text-white bg-gradient-to-r from-[#00A896] to-[#00C4B2] hover:from-[#00B8A5] hover:to-[#00D2B4] rounded-lg shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed mt-3 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider OR */}
            <div className="relative my-4 flex items-center justify-center text-[10px] font-medium text-slate-500 select-none">
              <div className="absolute inset-x-0 h-px bg-[#132338]" />
              <span className="relative bg-[#07111E] px-3 z-10 uppercase tracking-wider">OR</span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isSubmitting}
              className="w-full h-11 border border-[#18283E] bg-[#040A14] hover:bg-[#081220] hover:border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-all flex items-center justify-center space-x-2.5 active:scale-[0.99] disabled:opacity-50"
            >
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

            {/* Bottom Account Link */}
            <div className="text-center text-[11px] text-slate-400 mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#00D2B4] font-semibold hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
