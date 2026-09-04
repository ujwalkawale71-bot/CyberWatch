import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'

interface WebsiteRiskGaugeProps {
  score: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  confidence: number
  engine: string
  warningMessage: string
}

export default function WebsiteRiskGauge({
  score,
  severity,
  confidence,
  engine,
  warningMessage
}: WebsiteRiskGaugeProps) {
  const [scanTime, setScanTime] = useState('')

  useEffect(() => {
    const now = new Date()
    setScanTime(now.toLocaleTimeString() + ' ' + now.toLocaleDateString())
  }, [])

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] text-left hover:border-slate-700 transition-colors">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Left Circular SVG Dial */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="webGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="60%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="url(#webGaugeGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {score}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                /100
              </span>
            </div>
          </div>

          {/* Severity status badge */}
          <span className="mt-2 text-[10px] font-extrabold tracking-widest px-2.5 py-0.5 rounded border leading-none bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-sm">
            {severity} RISK
          </span>
        </div>

        {/* Right scanner specs */}
        <div className="flex-1 w-full space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-medium">Risk Level:</span>
            <span className="text-orange-500 font-bold">High Risk</span>
          </div>
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-medium">Confidence Rating:</span>
            <span className="text-slate-200 font-bold font-mono">{confidence}%</span>
          </div>
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-medium">Scan Timestamp:</span>
            <span className="text-slate-300 font-semibold font-mono text-[11px]">{scanTime}</span>
          </div>
          <div className="flex justify-between pb-0.5">
            <span className="text-slate-400 font-medium">Scanner Engine:</span>
            <span className="text-slate-400 text-right font-medium max-w-[130px] sm:max-w-none truncate">
              {engine}
            </span>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-start space-x-2.5">
        <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-red-400 font-semibold leading-relaxed">
          {warningMessage}
        </p>
      </div>
    </div>
  )
}
