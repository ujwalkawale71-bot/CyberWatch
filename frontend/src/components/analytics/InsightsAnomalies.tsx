import { Link2, Puzzle, ShieldAlert, Users, Activity } from 'lucide-react'
import { analyticsDemoData } from '../../data/analyticsDemoData'
import { SEVERITY_COLORS } from '../../utils/constants'

const iconMap = {
  'ins-1': Link2,
  'ins-2': Puzzle,
  'ins-3': ShieldAlert,
  'ins-4': Users,
  'ins-5': Activity
}

export default function InsightsAnomalies() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Insights & Anomalies</h2>
          <span className="text-xs text-slate-500 mt-1 block">Heuristic intelligence flags</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All
        </button>
      </div>

      {/* Scroll feed list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {analyticsDemoData.insights.map((insight) => {
          const Icon = iconMap[insight.id as keyof typeof iconMap] || Activity
          const colorSet = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.LOW

          return (
            <div
              key={insight.id}
              className="p-3 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-slate-900 transition-colors flex items-start space-x-3"
            >
              {/* Left Icon box */}
              <div className="p-2 rounded bg-slate-955 text-slate-450 border border-slate-850 flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>

              {/* Right text body */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-slate-200 truncate">{insight.title}</h3>
                  <span
                    className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none flex-shrink-0 ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                  >
                    {insight.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-medium">
                  {insight.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
