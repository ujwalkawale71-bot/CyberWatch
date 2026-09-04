import { Clock, Calendar, Sliders, FileText, FileCheck } from 'lucide-react'
import { reportsDemoData } from '../../data/reportsDemoData'

const iconMap = {
  Clock,
  Calendar,
  Sliders,
  FileText,
  FileCheck
}

export default function ReportTypesCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Report Types</h2>
        <span className="text-xs text-slate-500 mt-1 block">Configured distribution frequencies</span>
      </div>

      {/* Types list */}
      <div className="flex-1 my-3 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 flex flex-col justify-center">
        {reportsDemoData.reportTypes.map((type) => {
          const Icon = iconMap[type.iconName as keyof typeof iconMap] || FileText
          return (
            <div
              key={type.id}
              className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850/50 last:border-0 last:pb-0 gap-3"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1 rounded bg-slate-950/40 text-slate-500">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-300 font-bold truncate">{type.name}</span>
              </div>
              <span className="font-mono text-slate-400 font-bold tabular-nums">
                {type.count}
              </span>
            </div>
          )}
        )}
      </div>

      {/* Button Action */}
      <button
        type="button"
        className="w-full py-2 text-xs font-semibold text-slate-350 hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg transition-colors"
      >
        View All Report Types
      </button>
    </div>
  )
}
