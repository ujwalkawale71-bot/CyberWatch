import { CheckCircle, XCircle, AlertCircle, HelpCircle, Shield } from 'lucide-react'
import type { SourceRecord } from '../../types/threatIntelligence'

interface SourceAnalysisGridProps {
  sources: SourceRecord[]
}

export default function SourceAnalysisGrid({ sources }: SourceAnalysisGridProps) {
  const getStatusBadge = (status: SourceRecord['status']) => {
    switch (status) {
      case 'DETECTED':
        return {
          label: 'Threat Detected',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: XCircle
        }
      case 'NOT_DETECTED':
        return {
          label: 'Clean / No Match',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle
        }
      case 'NOT_CONFIGURED':
        return {
          label: 'Not Configured',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: HelpCircle
        }
      case 'RATE_LIMITED':
        return {
          label: 'Rate Limited',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertCircle
        }
      case 'NOT_SUPPORTED':
        return {
          label: 'IOC Not Supported',
          color: 'bg-slate-800 text-slate-500 border-slate-700',
          icon: HelpCircle
        }
      default:
        return {
          label: 'Query Failed',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: AlertCircle
        }
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          Threat Intelligence Feeds Analysis
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time individual responses from integrated external security vendors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => {
          const badge = getStatusBadge(src.status)
          const Icon = badge.icon

          return (
            <div
              key={src.source}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="font-semibold text-sm text-white">{src.source}</div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                </div>

                {src.target_queried && (
                  <div className="text-[10px] text-slate-500 font-mono truncate" title={src.target_queried}>
                    Target: <span className="text-slate-400">{src.target_queried}</span>
                  </div>
                )}

                <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {src.reason || src.error || 'Query executed successfully.'}
                </div>

                {src.detections && src.detections.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {src.detections.map((det, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300"
                      >
                        <span className="font-bold uppercase tracking-wider">{det.category}:</span> {det.evidence}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  HTTP Status: {src.http_status ? `HTTP ${src.http_status}` : 'N/A'}
                </span>
                <span>
                  Checked: {new Date(src.checked_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
