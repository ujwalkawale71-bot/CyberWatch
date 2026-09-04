import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { alertsDemoData } from '../../data/alertsDemoData'

export default function AlertDistributionChart() {
  const legendItems = [
    { label: 'Critical', color: '#ef4444' },
    { label: 'High', color: '#f97316' },
    { label: 'Medium', color: '#f59e0b' },
    { label: 'Low', color: '#3b82f6' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between h-[192px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[12px] font-bold text-white leading-none">Alert Distribution (Last 7 Days)</h2>
          <span className="text-[9px] text-slate-500 block mt-0.5">Timeline levels logs</span>
        </div>

        {/* Small Legend inline */}
        <div className="flex space-x-2">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center space-x-1 text-[8.5px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 text-[8px] mt-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={alertsDemoData.distribution} margin={{ top: 5, right: 5, left: -32, bottom: -5 }}>
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
                borderRadius: '6px',
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
    </div>
  )
}
