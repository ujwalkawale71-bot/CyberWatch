import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { threatDistributionData } from '../../data/overviewData'

export default function ThreatDistributionChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Threat Distribution</h2>
        <span className="text-xs text-slate-500 mt-1 block">Breakdown of detected vectors</span>
      </div>

      {/* Main chart panel split */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 min-h-0">
        {/* Left Side: Donut with Center Total Label */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#202428',
                  border: '1px solid #343A40',
                  borderRadius: '8px',
                  color: '#F1F3F4',
                  fontSize: '11px'
                }}
              />
              <Pie
                data={threatDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {threatDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white tracking-tight font-mono leading-none">
              1,617
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              Total
            </span>
          </div>
        </div>

        {/* Right Side: Detailed Legend List */}
        <div className="flex-1 w-full space-y-2 text-left">
          {threatDistributionData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate max-w-[120px] sm:max-w-none">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-slate-400 tabular-nums">
                <span className="font-semibold text-slate-200">{item.percentage}%</span>
                <span className="text-[10px] text-slate-600">({item.value})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
