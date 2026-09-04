import { FileText } from 'lucide-react'
import { policyEngineDemoData } from '../../data/policyEngineDemoData'

export default function PolicyActivityLog() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Policy Activity Log</h2>
          <span className="text-xs text-slate-500 mt-1 block">Live enforcement logs stream</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View Full Activity Logs
        </button>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Time</th>
              <th className="py-2.5 pb-2">Policy</th>
              <th className="py-2.5 pb-2">Event</th>
              <th className="py-2.5 pb-2">Target</th>
              <th className="py-2.5 pb-2">User</th>
              <th className="py-2.5 pb-2 text-center">Action Taken</th>
              <th className="py-2.5 pb-2 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50">
            {policyEngineDemoData.activityLog.map((row) => (
              <tr key={row.id} className="hover:bg-slate-950/10 transition-colors">
                <td className="py-3 font-mono text-[11px] text-slate-550 tabular-nums">
                  {row.time}
                </td>
                <td className="py-3 font-bold text-slate-200 truncate max-w-[150px] flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{row.policyName}</span>
                </td>
                <td className="py-3 text-slate-400 font-semibold">{row.event}</td>
                <td className="py-3 font-mono text-[10.5px] text-slate-450 select-all truncate max-w-[150px]">
                  {row.target}
                </td>
                <td className="py-3 text-slate-400 font-semibold">{row.user}</td>
                <td className="py-3 text-center">
                  <span
                    className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${
                      row.actionTaken === 'Blocked'
                        ? 'bg-red-500/10 text-red-450 border border-red-500/20'
                        : row.actionTaken === 'Warned'
                        ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-450 border border-blue-500/20'
                    }`}
                  >
                    {row.actionTaken.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${
                      row.result === 'Success'
                        ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                        : row.result === 'Exception Applied'
                        ? 'bg-blue-500/10 text-blue-450 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                    }`}
                  >
                    {row.result.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
