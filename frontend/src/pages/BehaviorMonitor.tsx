import { Square } from 'lucide-react'
import KpiCard from '../components/behavior-monitor/KpiCard'
import BehaviorTimelineChart from '../components/behavior-monitor/BehaviorTimelineChart'
import TopBehaviors from '../components/behavior-monitor/TopBehaviors'
import SessionOverview from '../components/behavior-monitor/SessionOverview'
import RecentEvents from '../components/behavior-monitor/RecentEvents'
import { behaviorMonitorDemoData } from '../data/behaviorMonitorDemoData'

export default function BehaviorMonitor() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/40 pb-4">
        {/* Title and BETA Badge */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Behavior Monitor</h1>
              <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded border leading-none bg-blue-500/10 text-blue-400 border-blue-500/25">
                BETA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Real-time monitoring of browser behavior, extensions, and system activities.
            </p>
          </div>
        </div>

        {/* Top-Right Session display & control */}
        <div className="flex items-center space-x-3.5 bg-slate-900 border border-slate-800 p-2 rounded-lg">
          <div className="flex flex-col text-left px-1.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">
              Session Duration
            </span>
            <span className="text-xs font-bold font-mono text-slate-200 mt-1 leading-none">
              00:42:17
            </span>
          </div>

          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-all shadow-sm shadow-red-500/10 active:scale-95">
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Monitoring</span>
          </button>
        </div>
      </div>

      {/* Row 1: 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {behaviorMonitorDemoData.kpis.map((card) => (
          <KpiCard key={card.id} card={card} />
        ))}
      </div>

      {/* Row 2: Live Timeline Area Chart + Top Suspicious Actions horizontal indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BehaviorTimelineChart />
        <TopBehaviors />
      </div>

      {/* Row 3: Session Overview + Recent Log list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionOverview />
        <RecentEvents />
      </div>
    </div>
  )
}
