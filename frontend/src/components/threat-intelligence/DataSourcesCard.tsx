import { threatIntelligenceDemoData } from '../../data/threatIntelligenceDemoData'
import { Database } from 'lucide-react'

export default function DataSourcesCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Data Sources</h2>
        <span className="text-xs text-slate-500 mt-1 block">Configured external databases status</span>
      </div>

      {/* Grid of source badges */}
      <div className="flex-1 my-3 overflow-y-auto pr-1 flex flex-wrap gap-2 items-center justify-start scrollbar-thin scrollbar-thumb-slate-800">
        {threatIntelligenceDemoData.dataSources.map((source) => (
          <div
            key={source.name}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950/30 border border-slate-850 hover:bg-slate-900 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-bold text-slate-200">{source.name}</span>
          </div>
        ))}
      </div>

      {/* Footer and Button actions */}
      <div className="space-y-3.5">
        <button
          type="button"
          className="w-full py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Manage Sources</span>
        </button>

        <p className="text-[10px] text-slate-600 text-center font-medium leading-normal">
          Demo data shown - live external feeds are not yet connected. See Settings &gt; API Configurations.
        </p>
      </div>
    </div>
  )
}
