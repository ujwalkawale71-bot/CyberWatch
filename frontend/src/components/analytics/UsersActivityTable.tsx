import { TrendingUp, Users } from 'lucide-react'
import { analyticsDemoData } from '../../data/analyticsDemoData'

export default function UsersActivityTable() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-white leading-none">Users Activity</h2>
          <span className="text-[10px] text-slate-500 mt-1 block">Activity metrics per system operator</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All
        </button>
      </div>

      {/* Table log scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2 pb-1.5">User</th>
              <th className="py-2 pb-1.5 text-right">Scans</th>
              <th className="py-2 pb-1.5 text-right">Threats</th>
              <th className="py-2 pb-1.5 text-right">Blocked</th>
              <th className="py-2 pb-1.5 text-right w-10">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {analyticsDemoData.users.map((row) => (
              <tr key={row.id} className="hover:bg-slate-955/10 transition-colors">
                <td className="py-2.5 font-bold text-slate-200 truncate max-w-[130px] flex items-center space-x-1.5">
                  <Users className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{row.user}</span>
                </td>
                <td className="py-2.5 text-right font-mono text-slate-350 tabular-nums">
                  {row.scans.toLocaleString()}
                </td>
                <td className="py-2.5 text-right font-mono text-red-400 font-bold tabular-nums">
                  {row.threats.toLocaleString()}
                </td>
                <td className="py-2.5 text-right font-mono text-emerald-450 font-bold tabular-nums">
                  {row.blocked.toLocaleString()}
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex justify-end pr-1 text-red-450">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
