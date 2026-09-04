import { Zap, RefreshCw, FileText, Sliders } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { label: 'Scan Now', icon: Zap, color: 'text-blue-500 bg-blue-500/10 border-blue-500/10' },
    { label: 'Update Intel', icon: RefreshCw, color: 'text-purple-500 bg-purple-500/10 border-purple-500/10' },
    { label: 'Generate Report', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10' },
    { label: 'Manage Policies', icon: Sliders, color: 'text-amber-500 bg-amber-500/10 border-amber-500/10' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Quick Actions</h2>
        <span className="text-xs text-slate-500 mt-1 block">Frequent operational triggers</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 bg-slate-950/20 hover:bg-slate-900 hover:border-slate-700 transition-all group active:scale-[0.98]"
            >
              <div className={`p-2 rounded-md ${action.color} mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-white text-center leading-tight">
                {action.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Aligner placeholder */}
      <div className="h-1.5" />
    </div>
  )
}
