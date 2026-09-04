import type { AlertItem } from '../../types/alerts'
import { SEVERITY_COLORS } from '../../utils/constants'

interface RecentAlertsTableProps {
  alerts: AlertItem[]
  selectedId: string
  onSelect: (id: string) => void
}

const statusBadgeStyles = {
  Blocked: 'bg-red-500/10 text-red-450 border border-red-500/20',
  Monitored: 'bg-blue-500/10 text-blue-450 border border-blue-500/20',
  Logged: 'bg-slate-800/40 text-slate-400 border border-slate-700/60',
  Warning: 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
}

export default function RecentAlertsTable({
  alerts,
  selectedId,
  onSelect
}: RecentAlertsTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[400px] hover:border-slate-700 transition-colors text-left justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Recent Alerts</h2>
          <span className="text-xs text-slate-500 mt-1 block">Security incident database capture</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All Alerts
        </button>
      </div>

      {/* Table feed scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Time</th>
              <th className="py-2.5 pb-2">Alert Name</th>
              <th className="py-2.5 pb-2">Source</th>
              <th className="py-2.5 pb-2">Type</th>
              <th className="py-2.5 pb-2 text-center">Severity</th>
              <th className="py-2.5 pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {alerts.map((alert) => {
              const isSelected = alert.id === selectedId
              const colorSet = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW
              const statusStyle = statusBadgeStyles[alert.status] || statusBadgeStyles.Logged

              return (
                <tr
                  key={alert.id}
                  onClick={() => onSelect(alert.id)}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/40 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-950/15 border-l-2 border-l-transparent'
                  }`}
                >
                  <td className="py-3 pl-2 font-mono text-[11px] text-slate-550 tabular-nums">
                    {alert.time.split(' ')[0]}
                  </td>
                  <td className="py-3 font-bold text-slate-200 max-w-[150px] truncate">
                    {alert.name}
                  </td>
                  <td className="py-3 text-slate-400 font-semibold">{alert.source}</td>
                  <td className="py-3 text-slate-450 font-medium font-mono text-[11px]">
                    {alert.type}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${statusStyle}`}
                    >
                      {alert.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
