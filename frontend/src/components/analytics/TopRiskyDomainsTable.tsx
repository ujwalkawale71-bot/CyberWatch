import { TrendingUp, Globe } from 'lucide-react'
import { analyticsDemoData } from '../../data/analyticsDemoData'

export default function TopRiskyDomainsTable() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-white leading-none">Top Risky Domains</h2>
        <span className="text-xs text-slate-500 mt-1 block">Most active malicious domains in telemetry</span>
      </div>

      {/* Table scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Domain</th>
              <th className="py-2.5 pb-2 text-center">Risk Score</th>
              <th className="py-2.5 pb-2 text-right">Threats</th>
              <th className="py-2.5 pb-2 text-right w-14">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {analyticsDemoData.riskyDomains.map((row) => {
              const isCrit = row.score >= 90
              const isHigh = row.score >= 80 && row.score < 90

              return (
                <tr key={row.id} className="hover:bg-slate-955/10 transition-colors">
                  <td className="py-3 font-mono text-[11.5px] font-bold text-slate-200 truncate max-w-[170px] select-all flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-slate-550 flex-shrink-0" />
                    <span>{row.domain}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${
                        isCrit
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : isHigh
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {row.score}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-300 font-bold tabular-nums">
                    {row.threats.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end pr-2 text-red-400">
                      <TrendingUp className="w-4 h-4 animate-pulse" />
                    </div>
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
