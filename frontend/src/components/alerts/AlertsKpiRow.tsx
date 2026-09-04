import { Bell, AlertTriangle, AlertCircle, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { KpiCardData } from '../../types/alerts'
import { SEVERITY_COLORS } from '../../utils/constants'

const iconMap = {
  'alert-kpi-1': Bell,
  'alert-kpi-2': AlertTriangle,
  'alert-kpi-3': AlertCircle,
  'alert-kpi-4': Info,
  'alert-kpi-5': Info
}

const colorMap = {
  'alert-kpi-1': 'text-blue-500 bg-blue-500/10 border-blue-500/15',
  'alert-kpi-2': 'text-red-500 bg-red-500/10 border-red-500/15',
  'alert-kpi-3': 'text-orange-500 bg-orange-500/10 border-orange-500/15',
  'alert-kpi-4': 'text-amber-500 bg-amber-500/10 border-amber-500/15',
  'alert-kpi-5': 'text-blue-450 bg-blue-500/10 border-blue-500/15'
}

interface AlertsKpiRowProps {
  kpis: KpiCardData[]
}

export default function AlertsKpiRow({ kpis }: AlertsKpiRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((card) => {
        const IconComponent = iconMap[card.id as keyof typeof iconMap] || Info
        const colorClass = colorMap[card.id as keyof typeof colorMap] || 'text-slate-400 bg-slate-900 border-slate-800'
        const isUp = card.trendType === 'up'
        const labelColor = SEVERITY_COLORS[card.severity] || SEVERITY_COLORS.LOW

        return (
          <div
            key={card.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors text-left"
          >
            {/* Top row: Icon and Trend */}
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg border ${colorClass}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span
                className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border leading-none ${
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/15'
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

            {/* Bottom metrics */}
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
                {card.value}
              </div>
              <span className={`text-xs font-semibold mt-1.5 uppercase tracking-wider block ${
                card.id === 'alert-kpi-1' ? 'text-slate-500' : labelColor.text
              }`}>
                {card.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
