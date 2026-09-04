import type { AICheckItem } from '../../types/extensionScanner'
import { SEVERITY_COLORS } from '../../utils/constants'

interface AIAnalysisSummaryProps {
  checks: AICheckItem[]
}

export default function AIAnalysisSummary({ checks }: AIAnalysisSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">AI Analysis Summary</h2>
        <span className="text-xs text-slate-500 mt-1 block">Heuristic indicators & safety checks</span>
      </div>

      {/* Checks list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
        {checks.map((check) => {
          const colorSet = SEVERITY_COLORS[check.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.LOW

          return (
            <div
              key={check.id}
              className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850/50 last:border-0 last:pb-0 gap-3"
            >
              <span className="text-slate-400 font-semibold truncate max-w-[120px] sm:max-w-none">
                {check.name}
              </span>
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-slate-200 font-medium truncate max-w-[140px] sm:max-w-[200px] font-mono text-[11px]">
                  {check.finding}
                </span>
                <span
                  className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none flex-shrink-0 ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                >
                  {check.severity}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
