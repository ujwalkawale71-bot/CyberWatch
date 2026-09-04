import { useState, useEffect } from 'react'
import { RefreshCw, Upload, Download, Plus, CheckCircle } from 'lucide-react'
import ThreatIntelKpiRow from '../components/threat-intelligence/ThreatIntelKpiRow'
import LiveThreatMap from '../components/threat-intelligence/LiveThreatMap'
import TopAttackingRegions from '../components/threat-intelligence/TopAttackingRegions'
import LatestThreatFeeds from '../components/threat-intelligence/LatestThreatFeeds'
import IndicatorSearch from '../components/threat-intelligence/IndicatorSearch'
import ThreatCategoriesChart from '../components/threat-intelligence/ThreatCategoriesChart'
import ActiveCampaigns from '../components/threat-intelligence/ActiveCampaigns'
import TrendingThreats from '../components/threat-intelligence/TrendingThreats'
import DataSourcesCard from '../components/threat-intelligence/DataSourcesCard'
import QuickActionsCard from '../components/threat-intelligence/QuickActionsCard'
import { threatIntelligenceDemoData } from '../data/threatIntelligenceDemoData'

export default function ThreatIntelligence() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setToastMsg('Threat feeds updated successfully')
    }, 1000)
  }

  const handleHeaderAction = (actionName: string) => {
    setToastMsg(`Action "${actionName}" logged locally`)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  return (
    <div className="relative space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Threat Intelligence Center</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Real-time global threat feeds, indicators and security intelligence.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh feeds button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-450 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feeds'}</span>
          </button>

          {/* Custom IOC Upload */}
          <button
            onClick={() => handleHeaderAction('Custom IOC Upload')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-455 hover:text-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Custom IOC Upload</span>
          </button>

          {/* Export Intel */}
          <button
            onClick={() => handleHeaderAction('Export Intel')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-455 hover:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Intel</span>
          </button>

          {/* Add Watchlist */}
          <button
            onClick={() => handleHeaderAction('Add Watchlist')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/10 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Watchlist</span>
          </button>
        </div>
      </div>

      {/* Row 1: 6 KPI Cards Row */}
      <ThreatIntelKpiRow kpis={threatIntelligenceDemoData.kpis} />

      {/* Row 2: Live Global Map + Top Attacking Regions list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveThreatMap />
        <TopAttackingRegions />
      </div>

      {/* Row 3: Latest Threat Feeds table filter list */}
      <LatestThreatFeeds />

      {/* Row 4: Indicator Search query form + Donut volume charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndicatorSearch />
        <ThreatCategoriesChart />
      </div>

      {/* Row 5: Campaigns logs + Trending lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveCampaigns />
        <TrendingThreats />
      </div>

      {/* Row 6: Conceptual database grids + quick triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataSourcesCard />
        <QuickActionsCard />
      </div>
    </div>
  )
}
