import { Code, Share2, Key, RefreshCw, AlertOctagon } from 'lucide-react'
import { behaviorMonitorDemoData } from '../../data/behaviorMonitorDemoData'

const iconMap = {
  'beh-1': Code,
  'beh-2': Share2,
  'beh-3': Key,
  'beh-4': RefreshCw,
  'beh-5': AlertOctagon
}

export default function TopBehaviors() {
  const maxCount = 8

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Top Suspicious Behaviors</h2>
          <span className="text-xs text-slate-500 mt-1 block">Most frequent anomaly types</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All
        </button>
      </div>

      {/* Behaviors list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {behaviorMonitorDemoData.topBehaviors.map((item) => {
          const IconComponent = iconMap[item.id as keyof typeof iconMap] || Code
          const pct = (item.count / maxCount) * 100

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
        })}
      </div>
    </div>
  )
}
