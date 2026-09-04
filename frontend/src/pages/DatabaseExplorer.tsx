import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import DbKpiRow from '../components/database-explorer/DbKpiRow'
import CollectionTabs from '../components/database-explorer/CollectionTabs'
import FilterBar from '../components/database-explorer/FilterBar'
import RecordsTable from '../components/database-explorer/RecordsTable'
import RecordDetailsPanel from '../components/database-explorer/RecordDetailsPanel'
import { dbKpiData, dbDemoRecords } from '../data/databaseExplorerDemoData'
import type { DbRecord, FilterOptions } from '../types/databaseExplorer'

export default function DatabaseExplorer() {
  const [records, setRecords] = useState<DbRecord[]>(dbDemoRecords)
  const [selectedId, setSelectedId] = useState(dbDemoRecords[0].id)
  const [activeTab, setActiveTab] = useState('All Collections')
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    collection: 'All Collections',
    threatLevel: 'All',
    type: 'All',
    source: 'All'
  })
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleAction = (message: string) => {
    setToastMsg(message)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  // Filter records based on activeTab and filters
  const filteredRecords = records.filter((row) => {
    // 1. Tab collections filter
    let matchesTab = true
    if (activeTab === 'URLs/Domains') {
      matchesTab = row.type === 'URL' || row.type === 'Domain'
    } else if (activeTab === 'IP Addresses') {
      matchesTab = row.type === 'IP'
    } else if (activeTab === 'Extensions') {
      matchesTab = row.type === 'Extension'
    } else if (activeTab === 'Files/Hashes') {
      matchesTab = row.type === 'File' || row.type === 'Hash'
    } else if (activeTab === 'Behavior Events') {
      matchesTab = row.type === 'Behavior'
    } else if (activeTab === 'Whitelist') {
      matchesTab = row.source === 'Whitelist'
    } else if (activeTab === 'Alerts') {
      matchesTab = row.threatLevel === 'CRITICAL' || row.threatLevel === 'HIGH'
    } else if (activeTab === 'Indicators') {
      matchesTab = row.indicators.length > 0
    } else if (activeTab === 'Others') {
      matchesTab = row.type === 'Hash' || row.type === 'Behavior'
    }

    if (!matchesTab) return false

    // 2. Query filter
    if (filters.query.trim()) {
      const q = filters.query.toLowerCase()
      const matchesVal = row.value.toLowerCase().includes(q)
      const matchesCategory = row.category.toLowerCase().includes(q)
      const matchesId = row.id.toLowerCase().includes(q)
      if (!matchesVal && !matchesCategory && !matchesId) return false
    }

    // 3. Threat Level filter
    if (filters.threatLevel !== 'All' && row.threatLevel !== filters.threatLevel) {
      return false
    }

    // 4. Type filter
    if (filters.type !== 'All' && row.type !== filters.type) {
      return false
    }

    // 5. Source filter
    if (filters.source !== 'All' && row.source !== filters.source) {
      return false
    }

    return true
  })

  // Set default selection if filtered records change
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const exists = filteredRecords.some((r) => r.id === selectedId)
      if (!exists) {
        setSelectedId(filteredRecords[0].id)
      }
    }
  }, [filteredRecords, selectedId])

  const selectedRecord = records.find((r) => r.id === selectedId) || records[0]

  const handleAddTag = (id: string, newTag: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.tags.includes(newTag.toLowerCase())) return r
          return { ...r, tags: [...r.tags, newTag.toLowerCase()] }
        }
        return r
      })
    )
    handleAction(`Tag "${newTag}" appended to record ${id} locally`)
  }

  const handleRecordAction = (id: string, actionName: string) => {
    handleAction(`Action "${actionName}" executed on record ${id}`)
  }

  const handleResetFilters = () => {
    setFilters({
      query: '',
      collection: 'All Collections',
      threatLevel: 'All',
      type: 'All',
      source: 'All'
    })
    handleAction('Explorer query and option dropdowns reset')
  }

  return (
    <div className="relative space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-800/40 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Database Explorer</h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Explore, search, and analyze all threat data stored in the system.
        </p>
      </div>

      {/* Row 1: KPI Statistics Summary */}
      <DbKpiRow kpis={dbKpiData} />

      {/* Row 2: Collection Pills Tabs */}
      <CollectionTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Row 3: Advanced Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Row 4: Records Table + Selected details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecordsTable
            records={filteredRecords}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAction={handleRecordAction}
          />
        </div>
        <div>
          <RecordDetailsPanel
            record={selectedRecord}
            onAction={handleRecordAction}
            onAddTag={handleAddTag}
          />
        </div>
      </div>
    </div>
  )
}
