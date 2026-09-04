import { useState } from 'react'
import { Plus, Ban, CheckCircle, FileDown, ExternalLink } from 'lucide-react'
import type { DbRecord } from '../../types/databaseExplorer'
import { SEVERITY_COLORS } from '../../utils/constants'

interface RecordDetailsPanelProps {
  record: DbRecord
  onAction: (id: string, actionName: string) => void
  onAddTag: (id: string, tag: string) => void
}

export default function RecordDetailsPanel({
  record,
  onAction,
  onAddTag
}: RecordDetailsPanelProps) {
  const [newTag, setNewTag] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  const severity = SEVERITY_COLORS[record.threatLevel] || SEVERITY_COLORS.LOW
  const isSafe = record.threatLevel === 'SAFE'

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim()) {
      onAddTag(record.id, newTag.trim())
      setNewTag('')
      setIsAddingTag(false)
    }
  }

  // Calculate circular dial path
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (record.reputationScore / 100) * circumference

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[650px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Top Header Card Info */}
      <div className="flex items-start justify-between border-b border-slate-850 pb-3 gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            <span
              className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${severity.bg} ${severity.text} ${severity.border}`}
            >
              {record.threatLevel}
            </span>
            <span className="text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none bg-slate-800 text-slate-350 border border-slate-700">
              {record.type.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-slate-550 font-bold">
              ID: {record.id}
            </span>
          </div>

          <h2 className="text-sm font-extrabold text-white tracking-tight truncate font-mono select-all pt-1">
            {record.value}
          </h2>
        </div>

        {/* Circular Reputation Gauge */}
        <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="text-slate-800"
              strokeWidth="4.5"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              className={
                record.reputationScore >= 80
                  ? 'text-emerald-500'
                  : record.reputationScore >= 50
                  ? 'text-amber-500'
                  : 'text-red-500'
              }
              strokeWidth="4.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-white font-mono leading-none">
              {record.reputationScore}
            </span>
            <span className="text-[6.5px] text-slate-500 font-extrabold uppercase mt-0.5 scale-90">REP</span>
          </div>
        </div>
      </div>

      {/* Middle scrollable details */}
      <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1 scrollbar-thin scrollbar-thumb-slate-850 text-xs">
        {/* General Information */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">General Information</h3>
          <div className="p-3 bg-slate-950/20 border border-slate-850 rounded-lg space-y-1.5 font-medium text-slate-350">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Record Type:</span>
              <span className="text-slate-300 font-semibold">{record.type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">First Detected:</span>
              <span className="text-slate-300 font-mono">{record.firstSeen}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Last Seen:</span>
              <span className="text-slate-300 font-mono">{record.lastSeen}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Engine Source:</span>
              <span className="text-slate-300">{record.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Threat Classification:</span>
              <span className="text-slate-300 font-bold">{record.category}</span>
            </div>
          </div>
        </div>

        {/* Analysis summary */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Analysis Summary</h3>
          <div className="p-3 bg-slate-955/20 border border-slate-850 rounded-lg space-y-2">
            {record.location && record.location !== 'N/A' && (
              <div className="flex justify-between border-b border-slate-900 pb-1.5 text-slate-350 font-medium">
                <span className="text-slate-500">Geographic Origin:</span>
                <span>{record.location}</span>
              </div>
            )}
            {record.ipRange && record.ipRange !== 'N/A' && (
              <div className="flex justify-between border-b border-slate-900 pb-1.5 text-slate-350 font-medium">
                <span className="text-slate-500">IP Host Range:</span>
                <span className="font-mono text-[10.5px] select-all">{record.ipRange}</span>
              </div>
            )}
            {record.contentMatchPercent !== undefined && record.contentMatchPercent > 0 && (
              <div className="flex justify-between border-b border-slate-900 pb-1.5 text-slate-350 font-medium">
                <span className="text-slate-500">Content Matches index:</span>
                <span className="font-mono">{record.contentMatchPercent}%</span>
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Flagged Indicators</span>
              {record.indicators.map((ind, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[11px] font-semibold text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Record Tags</h3>
          <div className="flex flex-wrap gap-1.5 items-center">
            {record.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded bg-slate-900/60 text-slate-350 border border-slate-850"
              >
                {tag}
              </span>
            ))}

            {isAddingTag ? (
              <form onSubmit={handleAddTagSubmit} className="flex items-center space-x-1.5">
                <input
                  type="text"
                  required
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="tag name..."
                  className="py-0.5 px-2 bg-slate-955 border border-slate-850 rounded text-[9px] text-slate-200 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-blue-500 text-white rounded text-[9px] font-bold"
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="text-[9.5px] font-extrabold tracking-wide px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 hover:bg-blue-500/20 transition-all flex items-center space-x-0.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add Tag</span>
              </button>
            )}
          </div>
        </div>

        {/* Relational Records Stats */}
        <div className="space-y-2 pt-2 border-t border-slate-850/50">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Related Telemetry</h3>
          <div className="grid grid-cols-5 gap-2 text-center p-2.5 bg-slate-950/25 border border-slate-855 rounded-lg">
            <div>
              <span className="font-mono text-xs font-bold text-slate-200 block">{record.related.ips}</span>
              <span className="text-[7.5px] text-slate-500 font-extrabold uppercase mt-0.5 block scale-90">IPs</span>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-200 block">{record.related.domains}</span>
              <span className="text-[7.5px] text-slate-500 font-extrabold uppercase mt-0.5 block scale-90">Domains</span>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-200 block">{record.related.files}</span>
              <span className="text-[7.5px] text-slate-500 font-extrabold uppercase mt-0.5 block scale-90">Files</span>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-200 block">{record.related.behaviors}</span>
              <span className="text-[7.5px] text-slate-500 font-extrabold uppercase mt-0.5 block scale-90">Beh</span>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-200 block">{record.related.alerts}</span>
              <span className="text-[7.5px] text-slate-500 font-extrabold uppercase mt-0.5 block scale-90">Alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-850">
        <button
          onClick={() => onAction(record.id, 'Add to Blocklist')}
          disabled={isSafe}
          className={`py-2 px-3 text-xs font-bold text-white rounded-lg transition-all active:scale-[0.97] flex items-center justify-center space-x-1.5 shadow-sm shadow-red-500/5 ${
            isSafe
              ? 'bg-red-500/20 border border-transparent text-red-500/40 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Add Blocklist</span>
        </button>

        <button
          onClick={() => onAction(record.id, 'Add to Whitelist')}
          className="py-2 px-3 text-xs font-bold text-emerald-450 hover:text-white border border-emerald-500/25 hover:bg-emerald-650 hover:border-transparent rounded-lg transition-all active:scale-[0.97] flex items-center justify-center space-x-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Add Whitelist</span>
        </button>

        <button
          onClick={() => onAction(record.id, 'Generate Report')}
          className="py-2 px-3 text-xs font-semibold text-slate-350 hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg transition-all flex items-center justify-center space-x-1.5"
        >
          <FileDown className="w-3.5 h-3.5 text-slate-500" />
          <span>Gen Report</span>
        </button>

        <button
          onClick={() => onAction(record.id, 'Export Record')}
          className="py-2 px-3 text-xs font-semibold text-slate-350 hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg transition-all flex items-center justify-center space-x-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>
      </div>
    </div>
  )
}
