import { FileText, ShieldCheck, ShieldOff, AlertTriangle, FileWarning, Percent } from 'lucide-react'
import type { KpiCardData } from '../../types/policyEngine'

const iconMap = {
  FileText,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  FileWarning,
  Percent
}

const colorMap = {
  'pol-kpi-1': 'text-blue-500 bg-blue-500/10 border-blue-500/15',
  'pol-kpi-2': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15',
  'pol-kpi-3': 'text-purple-500 bg-purple-500/10 border-purple-500/15',
  'pol-kpi-4': 'text-red-500 bg-red-500/10 border-red-500/15',
  'pol-kpi-5': 'text-amber-500 bg-amber-500/10 border-amber-500/15',
  'pol-kpi-6': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15'
}

interface PolicyKpiRowProps {
  kpis: KpiCardData[]
}

export default function PolicyKpiRow({ kpis }: PolicyKpiRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((card) => {
        const IconComponent = iconMap[card.iconName] || FileText
        const colorClass = colorMap[card.id as keyof typeof colorMap] || 'text-slate-400 bg-slate-900 border-slate-800'

        return (
          <div
            key={card.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors text-left"
          >
            {/* Top row: Icon & Status */}
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg border ${colorClass}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              {card.id === 'pol-kpi-6' && (
                <span className="text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded border leading-none bg-emerald-500/10 text-emerald-450 border-emerald-500/25">
                  EXCELLENT
                </span>
              )}
            </div>

            {/* Bottom Row */}
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono tabular-nums leading-none">
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
