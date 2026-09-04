import { ChevronDown, Calendar } from 'lucide-react'
import { kpiCardsData } from '../data/overviewData'
import KpiCard from '../components/overview/KpiCard'
import ThreatActivityChart from '../components/overview/ThreatActivityChart'
import ThreatDistributionChart from '../components/overview/ThreatDistributionChart'
import RealtimeAlerts from '../components/overview/RealtimeAlerts'
import UnifiedScanner from '../components/overview/UnifiedScanner'
import RiskyExtensions from '../components/overview/RiskyExtensions'
import ThreatMap from '../components/overview/ThreatMap'
import RiskGauge from '../components/overview/RiskGauge'
import ThreatIntelFeed from '../components/overview/ThreatIntelFeed'
import SystemStatus from '../components/overview/SystemStatus'
import QuickActions from '../components/overview/QuickActions'

export default function Overview() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-4 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Real-time security posture and threat intelligence summary
          </p>
        </div>

        {/* Dropdown Button */}
        <button className="flex items-center space-x-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Last 7 Days</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCardsData.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      {/* Row 2: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ThreatActivityChart />
        <ThreatDistributionChart />
        <RealtimeAlerts />
      </div>

      {/* Row 3: Scanners & Extensions & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UnifiedScanner />
        <RiskyExtensions />
        <ThreatMap />
      </div>

      {/* Row 4: Statuses, Feed & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RiskGauge />
        <ThreatIntelFeed />
        <SystemStatus />
        <QuickActions />
      </div>
    </div>
  )
}
