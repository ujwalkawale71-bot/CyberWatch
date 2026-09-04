import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot
} from 'recharts'
import { behaviorMonitorDemoData } from '../../data/behaviorMonitorDemoData'
import { ChevronDown } from 'lucide-react'

export default function BehaviorTimelineChart() {
  const legendItems = [
    { label: 'Normal', color: '#10b981' },
    { label: 'Suspicious', color: '#f59e0b' },
    { label: 'Critical', color: '#ef4444' },
    { label: 'Blocked', color: '#9333ea' }
  ]

  const stats = [
    { label: 'Normal Events', value: 782, color: 'text-emerald-450' },
    { label: 'Suspicious Events', value: 245, color: 'text-amber-500' },
    { label: 'Critical Events', value: 156, color: 'text-red-400' },
    { label: 'Blocked Events', value: 31, color: 'text-purple-400' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] hover:border-slate-700 transition-colors text-left">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Behavior Timeline (Live)</h2>
          <span className="text-xs text-slate-500 mt-1 block">Last 15 Minutes</span>
        </div>

        {/* Dropdown UI */}
        <button className="flex items-center space-x-1.5 py-1 px-2.5 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors">
          <span>Realtime Feed</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 text-[10px] my-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={behaviorMonitorDemoData.timeline} margin={{ top: 20, right: 5, left: -25, bottom: 0 }}>
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

            {/* Critical Dot Highlight label at May 14 equivalent index (time "10:40") */}
            <ReferenceDot
              x="10:40"
              y={72}
              r={5}
              fill="#ef4444"
              stroke="#0f172a"
              strokeWidth={2}
              label={{
                value: 'Critical Event',
                fill: '#ef4444',
                fontSize: 9,
                fontWeight: 'bold',
                position: 'top',
                offset: 8
              }}
            />
          </LineChart>
        </ResponsiveContainer>
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
