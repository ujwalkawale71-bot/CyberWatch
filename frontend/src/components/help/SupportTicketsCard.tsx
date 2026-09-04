import type { SupportTicketItem } from '../../types/help'
import { SEVERITY_COLORS } from '../../utils/constants'

interface SupportTicketsCardProps {
  tickets: SupportTicketItem[]
  onAction: (msg: string) => void
}

export default function SupportTicketsCard({ tickets, onAction }: SupportTicketsCardProps) {
  const counts = [
    { label: 'Open', val: 2 },
    { label: 'In Progress', val: 1 },
    { label: 'Resolved', val: 18 },
    { label: 'Closed', val: 56 }
  ]

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-455 border border-amber-500/20'
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
      default:
        return 'bg-slate-800/40 text-slate-405 border border-slate-700/60'
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left space-y-4 justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-sm font-bold text-white leading-none">Support Tickets</h2>
          <span className="text-[10px] text-slate-550 mt-1 block">Your recent support tickets</span>
        </div>
        <button
          onClick={() => onAction('Tickets query opened locally (backend not connected)')}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All Tickets
        </button>
      </div>

      {/* Counts Grid */}
      <div className="grid grid-cols-4 gap-2 text-center p-2 bg-slate-950/20 border border-slate-850 rounded-lg text-xs font-semibold">
        {counts.map((item) => (
          <div key={item.label} className="border-r last:border-0 border-slate-850/50 py-0.5">
            <span className="font-mono text-sm font-bold text-slate-200 block">{item.val}</span>
            <span className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5 block scale-90">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Ticket listings */}
      <div className="space-y-2.5 flex-1">
        {tickets.map((t) => {
          const colorSet = SEVERITY_COLORS[t.priority] || SEVERITY_COLORS.LOW

          return (
            <div
              key={t.id}
              className="p-2.5 rounded border border-slate-850 bg-slate-955/15 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center space-x-1.5 font-bold text-slate-250">
                  <span className="font-mono text-[10px] text-slate-500">{t.id}</span>
                  <span className="truncate max-w-[140px] block leading-none">{t.title}</span>
                </div>
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <span className="text-[7.5px] font-extrabold tracking-wider scale-90">PRIORITY:</span>
                  <span className={`text-[7px] font-extrabold tracking-wider px-1 py-0.2 rounded leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}>
                    {t.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="font-mono text-[9px] text-slate-550 font-semibold">{t.date}</span>
                <span className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${getStatusStyle(t.status)}`}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
