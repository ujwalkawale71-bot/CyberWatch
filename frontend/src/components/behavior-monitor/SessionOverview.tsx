import type { SessionOverviewItem } from '../../types/behaviorMonitor'
import { SEVERITY_COLORS } from '../../utils/constants'

interface SessionOverviewProps {
  data?: SessionOverviewItem[]
}

export default function SessionOverview({ data = [] }: SessionOverviewProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Security Environment & Session</h2>
        <span className="text-xs text-slate-500 mt-1 block">Live operational state & architecture telemetry</span>
      </div>

      {/* Key-Value Details */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left flex flex-col justify-center">
        {data.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-6">
            No session context available.
          </div>
        ) : (
          data.map((item) => {
            const colorSet = item.badgeType
              ? SEVERITY_COLORS[item.badgeType as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.LOW
              : null

            return (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850/50 last:border-0 last:pb-0 gap-3"
              >
                <span className="text-slate-450 font-medium">{item.label}</span>
                {item.isBadge && colorSet ? (
                  <span
                    className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span className="text-slate-200 font-bold font-mono text-[11px] text-right truncate max-w-[240px]">
                    {item.value}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
