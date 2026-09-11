import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import type { TimelineDataPoint } from '../../types/behaviorMonitor'

interface BehaviorTimelineChartProps {
  data?: TimelineDataPoint[]
  range?: string
}

export default function BehaviorTimelineChart({ data = [], range = '7d' }: BehaviorTimelineChartProps) {
  const legendItems = [
    { label: 'Normal', color: '#10b981' },
    { label: 'Suspicious', color: '#f59e0b' },
    { label: 'Critical', color: '#ef4444' },
    { label: 'Blocked', color: '#9333ea' }
  ]

  const totalNormal = data.reduce((sum, d) => sum + (d.normal || 0), 0)
  const totalSuspicious = data.reduce((sum, d) => sum + (d.suspicious || 0), 0)
  const totalCritical = data.reduce((sum, d) => sum + (d.critical || 0), 0)
  const totalBlocked = data.reduce((sum, d) => sum + (d.blocked || 0), 0)

  const stats = [
    { label: 'Normal Events', value: totalNormal, color: 'text-emerald-400' },
    { label: 'Suspicious Events', value: totalSuspicious, color: 'text-amber-500' },
    { label: 'Critical Events', value: totalCritical, color: 'text-red-400' },
    { label: 'Blocked Events', value: totalBlocked, color: 'text-purple-400' }
  ]

  const rangeLabels: Record<string, string> = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    'all': 'All Recorded History'
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] hover:border-slate-700 transition-colors text-left">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Behavior Timeline (Evidence Log)</h2>
          <span className="text-xs text-slate-500 mt-1 block">{rangeLabels[range] || 'Recent Activity'}</span>
        </div>

        <div className="flex items-center space-x-1.5 py-1 px-2.5 bg-slate-950/40 border border-slate-800 rounded text-[10px] font-bold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Data Feed</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 text-[10px] my-1">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
            No behavioral events recorded in this time range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                dy={10}
                style={{ fontSize: 9, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                dx={-5}
                allowDecimals={false}
                style={{ fontSize: 9, fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}
              />
              {/* 4 Colored zones / lines */}
              <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="blocked" stroke="#9333ea" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend list */}
      <div className="flex justify-center space-x-4 py-2 border-b border-slate-850/50">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center space-x-1.5 text-[9px] text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom Stats boxes grid */}
      <div className="grid grid-cols-4 gap-2 pt-3">
        {stats.map((stat) => (
          <div key={stat.label} className="p-2 rounded-lg bg-slate-950/20 border border-slate-850/50 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center scale-90 truncate max-w-full">
              {stat.label.split(' ')[0]}
            </span>
            <span className={`text-base font-extrabold font-mono tracking-tight tabular-nums mt-1 leading-none ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
