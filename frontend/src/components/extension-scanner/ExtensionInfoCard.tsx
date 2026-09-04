import type { ExtensionInfoItem } from '../../types/extensionScanner'

interface ExtensionInfoCardProps {
  info: ExtensionInfoItem[]
}

export default function ExtensionInfoCard({ info }: ExtensionInfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[380px] hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="mb-4 text-left">
        <h2 className="text-base font-bold text-white leading-none">Extension Information</h2>
        <span className="text-xs text-slate-500 mt-1 block">Chrome Web Store listing details</span>
      </div>

      {/* Info grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
        {info.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-xs py-1.5 border-b border-slate-850/50 last:border-0 last:pb-0 gap-3"
          >
            <span className="text-slate-450 font-medium">{item.label}</span>
            <span className="text-slate-200 font-bold font-mono text-[11px] text-right truncate max-w-[200px] select-all">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
