import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot
} from 'recharts'
import { reportsDemoData } from '../../data/reportsDemoData'

export default function ReportsOverviewChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[340px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Reports Overview (Last 30 Days)</h2>
        <span className="text-xs text-slate-500 mt-1 block">Generation volumes summary</span>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 text-[10px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={reportsDemoData.overview} margin={{ top: 20, right: 5, left: -28, bottom: -5 }}>
            <defs>
              <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              dy={5}
              style={{ fontSize: 9 }}
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              dx={-5}
              style={{ fontSize: 9 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '11px'
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#reportsGrad)"
            />

            {/* Peak Callout target at Day 22 (value 38) */}
            <ReferenceDot
              x="Day 22"
              y={38}
              r={5}
              fill="#3b82f6"
              stroke="#0f172a"
              strokeWidth={2}
              label={{
                value: '38 Reports',
                fill: '#3b82f6',
                fontSize: 9,
                fontWeight: 'bold',
                position: 'top',
                offset: 8
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
