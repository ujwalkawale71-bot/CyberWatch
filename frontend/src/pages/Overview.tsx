import { useState, useEffect } from 'react'
import { ChevronDown, Calendar, RefreshCw } from 'lucide-react'
import { dashboardApi, type DashboardStatsResponse } from '../api/dashboard'
import KpiCard from '../components/overview/KpiCard'
import ThreatActivityChart from '../components/overview/ThreatActivityChart'
import ThreatDistributionChart from '../components/overview/ThreatDistributionChart'
import RealtimeAlerts from '../components/overview/RealtimeAlerts'
import UnifiedScanner from '../components/overview/UnifiedScanner'
import RiskyExtensions from '../components/overview/RiskyExtensions'
import RecentActivity from '../components/overview/RecentActivity'
import RiskGauge from '../components/overview/RiskGauge'
import ThreatIntelFeed from '../components/overview/ThreatIntelFeed'
import SystemStatus from '../components/overview/SystemStatus'
import QuickActions from '../components/overview/QuickActions'

type RangeOption = '7d' | '30d' | 'all'

const rangeLabels: Record<RangeOption, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  'all': 'All Time'
}

export default function Overview() {
  const [range, setRange] = useState<RangeOption>('7d')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)

  const fetchStats = async (selectedRange: RangeOption) => {
    setLoading(true)
    try {
      const data = await dashboardApi.getStats(selectedRange)
      setStats(data)
    } catch (err) {
      console.error('Failed to load dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(range)
  }, [range])

  const kpis = stats?.kpis || [
    { id: 'total-scans', label: 'Total Scans', value: '0', iconName: 'ScanLine', color: 'blue', trend: '+0.0%', trendType: 'up' },
    { id: 'threats-detected', label: 'Threats Detected', value: '0', iconName: 'Shield', color: 'red', trend: '+0.0%', trendType: 'up' },
    { id: 'blocked-threats', label: 'Blocked Threats', value: '0', iconName: 'ShieldCheck', color: 'amber', trend: '+0.0%', trendType: 'up' },
    { id: 'critical-threats', label: 'Critical Threats', value: '0', iconName: 'AlertTriangle', color: 'fuchsia', trend: '+0.0%', trendType: 'up' },
    { id: 'active-extensions', label: 'Active Extensions', value: '0', iconName: 'Puzzle', color: 'emerald', trend: '+0.0%', trendType: 'up' }
  ]

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

        {/* Action controls */}
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <button
            onClick={() => fetchStats(range)}
            title="Refresh dashboard metrics"
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Date Range Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{rangeLabels[range]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                {(Object.keys(rangeLabels) as RangeOption[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRange(r)
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                      range === r
                        ? 'bg-blue-600/15 text-blue-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {rangeLabels[r]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      {/* Row 2: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ThreatActivityChart data={stats?.threat_activity} range={range} />
        <ThreatDistributionChart data={stats?.threat_distribution} total={stats?.threats_detected} />
        <RealtimeAlerts alerts={stats?.realtime_alerts} />
      </div>

      {/* Row 3: Scanners, Extensions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UnifiedScanner />
        <RiskyExtensions extensions={stats?.risky_extensions} />
        <RecentActivity activities={stats?.recent_security_activity} />
      </div>

      {/* Row 4: Statuses, Feed & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RiskGauge data={stats?.risk_gauge} />
        <ThreatIntelFeed feeds={stats?.threat_intel_feed} />
        <SystemStatus statuses={stats?.system_status} />
        <QuickActions />
      </div>
    </div>
  )
}
