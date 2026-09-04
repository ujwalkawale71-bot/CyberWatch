import { Database, Link2, Server, Puzzle, FileText, Activity } from 'lucide-react'
import type { KpiCardData } from '../../types/databaseExplorer'

const iconMap = {
  Database,
  Link2,
  Server,
  Puzzle,
  FileText,
  Activity
}

interface DbKpiRowProps {
  kpis: KpiCardData[]
}

export default function DbKpiRow({ kpis }: DbKpiRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((card) => {
        const IconComponent = iconMap[card.iconName] || Database

        return (
          <div
            key={card.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors text-left"
          >
            {/* Top row: Icon box */}
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-slate-955 text-slate-450 border border-slate-850">
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-4">
              <div className="text-xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
                {card.value}
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wider block">
                {card.label}
              </span>
              <span className="text-[10px] text-slate-550 font-medium font-sans block mt-1 leading-none">
                {card.subtext}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
