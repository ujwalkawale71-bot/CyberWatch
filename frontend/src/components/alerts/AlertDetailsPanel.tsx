import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Play } from 'lucide-react'
import type { AlertItem } from '../../types/alerts'
import { SEVERITY_COLORS } from '../../utils/constants'

interface AlertDetailsPanelProps {
  alert: AlertItem
}

const statusBadgeStyles = {
  Blocked: 'bg-red-500/10 text-red-450 border border-red-500/20',
  Monitored: 'bg-blue-500/10 text-blue-450 border border-blue-500/20',
  Logged: 'bg-slate-800/40 text-slate-400 border border-slate-700/60',
  Warning: 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
}

export default function AlertDetailsPanel({ alert }: AlertDetailsPanelProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleActionClick = (actionName: string) => {
    setToastMsg(`Action "${actionName}" logged locally (backend not connected)`)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  const severityColor = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW
  const statusColor = statusBadgeStyles[alert.status] || statusBadgeStyles.Logged

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left overflow-hidden">
      {/* Toast overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-white tracking-tight">{alert.name}</h2>
            <span
              className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded border leading-none ${severityColor.bg} ${severityColor.text} ${severityColor.border}`}
            >
              {alert.severity}
            </span>
            <span
              className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded border leading-none ${statusColor}`}
            >
              {alert.status.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium block">
            Time Detected: {alert.time}
          </span>
        </div>
      </div>

      {/* Two-Column Key-Value details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 py-4 text-xs border-b border-slate-850">
        {alert.details.keyValues.map((kv) => (
          <div key={kv.label} className="flex justify-between py-1 border-b border-slate-850/30 last:border-0">
            <span className="text-slate-450 font-medium">{kv.label}:</span>
            <span
              className={`font-bold font-mono text-[11px] truncate max-w-[220px] ${
                kv.isColored && kv.severity
                  ? SEVERITY_COLORS[kv.severity].text
                  : 'text-slate-200'
              }`}
            >
              {kv.value}
            </span>
          </div>
        ))}
      </div>

      {/* Description Block */}
      <div className="py-4 border-b border-slate-850">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h3>
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {alert.details.description}
        </p>
      </div>

      {/* Three Columns: Matched Indicators / Recommended Actions / Related IOCs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
        {/* Col 1: Matched Indicators */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Matched Indicators</h4>
          <ul className="space-y-2">
            {alert.details.matchedIndicators.map((ind, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 font-medium leading-relaxed">{ind}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2: Recommended Actions */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Actions</h4>
          <div className="flex flex-col space-y-2">
            {alert.details.recommendedActions.map((act) => (
              <button
                key={act}
                onClick={() => handleActionClick(act)}
                className="flex items-center space-x-2 py-2 px-3 rounded bg-slate-950/40 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-left font-bold"
              >
                <Play className="w-3 h-3 text-blue-500 fill-current" />
                <span>{act}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Col 3: Related IOCs */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Related IOCs</h4>
          <div className="p-3 rounded bg-slate-950/20 border border-slate-850 space-y-2">
            {alert.details.relatedIocs.map((ioc) => (
              <div key={ioc.label} className="space-y-0.5 border-b border-slate-850/50 pb-1.5 last:border-0 last:pb-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  {ioc.label}
                </span>
                <span className="font-mono text-[10.5px] font-bold text-slate-300 block truncate max-w-full select-all">
                  {ioc.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
