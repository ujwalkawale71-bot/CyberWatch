import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ShieldAlert } from 'lucide-react'
import KpiCard from '../components/behavior-monitor/KpiCard'
import BehaviorTimelineChart from '../components/behavior-monitor/BehaviorTimelineChart'
import TopBehaviors from '../components/behavior-monitor/TopBehaviors'
import SessionOverview from '../components/behavior-monitor/SessionOverview'
import RecentEvents from '../components/behavior-monitor/RecentEvents'
import { behaviorApi, type BehaviorStatsResponse } from '../api/behavior'
import { defaultBehaviorMonitorData } from '../data/behaviorMonitorDemoData'

export default function BehaviorMonitor() {
  const [range, setRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [data, setData] = useState<BehaviorStatsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (selectedRange: '24h' | '7d' | '30d' | 'all') => {
    setLoading(true)
    setError(null)
    try {
      const res = await behaviorApi.getStats(selectedRange)
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch behavior analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(range)
  }, [range, fetchData])

  const kpis = data?.kpis || defaultBehaviorMonitorData.kpis
  const timeline = data?.timeline || defaultBehaviorMonitorData.timeline
  const topBehaviors = data?.top_behaviors || defaultBehaviorMonitorData.topBehaviors
  const sessionOverview = data?.session_overview || defaultBehaviorMonitorData.sessionOverview
  const recentEvents = data?.recent_events || defaultBehaviorMonitorData.recentEvents

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/40 pb-4">
        {/* Title and Badge */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Behavior Monitor</h1>
              <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded border leading-none bg-blue-500/10 text-blue-400 border-blue-500/25">
                LIVE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Real-time monitoring of browser behavior, extensions, and correlated security anomalies.
            </p>
          </div>
        </div>

        {/* Date Range Selector & Refresh Action */}
        <div className="flex items-center space-x-3">
          {/* Time range pill buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 space-x-1">
            {(['24h', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  range === r
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchData(range)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchData(range)}
            className="text-xs underline font-semibold hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Row 1: 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      {/* Row 2: Live Timeline Area Chart + Top Suspicious Actions horizontal indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BehaviorTimelineChart data={timeline} range={range} />
        <TopBehaviors data={topBehaviors} />
      </div>

      {/* Row 3: Session Overview + Recent Log list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionOverview data={sessionOverview} />
        <RecentEvents events={recentEvents} />
      </div>
    </div>
  )
}
