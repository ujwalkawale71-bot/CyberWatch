import { threatIntelligenceDemoData } from '../../data/threatIntelligenceDemoData'
import { SEVERITY_COLORS } from '../../utils/constants'

export default function TrendingThreats() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-base font-bold text-white leading-none">Trending Threats (Last 7 Days)</h2>
        <span className="text-xs text-slate-500 mt-1 block">Highest volume growth rate indicators</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2 pb-1.5 text-center w-8">Rank</th>
              <th className="py-2 pb-1.5">Indicator</th>
              <th className="py-2 pb-1.5">Type</th>
              <th className="py-2 pb-1.5 text-right">Growth</th>
              <th className="py-2 pb-1.5 text-right w-16">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50">
            {threatIntelligenceDemoData.trendingThreats.map((row) => {
              const colorSet = SEVERITY_COLORS[row.severity] || SEVERITY_COLORS.LOW

              return (
                <tr key={row.rank} className="hover:bg-slate-955/10 transition-colors">
                  <td className="py-2.5 font-bold font-mono text-[11px] text-slate-500 text-center">
                    {row.rank}
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-slate-200 truncate max-w-[140px] select-all">
                    {row.indicator}
                  </td>
                  <td className="py-2.5 text-slate-400 font-semibold">{row.type}</td>
                  <td className="py-2.5 text-right font-mono text-emerald-450 font-bold tabular-nums">
                    {row.growth}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                    >
                      {row.severity}
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
