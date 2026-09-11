import { History, Search } from 'lucide-react'
import type { RecentIntelligenceItem } from '../../types/threatIntelligence'

interface RecentIntelligenceTableProps {
  items: RecentIntelligenceItem[]
  onSelectIOC: (ioc: string) => void
}

export default function RecentIntelligenceTable({
  items,
  onSelectIOC
}: RecentIntelligenceTableProps) {
  const threatLevelBadges: Record<string, string> = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    CLEAN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    SAFE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Recent Security Intelligence
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical indicators evaluated and persisted in the CyberWatch database.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No historical scan records available in database yet. Run an investigation above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Indicator</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Risk Score</th>
                <th className="pb-3 font-semibold">Evaluated</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {items.map((item) => {
                const badgeColor = threatLevelBadges[item.threat_level] || threatLevelBadges.CLEAN
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-3 font-mono text-slate-200 max-w-[220px] truncate" title={item.indicator}>
                      {item.indicator}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-400">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-slate-300 font-medium">
                      {item.category}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${badgeColor}`}>
                        {item.threat_level}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-white font-bold">
                      {item.risk_score}
                    </td>
                    <td className="py-3 pr-3 text-slate-500 text-[11px]">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectIOC(item.indicator)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        title="Re-investigate IOC"
                      >
                        <Search className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
