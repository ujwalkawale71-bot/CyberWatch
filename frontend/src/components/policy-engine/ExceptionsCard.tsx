import { ShieldAlert, Plus } from 'lucide-react'
import type { PolicyExceptionItem } from '../../types/policyEngine'

interface ExceptionsCardProps {
  exceptions: PolicyExceptionItem[]
  onAdd: () => void
}

export default function ExceptionsCard({ exceptions, onAdd }: ExceptionsCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors justify-between text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Exceptions</h2>
          <span className="text-xs text-slate-500 mt-1 block">Active policy overrides</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All
        </button>
      </div>

      {/* Exceptions list feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 my-2">
        {exceptions.map((exc) => (
          <div
            key={exc.id}
            className="p-3 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-slate-900 transition-colors flex items-start space-x-3 text-xs"
          >
            {/* Left box icon */}
            <div className="p-2 rounded bg-slate-955 text-slate-450 border border-slate-850 flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>

            {/* Right details */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-slate-200 truncate">{exc.name}</h3>
                <span className="text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
                  {exc.type.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-550 font-medium">
                <span>Expires: {exc.expires}</span>
                <span>By: {exc.createdBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button action */}
      <button
        onClick={onAdd}
        className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/10"
      >
        <Plus className="w-4 h-4" />
        <span>Add Exception Override</span>
      </button>
    </div>
  )
}
