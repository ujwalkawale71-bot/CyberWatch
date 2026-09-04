import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { threatIntelligenceDemoData } from '../../data/threatIntelligenceDemoData'

export default function ThreatCategoriesChart() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[420px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Top Threat Categories</h2>
        <span className="text-xs text-slate-500 mt-1 block">Threat distribution category volumes</span>
      </div>

      {/* Grid split layout */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 min-h-0">
        {/* Left: Donut Chart */}
        <div className="relative w-44 h-44 flex-shrink-0">
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
                data={threatIntelligenceDemoData.categories}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={2.5}
                dataKey="value"
              >
                {threatIntelligenceDemoData.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Center total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-white tracking-tight font-mono leading-none">
              256,847
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              Total Threats
            </span>
          </div>
        </div>

        {/* Right: Legend stats */}
        <div className="flex-1 w-full space-y-2 text-left overflow-y-auto max-h-[220px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {threatIntelligenceDemoData.categories.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[11px] border-b border-slate-850 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-slate-400 tabular-nums">
                <span className="font-semibold text-slate-200">{item.percentage}%</span>
                <span className="text-[9px] text-slate-655">({item.value.toLocaleString()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
