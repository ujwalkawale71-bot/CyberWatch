import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { alertsDemoData } from '../../data/alertsDemoData'

export default function AlertsBySourceChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between h-[192px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div>
        <h2 className="text-[12px] font-bold text-white leading-none">Alerts by Source</h2>
        <span className="text-[9px] text-slate-500 block mt-0.5">Scanners volume distribution</span>
      </div>

      {/* Content layout */}
      <div className="flex-1 flex items-center justify-between gap-4 min-h-0 mt-1">
        {/* Left: Donut Chart */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '9px'
                }}
              />
              <Pie
                data={alertsDemoData.sources}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={45}
                paddingAngle={2.5}
                dataKey="value"
              >
                {alertsDemoData.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-extrabold text-white tracking-tight font-mono leading-none">
              1,284
            </span>
            <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider scale-90 mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Right: Legend */}
        <div className="flex-1 space-y-1 overflow-y-auto max-h-[110px] pr-1 scrollbar-thin scrollbar-thumb-slate-850">
          {alertsDemoData.sources.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[10px] border-b border-slate-850/50 pb-1 last:border-0 last:pb-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
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
