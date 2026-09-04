import { useState, useEffect } from 'react'
import { RefreshCw, FileText, PlusCircle, Sliders, CheckCircle } from 'lucide-react'

export default function QuickActionsCard() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleAction = (label: string) => {
    setToastMsg(`Action "${label}" logged locally`)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  const actions = [
    { label: 'Update Intel Feeds', icon: RefreshCw, color: 'text-blue-500 bg-blue-500/10 border-blue-500/10' },
    { label: 'Generate Threat Report', icon: FileText, color: 'text-purple-500 bg-purple-500/10 border-purple-500/10' },
    { label: 'Add Custom IOC', icon: PlusCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10' },
    { label: 'Configure Rules', icon: Sliders, color: 'text-amber-500 bg-amber-500/10 border-amber-500/10' }
  ]

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Quick Actions</h2>
        <span className="text-xs text-slate-500 mt-1 block">Threat intelligence triggers</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 my-2 flex-1 items-center">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <button
              key={act.label}
              type="button"
              onClick={() => handleAction(act.label)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 bg-slate-950/20 hover:bg-slate-900 hover:border-slate-700 transition-all group active:scale-[0.98] h-[75px]"
            >
              <div className={`p-1.5 rounded ${act.color} mb-1.5 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-[9.5px] font-bold text-slate-350 group-hover:text-white text-center leading-tight">
                {act.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
