import { useState } from 'react'
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { FilterOptions } from '../../types/databaseExplorer'

interface FilterBarProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
  onReset: () => void
}

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const [query, setQuery] = useState(filters.query)
  const [threatLevel, setThreatLevel] = useState(filters.threatLevel)
  const [type, setType] = useState(filters.type)
  const [source, setSource] = useState(filters.source)
  const [dateRange, setDateRange] = useState('Last 30 Days')

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    onChange({
      query,
      collection: filters.collection,
      threatLevel,
      type,
      source
    })
  }

  const handleResetClick = () => {
    setQuery('')
    setThreatLevel('All')
    setType('All')
    setSource('All')
    setDateRange('Last 30 Days')
    onReset()
  }

  return (
    <form
      onSubmit={handleApply}
      className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-750 transition-colors flex flex-col md:flex-row gap-3 items-end text-xs text-left"
    >
      {/* Search Input */}
      <div className="flex-1 w-full space-y-1.5">
        <label className="font-semibold text-slate-500">Search</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-550" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in database..."
            className="w-full py-2 pl-9 pr-4 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-all font-semibold"
          />
        </div>
      </div>

      {/* Threat Level */}
      <div className="w-full md:w-32 space-y-1.5">
        <label className="font-semibold text-slate-500">Threat Level</label>
        <select
          value={threatLevel}
          onChange={(e) => setThreatLevel(e.target.value)}
          className="w-full py-2 px-2 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
        >
          <option value="All">All Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="SAFE">Safe</option>
        </select>
      </div>

      {/* Type */}
      <div className="w-full md:w-32 space-y-1.5">
        <label className="font-semibold text-slate-500">Record Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full py-2 px-2 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
        >
          <option value="All">All Types</option>
          <option value="URL">URL</option>
          <option value="Domain">Domain</option>
          <option value="IP">IP</option>
          <option value="Extension">Extension</option>
          <option value="File">File</option>
          <option value="Hash">Hash</option>
          <option value="Behavior">Behavior</option>
        </select>
      </div>

      {/* Source */}
      <div className="w-full md:w-36 space-y-1.5">
        <label className="font-semibold text-slate-500">Engine Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full py-2 px-2 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
        >
          <option value="All">All Sources</option>
          <option value="Web Scanner">Web Scanner</option>
          <option value="Threat Intel Feed">Threat Intel Feed</option>
          <option value="Extension Scanner">Extension Scanner</option>
          <option value="Download Scanner">Download Scanner</option>
          <option value="Behavior Monitor">Behavior Monitor</option>
          <option value="Email Scanner">Email Scanner</option>
          <option value="Whitelist">Whitelist</option>
        </select>
      </div>

      {/* Date Picker Input (Static demo) */}
      <div className="w-full md:w-32 space-y-1.5">
        <label className="font-semibold text-slate-500">Date Range</label>
        <input
          type="text"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full py-2 px-3 bg-slate-955 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-semibold text-center"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
        <button
          type="button"
          onClick={handleResetClick}
          className="flex-1 md:flex-initial py-2 px-3.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded-lg font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          type="submit"
          className="flex-1 md:flex-initial py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-755 text-white font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/10"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
      </div>
    </form>
  )
}
