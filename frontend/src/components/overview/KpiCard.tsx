import {
  ScanLine,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Puzzle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import type { KpiData } from '../../data/overviewData'

const iconMap = {
  ScanLine,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Puzzle
}

const colorStyles = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  red: 'bg-red-500/10 text-red-400 border border-red-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
}

export default function KpiCard({ card }: { card: KpiData }) {
  const IconComponent = iconMap[card.iconName]
  const colorClass = colorStyles[card.color]
  const isUp = card.trendType === 'up'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80">
      {/* Top Row: Icon and Trend */}
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg ${colorClass}`}>
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>
        <span
          className={`flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${
            isUp
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
              : 'bg-red-500/10 text-red-400 border border-red-500/15'
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

      {/* Bottom Row: Values */}
      <div className="mt-4 text-left">
        <div className="text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
          {card.value}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">
          {card.label}
        </div>
      </div>
    </div>
  )
}
