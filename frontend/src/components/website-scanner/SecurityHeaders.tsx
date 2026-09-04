import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { SecurityHeaderItem } from '../../types/websiteScanner'

interface SecurityHeadersProps {
  headers: SecurityHeaderItem[]
}

export default function SecurityHeaders({ headers }: SecurityHeadersProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[280px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Security Headers</h2>
        <span className="text-xs text-slate-500 mt-1 block">HTTP response header analysis</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left flex flex-col justify-center">
        {headers.map((header) => {
          const isPresent = header.status === 'Present'
          return (
            <div
              key={header.name}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-850 last:border-0 last:pb-0"
            >
              <span className="font-mono text-slate-350 text-[11px] truncate max-w-[170px] sm:max-w-none">
                {header.name}
              </span>

              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {isPresent ? (
                  <>
                    <span className="text-emerald-400 font-semibold text-[10px]">Present</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </>
                ) : (
                  <>
                    <span className="text-red-400 font-semibold text-[10px]">Missing</span>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
