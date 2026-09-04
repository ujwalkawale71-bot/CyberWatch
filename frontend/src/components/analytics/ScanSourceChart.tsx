import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { analyticsDemoData } from '../../data/analyticsDemoData'

export default function ScanSourceChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-white leading-none">Scan Source Breakdown</h2>
        <span className="text-[10px] text-slate-500 mt-1 block">Scan volume sources distribution</span>
      </div>

      {/* Grid split */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 min-h-0 mt-3">
        {/* Left: Donut Chart */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '11px'
                }}
              />
              <Pie
                data={analyticsDemoData.sources}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {analyticsDemoData.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-extrabold text-white tracking-tight font-mono leading-none">
              128.5K
            </span>
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider scale-90 mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Right: Legend stats */}
        <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {analyticsDemoData.sources.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[10.5px] border-b border-slate-850 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-350 font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-slate-400 tabular-nums">
                <span className="font-semibold text-slate-200">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
