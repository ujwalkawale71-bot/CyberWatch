import { ChevronDown, Download } from 'lucide-react'
import AnalyticsKpiRow from '../components/analytics/AnalyticsKpiRow'
import ActivityOverviewChart from '../components/analytics/ActivityOverviewChart'
import ThreatsOverTimeChart from '../components/analytics/ThreatsOverTimeChart'
import ThreatsByTypeChart from '../components/analytics/ThreatsByTypeChart'
import TopRiskyDomainsTable from '../components/analytics/TopRiskyDomainsTable'
import TopRiskyIpsTable from '../components/analytics/TopRiskyIpsTable'
import CategoryDistributionChart from '../components/analytics/CategoryDistributionChart'
import ScanSourceChart from '../components/analytics/ScanSourceChart'
import UsersActivityTable from '../components/analytics/UsersActivityTable'
import GeographicDistribution from '../components/analytics/GeographicDistribution'
import InsightsAnomalies from '../components/analytics/InsightsAnomalies'
import { analyticsDemoData } from '../data/analyticsDemoData'

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left animate-in fade-in duration-355">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Deep insights and trends across all security activities.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2">
          {/* Dropdown UI */}
          <button className="flex items-center space-x-1.5 py-2 px-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <span>Last 30 Days</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Export button */}
          <button className="flex items-center space-x-1.5 py-2 px-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-xs font-semibold text-slate-405 hover:text-slate-200 transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Row 1: 6 KPI Cards Row */}
      <AnalyticsKpiRow kpis={analyticsDemoData.kpis} />

      {/* Row 2: Activity Overview + Threats Over Time + Threats by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActivityOverviewChart />
        <ThreatsOverTimeChart />
        <ThreatsByTypeChart />
      </div>

      {/* Row 3: Top Risky Domains + Top Risky IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopRiskyDomainsTable />
        <TopRiskyIpsTable />
      </div>

      {/* Row 4: Risk Categories + Scan Sources + User Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryDistributionChart />
        <ScanSourceChart />
        <UsersActivityTable />
      </div>

      {/* Row 5: Geographical Distribution + Insights feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeographicDistribution />
        <InsightsAnomalies />
      </div>
    </div>
  )
}
