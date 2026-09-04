import type { PermissionAnalysisItem } from '../../types/extensionScanner'
import { SEVERITY_COLORS } from '../../utils/constants'

interface PermissionsAnalysisProps {
  permissions: PermissionAnalysisItem[]
}

export default function PermissionsAnalysis({ permissions }: PermissionsAnalysisProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Permissions Analysis</h2>
        <span className="text-xs text-slate-500 mt-1 block">Vulnerability mapping of manifest permissions</span>
      </div>

      {/* Permissions List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
        {permissions.map((perm) => {
          const colorSet = SEVERITY_COLORS[perm.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.LOW

          return (
            <div
              key={perm.name}
              className="p-2.5 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-mono text-slate-200 text-xs font-semibold truncate">
                  {perm.name}
                </span>
                <span
                  className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none flex-shrink-0 ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                >
                  {perm.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {perm.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
