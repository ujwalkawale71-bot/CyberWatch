import { threatIntelligenceDemoData } from '../../data/threatIntelligenceDemoData'

export default function TopAttackingRegions() {
  const barColors = ['bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-slate-500']

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[400px] hover:border-slate-700 transition-colors text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Top Attacking Regions</h2>
        <span className="text-xs text-slate-500 mt-1 block">Geo-IP telemetry threat sources</span>
      </div>

      {/* Regions list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4 scrollbar-thin scrollbar-thumb-slate-800">
        {threatIntelligenceDemoData.topAttackingRegions.map((region, index) => {
          const colorClass = barColors[index] || 'bg-slate-500'
          return (
            <div key={region.id} className="space-y-1.5">
              {/* Country info and percentage */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm select-none">{region.flag}</span>
                  <span className="font-semibold text-slate-200">{region.country}</span>
                </div>
                <span className="font-mono text-slate-400 font-bold tabular-nums">
                  {region.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-slate-850/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${region.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
