import { Download, MoreVertical, FileText } from 'lucide-react'
import type { RecentReportItem } from '../../types/reports'

interface RecentReportsTableProps {
  reports: RecentReportItem[]
  onDownload: (name: string) => void
  onMore: (name: string) => void
}

export default function RecentReportsTable({
  reports,
  onDownload,
  onMore
}: RecentReportsTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Recent Reports</h2>
          <span className="text-xs text-slate-500 mt-1 block">Recently compiled diagnostic summaries</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All Reports
        </button>
      </div>

      {/* Table list scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Report Name</th>
              <th className="py-2.5 pb-2">Type</th>
              <th className="py-2.5 pb-2">Generated On</th>
              <th className="py-2.5 pb-2 text-center">Format</th>
              <th className="py-2.5 pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {reports.map((row) => (
              <tr key={row.id} className="hover:bg-slate-950/15 transition-colors">
                <td className="py-3 font-bold text-slate-200 truncate max-w-[160px] flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{row.name}</span>
                </td>
                <td className="py-3 text-slate-400 font-semibold">{row.type}</td>
                <td className="py-3 font-mono text-[11px] text-slate-500 tabular-nums">
                  {row.generatedOn}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${
                      row.format === 'CSV'
                        ? 'bg-blue-500/10 text-blue-450 border-blue-500/20'
                        : 'bg-red-500/10 text-red-450 border-red-500/20'
                    }`}
                  >
                    {row.format}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <button
                      onClick={() => onDownload(row.name)}
                      className="p-1 rounded bg-slate-950/20 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMore(row.name)}
                      className="p-1 rounded bg-slate-950/20 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
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
