import type { RecentEventItem } from '../../types/behaviorMonitor'
import { SEVERITY_COLORS } from '../../utils/constants'
import { ShieldCheck } from 'lucide-react'

interface RecentEventsProps {
  events?: RecentEventItem[]
}

export default function RecentEvents({ events = [] }: RecentEventsProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Recent Security & Anomaly Events</h2>
          <span className="text-xs text-slate-500 mt-1 block">Live evidence capture log</span>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
          {events.length} Events
        </div>
      </div>

      {/* Events log scroll feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-300">No Recent Suspicious Events</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              No anomalies or threat detections recorded in the current inspection window.
            </p>
          </div>
        ) : (
          events.map((event) => {
            const colorSet = SEVERITY_COLORS[event.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.LOW
            const isBlocked = event.status === 'Blocked'

            return (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-slate-900 transition-colors flex items-start justify-between gap-3"
              >
                {/* Left detail column */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                    {/* Timestamp */}
                    <span className="text-[10px] font-mono text-slate-500 mr-1 leading-none">{event.time}</span>
                    {/* Event Name */}
                    <h3 className="text-xs font-bold text-slate-200 truncate leading-none">{event.name}</h3>
                  </div>
                  {/* Event Source */}
                  <p className="text-[10px] text-slate-400 font-mono truncate leading-normal">
                    {event.source}
                  </p>
                </div>

                {/* Right status badges column */}
                <div className="flex items-center space-x-2 flex-shrink-0 pt-0.5">
                  {/* Severity Badge */}
                  <span
                    className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                  >
                    {event.severity}
                  </span>

                  {/* Intervention Status Badge */}
                  <span
                    className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${
                      isBlocked
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {event.status.toUpperCase()}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
