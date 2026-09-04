import { FileText, BookOpen } from 'lucide-react'
import type { DocChapter } from '../../types/docsHelp'

interface ChaptersListProps {
  chapters: DocChapter[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function ChaptersList({ chapters, selectedId, onSelect }: ChaptersListProps) {
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

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left space-y-4 select-none">
      <div>
        <h2 className="text-base font-bold text-white leading-none">Chapters</h2>
        <span className="text-xs text-slate-500 mt-1 block">API schema references & guides</span>
      </div>

      <div className="space-y-1">
        {chapters.map((ch) => {
          const isSelected = ch.id === selectedId
          const isOverview = ch.id === 'ch-overview'

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelect(ch.id)}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-between text-left border-l-2 gap-3 ${
                isSelected
                  ? 'bg-slate-800/40 border-l-blue-500 text-white font-bold'
                  : 'border-l-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950/15'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                {isOverview ? (
                  <BookOpen className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-500'}`} />
                ) : (
                  <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-500'}`} />
                )}
                <span className="truncate">{ch.title}</span>
              </div>

              <span className={`text-[7.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded scale-90 ${getBadgeStyle(ch.status)}`}>
                {ch.status.toUpperCase()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
