import { Link } from 'react-router-dom'
import type { RiskyExtension } from '../../data/overviewData'
import { SEVERITY_COLORS } from '../../utils/constants'

interface RiskyExtensionsProps {
  extensions?: RiskyExtension[]
}

export default function RiskyExtensions({ extensions }: RiskyExtensionsProps) {
  const extensionList = extensions || []

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[340px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <h2 className="text-base font-bold text-white leading-none">Top Risky Extensions</h2>
          <span className="text-xs text-slate-500 mt-1 block">Highest risk scores in network</span>
        </div>
        <Link
          to="/extension-scanner"
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Extension List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {extensionList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center py-12">
            <span>No extension scans recorded yet</span>
            <span className="text-[10px] text-slate-600 mt-1">Scan Chrome/Edge extensions to view risk analysis</span>
          </div>
        ) : (
          extensionList.map((ext) => {
            const sevKey = (ext.severity || 'LOW').toUpperCase() as keyof typeof SEVERITY_COLORS
            const colorSet = SEVERITY_COLORS[sevKey] || SEVERITY_COLORS.LOW

            return (
              <div key={ext.id} className="space-y-1.5 text-left">
                {/* Info row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-none">
                    {ext.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    {/* Score */}
                    <span className="font-mono text-slate-400 tabular-nums">
                      <strong className="text-slate-200 font-bold">{ext.score}</strong>/100
                    </span>
                    {/* Badge */}
                    <span
                      className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                    >
                      {ext.severity}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-slate-800/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorSet.solid}`}
                    style={{ width: `${Math.min(100, Math.max(5, ext.score))}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
