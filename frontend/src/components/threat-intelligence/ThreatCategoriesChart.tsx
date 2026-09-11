import { PieChart as PieIcon } from 'lucide-react'
import type { ThreatCategoryCount } from '../../types/threatIntelligence'

interface ThreatCategoriesChartProps {
  categories: ThreatCategoryCount[]
}

export default function ThreatCategoriesChart({ categories }: ThreatCategoriesChartProps) {
  const totalDetections = categories.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            Detected Threat Categories
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution of confirmed malicious indicators recorded in the database.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No confirmed malicious threats recorded in database yet.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const pct = totalDetections > 0 ? (cat.count / totalDetections) * 100 : 0
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat.category}</span>
                    <span className="text-slate-400 font-mono">
                      {cat.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex justify-between">
        <span>Total Threat Records:</span>
        <span className="font-bold text-slate-300">{totalDetections}</span>
      </div>
    </div>
  )
}
