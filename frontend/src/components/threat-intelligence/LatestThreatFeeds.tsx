import { useState, useEffect } from 'react'
import { CheckCircle, SlidersHorizontal } from 'lucide-react'
import { threatIntelligenceDemoData } from '../../data/threatIntelligenceDemoData'
import { SEVERITY_COLORS } from '../../utils/constants'

type FilterCategory = 'all' | 'phishing' | 'malware' | 'domain' | 'ip' | 'extension' | 'cve'

export default function LatestThreatFeeds() {
  const [activeTab, setActiveTab] = useState<FilterCategory>('all')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const tabs: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All Feeds' },
    { id: 'phishing', label: 'Phishing' },
    { id: 'malware', label: 'Malware' },
    { id: 'domain', label: 'Domains' },
    { id: 'ip', label: 'IP Addresses' },
    { id: 'extension', label: 'Extensions' },
    { id: 'cve', label: 'CVE' }
  ]

  const handleAction = (indicator: string, actionName: string) => {
    setToastMsg(`Action "${actionName}" for ${indicator} logged locally (backend not connected)`)
  }

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  // Filter items
  const filteredFeeds = threatIntelligenceDemoData.latestFeeds.filter((item) => {
    if (activeTab === 'all') return true
    return item.category === activeTab
  })

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col hover:border-slate-700 transition-colors text-left overflow-hidden">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-250">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-none">Latest Threat Feeds</h2>
          <span className="text-xs text-slate-500 mt-1 block">Unified feed updates log</span>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
          View All
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-850/60 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-1 px-3 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table canvas */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pb-2">Time</th>
              <th className="py-2.5 pb-2">Indicator</th>
              <th className="py-2.5 pb-2">Type</th>
              <th className="py-2.5 pb-2">Risk</th>
              <th className="py-2.5 pb-2">Source</th>
              <th className="py-2.5 pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/50">
            {filteredFeeds.length > 0 ? (
              filteredFeeds.map((row) => {
                const colorSet = SEVERITY_COLORS[row.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.LOW
                const isExt = row.type.includes('Ext')

                return (
                  <tr key={row.id} className="hover:bg-slate-950/10 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-slate-500 tabular-nums">
                      {row.time}
                    </td>
                    <td className="py-3 font-mono text-[11px] font-bold text-slate-200 select-all max-w-[200px] truncate">
                      {row.indicator}
                    </td>
                    <td className="py-3 text-slate-400 font-semibold">{row.type}</td>
                    <td className="py-3">
                      <span
                        className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border leading-none ${colorSet.bg} ${colorSet.text} ${colorSet.border}`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-semibold">{row.source}</td>
                    <td className="py-3 text-right">
                      {isExt ? (
                        <button
                          onClick={() => handleAction(row.indicator, 'Quarantine')}
                          className="py-1 px-2.5 text-[10px] font-bold text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/80 border border-orange-500/20 hover:border-transparent rounded transition-colors active:scale-95"
                        >
                          Quarantine
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(row.indicator, 'Block')}
                          className="py-1 px-2.5 text-[10px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 border border-red-500/20 hover:border-transparent rounded transition-colors active:scale-95"
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                  <div className="flex flex-col items-center space-y-2">
                    <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                    <span>No indicators match selected category filter.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
