import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import type { RadarDataPoint } from '../../types/extensionScanner'

interface RiskRadarChartProps {
  data: RadarDataPoint[]
}

export default function RiskRadarChart({ data }: RiskRadarChartProps) {
  const legendItems = [
    { label: 'Current Score', color: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
    { label: 'Safe Baseline', color: '#10b981', fill: 'transparent' }
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-left">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Risk Score Breakdown</h2>
          <span className="text-xs text-slate-500 mt-1 block">Vector comparison analysis</span>
        </div>

        {/* Custom Legend */}
        <div className="flex space-x-3">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center space-x-1.5 text-[10px] text-slate-400">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  backgroundColor: item.fill !== 'transparent' ? item.fill : 'transparent',
                  border: `1.5px solid ${item.color}`
                }}
              />
              <span className="font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Radar Canvas */}
      <div className="flex-1 w-full min-h-0 text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#64748b"
              style={{ fontSize: 9, fontWeight: 600, fontFamily: 'sans-serif' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#334155"
              tick={{ fill: '#475569', fontSize: 8 }}
              axisLine={false}
            />
            {/* Safe Baseline */}
            <Radar
              name="Safe Baseline"
              dataKey="baselineScore"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.05}
            />
            {/* Current Score */}
            <Radar
              name="Current Score"
              dataKey="currentScore"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
