import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

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
            <span className="text-[10px] text-slate-405 font-semibold tracking-wider block text-left">UNIFIED PROTECTION</span>
          </div>
        </div>

        {/* Center tagline */}
        <div className="my-auto max-w-md py-12 md:py-0 text-left">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Security Controls Access Recovery Services
          </h1>
          <p className="text-sm text-[#A7ADB4] mt-4 leading-relaxed font-medium">
            Retrieve workspace credential permissions or reset account password states directly using registered system administrator email addresses.
          </p>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-slate-500 font-semibold tracking-wide text-left">
          &copy; {new Date().getFullYear()} CyberWatch Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Form panel */}
      <div className="w-full md:max-w-md lg:max-w-lg bg-[#202428] flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 border-t md:border-t-0 md:border-l border-[#343A40] shadow-sm">
        <div className="max-w-sm w-full mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#F1F3F4]">Forgot Password</h2>
            <p className="text-xs text-[#A7ADB4] font-semibold">
              Enter your email and we'll send reset instructions.
            </p>
          </div>

          {/* Service status message */}
          <div className="p-3.5 bg-[#D4A72C]/10 border border-[#D4A72C]/20 text-[#D4A72C] rounded-lg text-xs font-semibold flex items-start space-x-2.5 leading-normal">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <span className="font-bold block text-[11px] uppercase tracking-wide">Development Service Warning</span>
              <span>Password reset service is currently in development. (SMTP mailing backend not connected).</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4 text-xs font-semibold text-left" onSubmit={(e) => e.preventDefault()}>
            {/* Email Address */}
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

            {/* Submit */}
            <button
              type="button"
              disabled={true}
              className="w-full py-2.5 font-bold text-white bg-[#747B82] rounded-lg shadow-sm transition-all text-center flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed mt-2"
            >
              Send Reset Link
            </button>
          </form>

          {/* Footer Navigation link */}
          <div className="text-center text-[11px] font-semibold text-[#A7ADB4] pt-2">
            <span>Remembered your password? </span>
            <Link to="/login" className="text-[#2A9D8F] hover:text-[#238276] font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
