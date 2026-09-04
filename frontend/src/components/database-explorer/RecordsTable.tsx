import { useState } from 'react'
import { Eye, ExternalLink, MoreHorizontal } from 'lucide-react'
import type { DbRecord } from '../../types/databaseExplorer'
import { SEVERITY_COLORS } from '../../utils/constants'

interface RecordsTableProps {
  records: DbRecord[]
  selectedId: string
  onSelect: (id: string) => void
  onAction: (id: string, name: string) => void
}

export default function RecordsTable({
  records,
  selectedId,
  onSelect,
  onAction
}: RecordsTableProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const handleCheckRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id))
    } else {
      setCheckedIds([...checkedIds, id])
    }
  }

  const handleCheckAll = () => {
    if (checkedIds.length === records.length) {
      setCheckedIds([])
    } else {
      setCheckedIds(records.map((item) => item.id))
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'URL':
      case 'Domain':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'IP':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      case 'Extension':
        return 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
      case 'File':
      case 'Hash':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      default:
        return 'bg-slate-800/40 text-slate-400 border border-slate-700/60'
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[650px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Table feed */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 bg-[#0b1329] z-10">
              <th className="py-2.5 pl-3 w-8">
                <input
                  type="checkbox"
                  checked={checkedIds.length === records.length && records.length > 0}
                  onChange={handleCheckAll}
                  className="w-3.5 h-3.5 rounded bg-slate-955 border-slate-850 text-blue-500 focus:ring-0 focus:ring-offset-0"
                />
              </th>
              <th className="py-2.5 pb-2">Record ID</th>
              <th className="py-2.5 pb-2 text-center">Type</th>
              <th className="py-2.5 pb-2 pl-4">Value</th>
              <th className="py-2.5 pb-2 text-center">Threat Level</th>
              <th className="py-2.5 pb-2">Source</th>
              <th className="py-2.5 pb-2 text-center">Rep Score</th>
              <th className="py-2.5 pb-2 text-right">Last Seen</th>
              <th className="py-2.5 pb-2 text-right pr-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {records.length > 0 ? (
              records.map((row) => {
                const isSelected = row.id === selectedId
                const isChecked = checkedIds.includes(row.id)
                const severity = SEVERITY_COLORS[row.threatLevel] || SEVERITY_COLORS.LOW

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelect(row.id)}
                    className={`cursor-pointer transition-all border-l-2 ${
                      isSelected
                        ? 'bg-slate-800/40 border-l-blue-500'
                        : 'hover:bg-slate-955/15 border-l-transparent'
                    }`}
                  >
                    {/* Checkbox column */}
                    <td className="py-3 pl-3" onClick={(e) => handleCheckRow(row.id, e)}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-3.5 h-3.5 rounded bg-slate-955 border-slate-850 text-blue-500 focus:ring-0 focus:ring-offset-0"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3 font-mono font-bold text-slate-400 text-[10.5px]">
                      {row.id}
                    </td>

                    {/* Type badge */}
                    <td className="py-3 text-center">
                      <span
                        className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${getTypeStyles(
                          row.type
                        )}`}
                      >
                        {row.type.toUpperCase()}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-3 pl-4 font-mono font-bold text-slate-200 truncate max-w-[200px] select-all">
                      {row.value}
                    </td>

                    {/* Threat Level */}
                    <td className="py-3 text-center">
                      <span
                        className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${severity.bg} ${severity.text} ${severity.border}`}
                      >
                        {row.threatLevel}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 text-slate-400 font-semibold truncate max-w-[120px]">
                      {row.source}
                    </td>

                    {/* Reputation score */}
                    <td className="py-3 text-center">
                      <span
                        className={`font-mono font-bold text-xs ${
                          row.reputationScore >= 80
                            ? 'text-emerald-400'
                            : row.reputationScore >= 50
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {row.reputationScore}
                      </span>
                    </td>

                    {/* Last Seen */}
                    <td className="py-3 text-right font-mono text-[10.5px] text-slate-500 tabular-nums">
                      {row.lastSeen}
                    </td>

                    {/* Actions icons */}
                    <td className="py-3 text-right pr-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onSelect(row.id)}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-450 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(row.id, 'External Link')}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-455 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(row.id, 'More Info')}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-455 hover:text-white transition-colors"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-550 font-bold">
                  No threat database records matched your search parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-slate-850/50 pt-3.5 flex flex-col sm:flex-row gap-3 justify-between items-center text-[10.5px] text-slate-500 font-semibold">
        {/* Left items count */}
        <span>
          Showing 1 to {records.length} of {records.length} entries
        </span>

        {/* Right page selectors and dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-550">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="py-0.5 px-1 bg-slate-950/40 border border-slate-850 rounded text-slate-400 font-mono"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex space-x-1">
            <button
              type="button"
              disabled
              className="px-2 py-0.5 rounded bg-slate-950/20 border border-slate-850 text-slate-600 cursor-not-allowed"
            >
              Prev
            </button>
            <button
              type="button"
              className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="px-2 py-0.5 rounded bg-slate-950/20 border border-slate-850 text-slate-600 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
