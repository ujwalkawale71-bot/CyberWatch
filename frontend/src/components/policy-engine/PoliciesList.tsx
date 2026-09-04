import { useState } from 'react'
import { Search, ChevronDown, FileText } from 'lucide-react'
import type { PolicyItem } from '../../types/policyEngine'

interface PoliciesListProps {
  policies: PolicyItem[]
  selectedId: string
  onSelect: (id: string) => void
}

type StatusFilter = 'All' | 'Active' | 'Paused' | 'Inactive'

export default function PoliciesList({
  policies,
  selectedId,
  onSelect
}: PoliciesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const filteredPolicies = policies.filter((pol) => {
    const matchesSearch = pol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pol.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' ? true : pol.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectStatus = (status: StatusFilter) => {
    setStatusFilter(status)
    setDropdownOpen(false)
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[540px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Top Filter and Search Bar Row */}
      <div className="space-y-3.5">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Policies</h2>
          <span className="text-xs text-slate-500 mt-1 block">Configured organizational rules</span>
        </div>

        {/* Input Search + Dropdown */}
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search policies..."
              className="w-full py-2 pl-9 pr-4 bg-slate-955 border border-slate-850 rounded-lg text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filter Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 py-2 px-3 bg-slate-950/40 hover:bg-slate-850 border border-slate-850 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>{statusFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-550" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-10 text-xs">
                {(['All', 'Active', 'Paused', 'Inactive'] as StatusFilter[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStatus(st)}
                    className="w-full py-2 px-3 text-left hover:bg-slate-800 text-slate-300 hover:text-white transition-colors block"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table feed list */}
      <div className="flex-1 overflow-y-auto overflow-x-auto pr-1 -mx-5 px-5 my-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Policy Name</th>
              <th className="py-2.5 pb-2 text-center">Priority</th>
              <th className="py-2.5 pb-2 text-center">Status</th>
              <th className="py-2.5 pb-2 text-right">Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/40">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((pol) => {
                const isSelected = pol.id === selectedId
                const statusStyles =
                  pol.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                    : pol.status === 'Paused'
                    ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                    : 'bg-slate-800/40 text-slate-405 border border-slate-700/60'

                return (
                  <tr
                    key={pol.id}
                    onClick={() => onSelect(pol.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/40 border-l-2 border-l-blue-500'
                        : 'hover:bg-slate-955/15 border-l-2 border-l-transparent'
                    }`}
                  >
                    <td className="py-3 pl-2 font-bold text-slate-200 truncate max-w-[130px] flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{pol.name}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-950/20 px-1.5 py-0.5 rounded leading-none border border-slate-850/50">
                        {pol.priority}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[8.5px] font-extrabold tracking-wider px-1.5 py-0.5 rounded leading-none ${statusStyles}`}
                      >
                        {pol.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-[10.5px] text-slate-500 tabular-nums">
                      {pol.lastModified}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                  No policies found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination summary */}
      <div className="border-t border-slate-850/50 pt-3 flex justify-between items-center text-[10.5px] text-slate-500 font-semibold">
        <span>
          Showing 1 to {filteredPolicies.length} of {policies.length} policies
        </span>
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
            disabled
            className="px-2 py-0.5 rounded bg-slate-950/20 border border-slate-850 text-slate-600 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
