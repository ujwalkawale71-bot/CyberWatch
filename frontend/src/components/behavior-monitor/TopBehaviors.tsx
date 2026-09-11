import { Code, Share2, Key, RefreshCw, AlertOctagon, ShieldCheck } from 'lucide-react'
import type { SuspiciousBehaviorItem } from '../../types/behaviorMonitor'

interface TopBehaviorsProps {
  data?: SuspiciousBehaviorItem[]
}

const iconMap: Record<string, any> = {
  'beh-1': Code,
  'beh-2': Share2,
  'beh-3': Key,
  'beh-4': RefreshCw,
  'beh-5': AlertOctagon
}

export default function TopBehaviors({ data = [] }: TopBehaviorsProps) {
  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count), 1) : 1

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Top Suspicious Behaviors</h2>
          <span className="text-xs text-slate-500 mt-1 block">Correlated anomaly patterns in selected period</span>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
          {data.length} Detected
        </div>
      </div>

      {/* Behaviors list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-300">No Behaviour Anomaly Patterns</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All monitored activity is operating within baseline security thresholds.
            </p>
          </div>
        ) : (
          data.map((item) => {
            const IconComponent = iconMap[item.id] || AlertOctagon
            const pct = Math.min(100, Math.round((item.count / maxCount) * 100))

            return (
              <div key={item.id} className="space-y-1.5">
                {/* Labels row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <IconComponent className="w-3.5 h-3.5" style={{ color: item.color }} />
                    <span className="font-semibold text-slate-200">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-bold tabular-nums">
                    {item.count}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-slate-850/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
