import { Link } from 'react-router-dom'
import type { RealtimeAlert } from '../../data/overviewData'
import { SEVERITY_COLORS } from '../../utils/constants'

interface RealtimeAlertsProps {
  alerts?: RealtimeAlert[]
}

export default function RealtimeAlerts({ alerts }: RealtimeAlertsProps) {
  const alertList = alerts || []

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <h2 className="text-base font-bold text-white leading-none">Real-time Alerts</h2>
          <span className="text-xs text-slate-500 mt-1 block">Live security events feed</span>
        </div>
        <Link
          to="/alerts"
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Alert Feed Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {alertList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center py-12">
            <span>No recent alerts</span>
            <span className="text-[10px] text-slate-600 mt-1">Platform events will appear here in real time</span>
          </div>
        ) : (
          alertList.map((alert) => {
            const sevKey = (alert.severity || 'MEDIUM').toUpperCase() as keyof typeof SEVERITY_COLORS
            const colorSet = SEVERITY_COLORS[sevKey] || SEVERITY_COLORS.MEDIUM

            return (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900 transition-colors flex items-start justify-between gap-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                    {/* Severity Badge */}
                    <span
                      className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                    >
                      {alert.severity}
                    </span>
                    <h3 className="text-xs font-bold text-slate-200 truncate">{alert.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate leading-normal">
                    {alert.detail}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap pt-0.5">
                  {alert.timestamp}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
