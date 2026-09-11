import { useState, useEffect } from 'react'
import { Search, Loader2, ArrowRight, X, AlertCircle } from 'lucide-react'
import type { IOCType } from '../../types/threatIntelligence'

interface IOCInvestigatorProps {
  onInvestigate: (ioc: string) => Promise<void>
  loading: boolean
  error: string | null
  currentIOC?: string
}

function detectIOCType(input: string): IOCType {
  const val = input.trim()
  if (!val) return 'unknown'
  if (/^[a-fA-F0-9]{64}$/.test(val)) return 'sha256'
  if (/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val)) return 'ipv4'
  if (val.startsWith('http://') || val.startsWith('https://') || val.includes('/')) return 'url'
  if (/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(val)) return 'domain'
  return 'unknown'
}

export default function IOCInvestigator({
  onInvestigate,
  loading,
  error,
  currentIOC
}: IOCInvestigatorProps) {
  const [inputVal, setInputVal] = useState(currentIOC || '')
  const detectedType = detectIOCType(inputVal)

  // Sync state whenever external trigger sets currentIOC
  useEffect(() => {
    if (currentIOC !== undefined && currentIOC !== inputVal) {
      setInputVal(currentIOC)
    }
  }, [currentIOC])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim() || loading) return
    onInvestigate(inputVal.trim())
  }

  const handleQuickSelect = (example: string) => {
    setInputVal(example)
    onInvestigate(example)
  }

  const typeBadgeColors: Record<IOCType, string> = {
    url: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    domain: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ipv4: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ipv6: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    sha256: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    unknown: 'bg-slate-800 text-slate-400 border-slate-700'
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" />
          IOC Threat Investigation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform live multi-vendor intelligence queries across VirusTotal, URLhaus, PhishTank, and Google Safe Browsing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter URL, Domain (e.g. example.org), IPv4 (e.g. 8.8.8.8), or SHA-256 hash..."
              disabled={loading}
              className="w-full pl-4 pr-24 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
            />
            {inputVal && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {detectedType !== 'unknown' && (
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${typeBadgeColors[detectedType]}`}
                  >
                    {detectedType}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputVal.trim() || loading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <span>Investigate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Example Triggers */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/60">
        <span className="text-[11px] font-medium text-slate-500">Quick Test IOCs:</span>
        <button
          type="button"
          onClick={() => handleQuickSelect('example.org')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          example.org (Domain)
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('8.8.8.8')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          8.8.8.8 (IPv4)
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('https://testsafebrowsing.appspot.com/s/phishing.html')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          testsafebrowsing... (URL)
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          e3b0c442... (SHA-256)
        </button>
      </div>
    </div>
  )
}
