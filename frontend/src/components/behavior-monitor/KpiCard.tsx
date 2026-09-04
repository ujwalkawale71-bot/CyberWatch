import {
  Gauge,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Puzzle,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import type { KpiCardData } from '../../types/behaviorMonitor'
import { SEVERITY_COLORS } from '../../utils/constants'

const iconMap = {
  Gauge,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Puzzle,
  LayoutGrid
}

export default function KpiCard({ card }: { card: KpiCardData }) {
  const IconComponent = iconMap[card.iconName]
  const isUp = card.trendType === 'up'

  // Map severity badge styles if defined
  let colorSet = null
  if (card.severity) {
    colorSet = SEVERITY_COLORS[card.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.LOW
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors text-left">
      {/* Top Row: Icon and Badge/Trend */}
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-lg bg-slate-950/40 text-slate-400 border border-slate-850">
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Badge or trend display */}
        {card.trend ? (
          <span
            className={`flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded border leading-none ${
              isUp
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                : 'bg-red-500/10 text-red-400 border-red-500/15'
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {card.trend}
          </span>
        ) : card.subtext && colorSet ? (
          <span
            className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
          >
            {card.subtext}
          </span>
        ) : (
          card.subtext && (
            <span className="text-[10px] text-slate-500 font-semibold font-mono tracking-tight bg-slate-950/20 border border-slate-850/50 px-2 py-0.5 rounded leading-none">
              {card.subtext}
            </span>
          )
        )}
      </div>

      {/* Bottom values */}
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
}
