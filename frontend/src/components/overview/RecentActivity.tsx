import { ShieldCheck, Activity } from 'lucide-react'
import type { RecentSecurityActivity } from '../../api/dashboard'
import { SEVERITY_COLORS } from '../../utils/constants'

interface RecentActivityProps {
  activities?: RecentSecurityActivity[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const activityList = activities || []

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <h2 className="text-base font-bold text-white leading-none">Recent Security Activity</h2>
          <span className="text-xs text-slate-500 mt-1 block">Live security scans & inspection events</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
          <span>{activityList.length} Events</span>
        </div>
      </div>

      {/* Activity Feed Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {activityList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center py-10 px-4">
            <ShieldCheck className="w-8 h-8 text-slate-600 mb-2 opacity-60" />
            <span className="font-semibold text-slate-300">No security activity yet.</span>
            <span className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
              Run a scan to start building your security activity history.
            </span>
          </div>
        ) : (
          activityList.map((item) => {
            const sevKey = (item.risk_level || 'SAFE').toUpperCase() as keyof typeof SEVERITY_COLORS
            const colorSet = SEVERITY_COLORS[sevKey] || SEVERITY_COLORS.SAFE

            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900 transition-colors flex items-start justify-between gap-3 text-left group"
              >
                <div className="flex-1 min-w-0">
                  {/* Top line: Severity badge + Event title */}
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                    <span
                      className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                    >
                      {item.risk_level}
                    </span>
                    <h3 className="text-xs font-bold text-slate-200 truncate">
                      {item.event_type}
                    </h3>
                  </div>

                  {/* Middle line: Target */}
                  <p
                    className="text-[11px] text-slate-400 font-mono truncate leading-normal"
                    title={item.target}
                  >
                    {item.target}
                  </p>

                  {/* Bottom line: Risk score info */}
                  <div className="mt-1 text-[10px] text-slate-500 font-medium flex items-center space-x-2">
                    <span>
                      Risk Score:{' '}
                      <span className={`font-mono font-bold ${colorSet.text}`}>
                        {item.risk_score} / 100
                      </span>
                    </span>
                    {item.findings_count > 0 && (
                      <>
                        <span className="text-slate-700">•</span>
                        <span>{item.findings_count} finding{item.findings_count > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Relative Timestamp */}
                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap pt-0.5">
                  {item.timestamp}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

