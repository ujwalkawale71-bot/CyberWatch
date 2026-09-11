import { useState, useEffect, useRef } from 'react'
import { RefreshCw, Shield, AlertCircle, Loader2 } from 'lucide-react'
import ThreatIntelOverview from '../components/threat-intelligence/ThreatIntelOverview'
import IOCInvestigator from '../components/threat-intelligence/IOCInvestigator'
import IndicatorResultCard from '../components/threat-intelligence/IndicatorResultCard'
import SourceAnalysisGrid from '../components/threat-intelligence/SourceAnalysisGrid'
import CyberWatchVerdictCard from '../components/threat-intelligence/CyberWatchVerdictCard'
import RecentIntelligenceTable from '../components/threat-intelligence/RecentIntelligenceTable'
import ThreatCategoriesChart from '../components/threat-intelligence/ThreatCategoriesChart'
import ProviderStatusCard from '../components/threat-intelligence/ProviderStatusCard'
import { threatIntelApi } from '../api/threat-intelligence'
import type { ThreatIntelOverviewData, IOCInvestigationResult } from '../types/threatIntelligence'

export default function ThreatIntelligence() {
  const [overview, setOverview] = useState<ThreatIntelOverviewData | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const [investigationResult, setInvestigationResult] = useState<IOCInvestigationResult | null>(null)
  const [investigating, setInvestigating] = useState(false)
  const [investigationError, setInvestigationError] = useState<string | null>(null)
  const [activeIOC, setActiveIOC] = useState<string>('')

  // Sequence tracking to prevent race conditions from rapid consecutive searches
  const requestIdRef = useRef(0)

  const fetchOverviewData = async () => {
    setLoadingOverview(true)
    setOverviewError(null)
    try {
      const data = await threatIntelApi.getOverview()
      setOverview(data)
    } catch (err: any) {
      setOverviewError(err?.message || 'Failed to load Threat Intelligence overview metrics.')
    } finally {
      setLoadingOverview(false)
    }
  }

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const handleInvestigate = async (ioc: string) => {
    const trimmed = ioc.trim()
    if (!trimmed) return

    // Increment request ID to invalidate previous inflight calls
    const currentId = ++requestIdRef.current

    setActiveIOC(trimmed)
    setInvestigating(true)
    setInvestigationError(null)
    // Clear previous investigation immediately so UI never shows stale result
    setInvestigationResult(null)

    try {
      const res = await threatIntelApi.investigate(trimmed)
      // Only commit if this response matches the latest initiated request
      if (currentId === requestIdRef.current) {
        setInvestigationResult(res)
        // Refresh overview statistics in background
        fetchOverviewData()
      }
    } catch (err: any) {
      if (currentId === requestIdRef.current) {
        setInvestigationError(err?.message || 'Threat investigation failed.')
        setInvestigationResult(null)
      }
    } finally {
      if (currentId === requestIdRef.current) {
        setInvestigating(false)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Threat Intelligence Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time multi-source security feeds, indicator evaluations, and reputation intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverviewData}
            disabled={loadingOverview}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOverview ? 'animate-spin text-blue-400' : ''}`} />
            <span>{loadingOverview ? 'Refreshing...' : 'Refresh Feeds'}</span>
          </button>
        </div>
      </div>

      {overviewError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{overviewError}</span>
        </div>
      )}

      {/* Section 1: Overview KPIs */}
      <ThreatIntelOverview
        indicatorsChecked={overview?.kpis.indicators_checked || 0}
        threatsConfirmed={overview?.kpis.threats_confirmed || 0}
        activeAlerts={overview?.kpis.active_alerts || 0}
        sourcesOnline={overview?.kpis.sources_online || '0/4'}
        loading={loadingOverview}
      />

      {/* Section 2: IOC Investigator */}
      <IOCInvestigator
        onInvestigate={handleInvestigate}
        loading={investigating}
        error={investigationError}
        currentIOC={activeIOC}
      />

      {/* Active Loading Skeleton */}
      {investigating && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center gap-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <div className="text-sm font-semibold text-slate-300">
            Investigating IOC across active threat feeds...
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Querying Google Safe Browsing, VirusTotal, URLhaus, and PhishTank for: {activeIOC}
          </div>
        </div>
      )}

      {/* Sections 3, 4, 5: Investigation Results (when available and not actively loading) */}
      {!investigating && investigationResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Section 3: Indicator Result */}
          <IndicatorResultCard result={investigationResult} />

          {/* Section 4 & 5: Source Analysis Grid + CyberWatch Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SourceAnalysisGrid sources={investigationResult.sources} />
            <CyberWatchVerdictCard result={investigationResult} />
          </div>
        </div>
      )}

      {/* Section 6 & 7: Recent Intelligence + Threat Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentIntelligenceTable
            items={overview?.recent_intelligence || []}
            onSelectIOC={handleInvestigate}
          />
        </div>
        <div>
          <ThreatCategoriesChart
            categories={overview?.threat_categories || []}
          />
        </div>
      </div>

      {/* Section 8: Provider Status */}
      <ProviderStatusCard
        providers={overview?.provider_statuses || []}
      />
    </div>
  )
}
