import { Calendar, Users, Sliders } from 'lucide-react'
import { reportsDemoData } from '../../data/reportsDemoData'

export default function ScheduledReportsTable() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Scheduled Reports</h2>
        <span className="text-xs text-slate-500 mt-1 block">Active recurring compilation routines</span>
      </div>

      {/* Table grid log */}
      <div className="flex-1 my-3 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Report Name</th>
              <th className="py-2.5 pb-2">Frequency</th>
              <th className="py-2.5 pb-2">Next Run</th>
              <th className="py-2.5 pb-2 text-center">Recipients</th>
              <th className="py-2.5 pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {reportsDemoData.schedules.map((row) => (
              <tr key={row.id} className="hover:bg-slate-950/15 transition-colors">
                <td className="py-3 font-bold text-slate-200 truncate max-w-[130px] flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{row.name}</span>
                </td>
                <td className="py-3 text-slate-400 font-semibold">{row.frequency}</td>
                <td className="py-3 font-mono text-[10px] text-slate-500 tabular-nums">
                  {row.nextRun.split(', ')[1] || row.nextRun}
                </td>
                <td className="py-3 text-center text-slate-300 font-semibold">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="w-3 h-3 text-slate-550" />
                    <span className="font-mono">{row.recipients}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${
                      row.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                        : 'bg-slate-800/40 text-slate-405 border border-slate-700/60'
                    }`}
                  >
                    {row.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Button action */}
      <button
        type="button"
        className="w-full py-2 text-xs font-semibold text-slate-350 hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Manage Schedules</span>
      </button>
    </div>
  )
}
