import { useState } from 'react'
import { Search, ShieldAlert, CheckCircle } from 'lucide-react'

type SearchTab = 'domain' | 'ip' | 'url' | 'hash' | 'ext' | 'cve'

export default function IndicatorSearch() {
  const [activeTab, setActiveTab] = useState<SearchTab>('domain')
  const [searchVal, setSearchVal] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const tabs = [
    { id: 'domain' as SearchTab, label: 'Domain', placeholder: 'e.g., bank-update.net' },
    { id: 'ip' as SearchTab, label: 'IP Address', placeholder: 'e.g., 185.199.108.153' },
    { id: 'url' as SearchTab, label: 'URL', placeholder: 'e.g., https://example.com/login' },
    { id: 'hash' as SearchTab, label: 'Hash', placeholder: 'e.g., md5/sha256 hash' },
    { id: 'ext' as SearchTab, label: 'Extension ID', placeholder: 'e.g., aabcbjklmmebngbp...' },
    { id: 'cve' as SearchTab, label: 'CVE', placeholder: 'e.g., CVE-2024-1234' }
  ]

  const activeInfo = tabs.find((t) => t.id === activeTab) || tabs[0]

  const handleAction = (name: string) => {
    setToastMsg(`Action "${name}" logged locally`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const details = [
    { label: 'Risk Level', value: 'Critical', color: 'text-red-500' },
    { label: 'Category', value: 'Phishing', color: 'text-slate-200' },
    { label: 'First Seen', value: 'May 10, 2025', color: 'text-slate-300' },
    { label: 'Last Seen', value: 'May 16, 2026', color: 'text-slate-350' },
    { label: 'Reputation', value: 'Malicious (5/92 engines)', color: 'text-red-400 font-mono text-[10px]' },
    { label: 'Registrar', value: 'Namecheap Inc.', color: 'text-slate-300' }
  ]

  const bullets = [
    'Phishing campaign',
    'Credential harvesting',
    'Target: PayPal users',
    'Similar domains: 243',
    'Used in 12,487 attacks'
  ]

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col h-[420px] hover:border-slate-700 transition-colors justify-between text-left overflow-hidden">
      {/* Toast Alert overlay */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900 border border-slate-700 px-3.5 py-2.5 rounded-lg flex items-center space-x-2 shadow-2xl">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-200">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white leading-none">Indicator Search & Enrichment</h2>
        <span className="text-xs text-slate-500 mt-1 block">Threat database query scanner</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-850/60 my-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              setSearchVal('')
            }}
            className={`py-1.5 px-1 rounded-md text-[10px] font-bold transition-all truncate text-center ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white border border-slate-700/50'
                : 'text-slate-555 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={activeInfo.placeholder}
            className="w-full py-2 pl-9 pr-4 bg-slate-955 border border-slate-850 rounded-lg text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAction('Analyze Indicator')}
          className="py-2 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 rounded-lg transition-all active:scale-[0.98]"
        >
          Analyze
        </button>
      </div>

      {/* Default Result Card */}
      <div className="flex-1 mt-4 p-3 rounded-lg border border-slate-850 bg-slate-950/20 flex flex-col justify-between overflow-y-auto">
        {/* Banner red header */}
        <div className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20 mb-2">
          <div className="flex items-center space-x-2 text-red-500">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase leading-none">
              Malicious Domain Detected
            </span>
          </div>
          <span className="text-[9px] font-extrabold tracking-widest bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded leading-none border border-red-500/30">
            CONFIDENCE: 95%
          </span>
        </div>

        {/* Content details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-relaxed pt-1.5">
          {/* Key-Value Details */}
          <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-850/80 pr-2">
            {details.map((det) => (
              <div key={det.label} className="flex justify-between">
                <span className="text-slate-450 font-medium">{det.label}:</span>
                <span className={`font-bold ${det.color}`}>{det.value}</span>
              </div>
            ))}
          </div>

          {/* Related Intel Bullets */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Related Intelligence:
            </span>
            <ul className="list-disc pl-3 text-slate-400 space-y-1 font-semibold">
              {bullets.map((b, idx) => (
                <li key={idx} className="truncate">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Button action row */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          onClick={() => handleAction('Detailed Report')}
          className="py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
        >
          View Detailed Report
        </button>
        <button
          type="button"
          onClick={() => handleAction('Add blocklist')}
          className="py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-lg transition-colors"
        >
          Add to Blocklist
        </button>
      </div>
    </div>
  )
}
