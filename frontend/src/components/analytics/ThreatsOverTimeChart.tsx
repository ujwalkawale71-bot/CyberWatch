import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { analyticsDemoData } from '../../data/analyticsDemoData'
import { ChevronDown } from 'lucide-react'

export default function ThreatsOverTimeChart() {
  const legend = [
    { label: 'Critical', color: '#ef4444' },
    { label: 'High', color: '#f97316' },
    { label: 'Medium', color: '#f59e0b' },
    { label: 'Low', color: '#3b82f6' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[340px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white leading-none">Threats Over Time</h2>
          <span className="text-[10px] text-slate-500 block mt-0.5">Timeline levels logs</span>
        </div>
        <button className="flex items-center space-x-1 py-0.5 px-2 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 rounded text-[9px] font-bold text-slate-400 hover:text-slate-200 transition-colors">
          <span>Daily</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0 text-[8px] mt-2.5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsDemoData.threatsOverTime} margin={{ top: 5, right: 5, left: -32, bottom: -5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              dy={5}
              style={{ fontSize: 8 }}
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              dx={-5}
              style={{ fontSize: 8 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '10px'
              }}
            />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Inline Legend */}
      <div className="flex justify-center space-x-3 mt-2 border-t border-slate-850/50 pt-2 flex-wrap gap-y-1">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center space-x-1.5 text-[9px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-semibold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
