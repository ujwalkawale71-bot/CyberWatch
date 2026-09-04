import { ScanLine, Shield, ShieldCheck, AlertTriangle, Puzzle, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { KpiCardData } from '../../types/analytics'

const iconMap = {
  ScanLine,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Puzzle,
  Users
}

interface AnalyticsKpiRowProps {
  kpis: KpiCardData[]
}

export default function AnalyticsKpiRow({ kpis }: AnalyticsKpiRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((card) => {
        const IconComponent = iconMap[card.iconName] || Shield
        const isUp = card.trendType === 'up'
        const isDownTrend = card.id === 'an-kpi-5' // Extensions drop is neutral/favorable

        return (
          <div
            key={card.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors text-left"
          >
            {/* Top row: Icon & Trend */}
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-slate-955 text-slate-450 border border-slate-850">
                <IconComponent className="w-5 h-5" />
              </div>

              <span
                className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border leading-none ${
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/15'
                    : isDownTrend
                    ? 'bg-slate-800/40 text-slate-400 border-slate-700'
                    : 'bg-red-500/10 text-red-450 border-red-500/15'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {card.trend}
              </span>
            </div>

            {/* Bottom Row */}
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
                {card.value}
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wider block">
                {card.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
