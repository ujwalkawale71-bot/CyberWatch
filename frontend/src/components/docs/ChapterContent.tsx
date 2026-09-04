import type { DocChapter } from '../../types/docsHelp'

interface ChapterContentProps {
  chapter: DocChapter
}

export default function ChapterContent({ chapter }: ChapterContentProps) {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/15'
      case 'Development':
        return 'bg-amber-500/10 text-amber-450 border border-amber-500/15'
      default:
        return 'bg-slate-800/40 text-slate-405 border border-slate-700/60'
    }
  }

  const isOverview = chapter.id === 'ch-overview'
  const hasPayloads = !!chapter.requestPayload && !!chapter.responsePayload

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col hover:border-slate-700 transition-colors text-left space-y-5 min-h-[500px]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3 gap-3">
        <h2 className="text-lg font-extrabold text-white tracking-tight">{chapter.title}</h2>
        <span className={`text-[8.5px] font-extrabold tracking-widest px-2 py-0.5 rounded leading-none ${getBadgeStyle(chapter.status)}`}>
          {chapter.status.toUpperCase()}
        </span>
      </div>

      {/* Description text */}
      <p className="text-xs text-slate-350 font-medium leading-relaxed">
        {chapter.description}
      </p>

      {/* Overview Table */}
      {isOverview && (
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Architecture Integration Status</h3>
          <div className="border border-slate-850 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-3">System Module</th>
                  <th className="py-2.5 px-3">Technical Stack</th>
                  <th className="py-2.5 px-3 text-right">Integration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-slate-300 font-medium">
                <tr className="hover:bg-slate-950/5">
                  <td className="py-2.5 px-3 font-bold text-slate-200">React UI Dashboard</td>
                  <td className="py-2.5 px-3 font-mono text-[10.5px]">React 19 + TypeScript + Recharts</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/15">
                      AVAILABLE
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/5">
                  <td className="py-2.5 px-3 font-bold text-slate-200">FastAPI Backend Server</td>
                  <td className="py-2.5 px-3 font-mono text-[10.5px]">Python 3.11 + FastAPI + Pydantic</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-450 border border-amber-500/15">
                      DEVELOPMENT
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/5">
                  <td className="py-2.5 px-3 font-bold text-slate-200">SQLite Database</td>
                  <td className="py-2.5 px-3 font-mono text-[10.5px]">SQLite3 + SQLModel ORM</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-450 border border-amber-500/15">
                      DEVELOPMENT
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-950/5">
                  <td className="py-2.5 px-3 font-bold text-slate-200">Manifest V3 Extension Agent</td>
                  <td className="py-2.5 px-3 font-mono text-[10.5px]">Chrome MV3 Service Worker JS</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-slate-800/40 text-slate-405 border border-slate-700/60">
                      PLANNED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request/Response payload terminals */}
      {hasPayloads && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Request */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Example HTTP Request
            </span>
            <pre className="p-3.5 bg-slate-955 border border-slate-850 rounded-lg overflow-auto max-h-[220px] font-mono text-[10.5px] text-blue-400 select-all leading-normal">
              {chapter.requestPayload}
            </pre>
          </div>

          {/* Response */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Example HTTP Response
            </span>
            <pre className="p-3.5 bg-slate-955 border border-slate-850 rounded-lg overflow-auto max-h-[220px] font-mono text-[10.5px] text-emerald-400 select-all leading-normal">
              {chapter.responsePayload}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
