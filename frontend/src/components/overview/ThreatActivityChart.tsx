import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { threatActivityData } from '../../data/overviewData'

export default function ThreatActivityChart() {
  const legendItems = [
    { label: 'URLs', color: '#2A9D8F' },
    { label: 'Websites', color: '#4FAF78' },
    { label: 'Extensions', color: '#E07A3F' },
    { label: 'Behavior', color: '#D9534F' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-left">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Threat Activity</h2>
          <span className="text-xs text-slate-500 mt-1 block">Last 7 Days</span>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={threatActivityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#343A40" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#747B82"
              tickLine={false}
              axisLine={false}
              dy={10}
              style={{ fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis
              stroke="#747B82"
              tickLine={false}
              axisLine={false}
              dx={-5}
              style={{ fontSize: 10, fontFamily: 'monospace' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#202428',
                border: '1px solid #343A40',
                borderRadius: '8px',
                color: '#F1F3F4',
                fontSize: '11px',
                fontFamily: 'sans-serif'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Line
              type="monotone"
              dataKey="urls"
              stroke="#2A9D8F"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="websites"
              stroke="#4FAF78"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="extensions"
              stroke="#E07A3F"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="behavior"
              stroke="#D9534F"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
