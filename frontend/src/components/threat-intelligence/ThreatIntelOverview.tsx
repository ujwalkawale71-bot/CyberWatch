import { Search, AlertTriangle, Bell, ShieldCheck } from 'lucide-react'

interface ThreatIntelOverviewProps {
  indicatorsChecked: number
  threatsConfirmed: number
  activeAlerts: number
  sourcesOnline: string
  loading?: boolean
}

export default function ThreatIntelOverview({
  indicatorsChecked,
  threatsConfirmed,
  activeAlerts,
  sourcesOnline,
  loading
}: ThreatIntelOverviewProps) {
  const cards = [
    {
      id: 'indicators_checked',
      label: 'Indicators Checked',
      value: loading ? '...' : indicatorsChecked.toLocaleString(),
      subtext: 'Total historical IOC evaluations',
      icon: Search,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'threats_confirmed',
      label: 'Threats Confirmed',
      value: loading ? '...' : threatsConfirmed.toLocaleString(),
      subtext: 'High & Critical risk detections',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'active_alerts',
      label: 'Active Alerts',
      value: loading ? '...' : activeAlerts.toLocaleString(),
      subtext: 'Unresolved security incidents',
      icon: Bell,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'sources_online',
      label: 'Sources Online',
      value: loading ? '...' : sourcesOnline,
      subtext: 'Operational threat feeds',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                {card.subtext}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
