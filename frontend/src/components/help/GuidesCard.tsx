import { FileDown, FileText, ShieldAlert, Download } from 'lucide-react'
import type { GuideItem } from '../../types/help'

const iconMap = {
  FileDown,
  FileText,
  ShieldAlert
}

const colorMap = {
  'guide-1': 'text-blue-500 bg-blue-500/10 border border-blue-500/15',
  'guide-2': 'text-purple-500 bg-purple-500/10 border border-purple-500/15',
  'guide-3': 'text-red-500 bg-red-500/10 border border-red-500/15',
  'guide-4': 'text-amber-500 bg-amber-500/10 border border-amber-500/15',
  'guide-5': 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/15'
}

interface GuidesCardProps {
  guides: GuideItem[]
  onDownload: (title: string) => void
}

export default function GuidesCard({ guides, onDownload }: GuidesCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white leading-none">Guides & Documentation</h2>
          <span className="text-[10px] text-slate-500 mt-1 block">Downloadable references and deployment templates</span>
        </div>
        <button
          type="button"
          onClick={() => onDownload('All Documentation PDF Archive')}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All Docs
        </button>
      </div>

      {/* Guides list */}
      <div className="space-y-2.5 flex-1">
        {guides.map((guide) => {
          const Icon = iconMap[guide.iconName] || FileText
          const colorClass = colorMap[guide.id as keyof typeof colorMap] || 'text-slate-405 bg-slate-950/20'

          return (
            <div
              key={guide.id}
              className="p-3 rounded-lg border border-slate-850 bg-slate-955/15 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className={`p-2 rounded flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h3 className="font-bold text-slate-200 truncate">{guide.title}</h3>
                  <p className="text-[10.5px] text-slate-500 font-medium truncate max-w-[280px]">
                    {guide.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="font-mono text-[10px] text-slate-550 font-bold">
                  {guide.format}, {guide.size}
                </span>
                <button
                  type="button"
                  onClick={() => onDownload(guide.title)}
                  className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
