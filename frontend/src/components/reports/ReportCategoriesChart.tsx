import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { reportsDemoData } from '../../data/reportsDemoData'

export default function ReportCategoriesChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Top Report Categories</h2>
        <span className="text-xs text-slate-500 mt-1 block">Compiled diagnostic categories volumes</span>
      </div>

      {/* Grid split */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 min-h-0 mt-3">
        {/* Left: Donut Chart */}
        <div className="relative w-36 h-36 flex-shrink-0">
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
                data={reportsDemoData.categories}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
              >
                {reportsDemoData.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-extrabold text-white tracking-tight font-mono leading-none">
              342
            </span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider scale-90 mt-1">
              Total
            </span>
          </div>
        </div>

        {/* Right: Legend stats */}
        <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-[180px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {reportsDemoData.categories.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[11px] border-b border-slate-850 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
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
