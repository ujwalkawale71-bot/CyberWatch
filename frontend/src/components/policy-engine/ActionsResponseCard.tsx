import { Ban, AlertOctagon, History, Bell, ShieldX } from 'lucide-react'
import { policyEngineDemoData } from '../../data/policyEngineDemoData'

const iconMap = {
  Block: Ban,
  Warn: AlertOctagon,
  Log: History,
  Notify: Bell,
  Quarantine: ShieldX
}

export default function ActionsResponseCard() {
  const actionOrder = ['Block Access', 'Log Event', 'Notify Admin']

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Actions & Response</h2>
        <span className="text-xs text-slate-500 mt-1 block">Configured enforcement countermeasures</span>
      </div>

      {/* Grid split available vs order */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 min-h-0">
        {/* Left: Available action types */}
        <div className="overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">
            Enforcement Types
          </span>
          {policyEngineDemoData.actions.map((act) => {
            const Icon = iconMap[act.iconName as keyof typeof iconMap] || Ban
            return (
              <div
                key={act.name}
                className="flex items-center space-x-2.5 p-2 rounded bg-slate-950/20 border border-slate-850 hover:bg-slate-900 transition-all text-xs"
              >
                <div className="p-1 rounded bg-slate-950/40 text-slate-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200">{act.name}</div>
                  <div className="text-[10px] text-slate-550 truncate font-semibold">{act.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Ordered action list */}
        <div className="bg-slate-950/15 border border-slate-850 rounded-lg p-3 flex flex-col justify-start space-y-3.5">
          <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">
            Default Action Order
          </span>
          <div className="space-y-2">
            {actionOrder.map((order, idx) => (
              <div
                key={order}
                className="flex items-center space-x-3 p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
              >
                <span className="font-mono text-xs font-bold text-blue-500">{idx + 1}.</span>
                <span className="font-bold text-slate-200">{order}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
