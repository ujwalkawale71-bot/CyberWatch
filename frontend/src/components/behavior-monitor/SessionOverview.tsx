import { behaviorMonitorDemoData } from '../../data/behaviorMonitorDemoData'
import { SEVERITY_COLORS } from '../../utils/constants'

export default function SessionOverview() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Current Session Overview</h2>
        <span className="text-xs text-slate-500 mt-1 block">Active agent configuration details</span>
      </div>

      {/* Key-Value Details */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left flex flex-col justify-center">
        {behaviorMonitorDemoData.sessionOverview.map((item) => {
          const colorSet = item.badgeType
            ? SEVERITY_COLORS[item.badgeType as keyof typeof SEVERITY_COLORS]
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
                <span className="text-slate-200 font-bold font-mono text-[11px] text-right truncate max-w-[200px]">
                  {item.value}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
