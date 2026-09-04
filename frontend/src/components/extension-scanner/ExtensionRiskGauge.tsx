import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'

interface ExtensionRiskGaugeProps {
  score: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  confidence: number
  engine: string
  warningMessage: string
}

const SEVERITY_CONFIG: Record<
  'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE',
  {
    label: string
    badgeClass: string
    textClass: string
    borderClass: string
    bgClass: string
    alertTextClass: string
  }
> = {
  CRITICAL: {
    label: 'Critical',
    badgeClass: 'bg-red-500/10 text-red-500 border-red-500/25',
    textClass: 'text-red-500',
    borderClass: 'border-red-500/20',
    bgClass: 'bg-red-500/5',
    alertTextClass: 'text-red-400'
  },
  HIGH: {
    label: 'High',
    badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/25',
    textClass: 'text-orange-500',
    borderClass: 'border-orange-500/20',
    bgClass: 'bg-orange-500/5',
    alertTextClass: 'text-orange-400'
  },
  MEDIUM: {
    label: 'Medium',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    textClass: 'text-amber-500',
    borderClass: 'border-amber-500/20',
    bgClass: 'bg-amber-500/5',
    alertTextClass: 'text-amber-400'
  },
  LOW: {
    label: 'Low',
    badgeClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',
    textClass: 'text-indigo-500',
    borderClass: 'border-indigo-500/20',
    bgClass: 'bg-indigo-500/5',
    alertTextClass: 'text-indigo-400'
  },
  SAFE: {
    label: 'Safe',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
    textClass: 'text-emerald-500',
    borderClass: 'border-emerald-500/20',
    bgClass: 'bg-emerald-500/5',
    alertTextClass: 'text-emerald-400'
  }
}

export default function ExtensionRiskGauge({
  score,
  severity,
  confidence,
  engine,
  warningMessage
}: ExtensionRiskGaugeProps) {
  const [scanTime, setScanTime] = useState('')

  useEffect(() => {
    const now = new Date()
    setScanTime(now.toLocaleTimeString() + ' ' + now.toLocaleDateString())
  }, [])

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] text-left hover:border-slate-700 transition-colors">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Left Side SVG Circle Gauge Dial */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="extGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="35%" stopColor="#3b82f6" />
                  <stop offset="70%" stopColor="#f59e0b" />
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
                stroke="url(#extGaugeGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Score number text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {score}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                /100
              </span>
            </div>
          </div>

          {/* Severity label warning tag */}
          <span className={`mt-2 text-[10px] font-extrabold tracking-widest px-2.5 py-0.5 rounded border leading-none shadow-sm ${config.badgeClass}`}>
            {severity}
          </span>
        </div>

        {/* Right Side Info specs */}
        <div className="flex-1 w-full space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-medium">Risk Level:</span>
            <span className={`${config.textClass} font-bold`}>{config.label}</span>
          </div>
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-medium">Confidence Rating:</span>
            <span className="text-slate-200 font-bold font-mono">{confidence}%</span>
          </div>
          <div className="flex justify-between border-b border-slate-850 pb-1.5">
            <span className="text-slate-400 font-medium">Scan Time:</span>
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

      {/* Severity-tinted warning banner */}
      <div className={`mt-4 p-3 rounded-lg border ${config.borderClass} ${config.bgClass} flex items-start space-x-2.5`}>
        <ShieldAlert className={`w-5 h-5 ${config.textClass} flex-shrink-0 mt-0.5`} />
        <p className={`text-[11px] ${config.alertTextClass} font-semibold leading-relaxed`}>
          {warningMessage}
        </p>
      </div>
    </div>
  )
}
