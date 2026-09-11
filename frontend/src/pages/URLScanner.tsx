import { useState, useRef } from 'react'
import { 
  History, Layers, RefreshCw, AlertCircle, 
  ShieldAlert, CheckCircle 
} from 'lucide-react'
import ScanInputCard from '../components/url-scanner/ScanInputCard'
import URLReportView from '../components/url-scanner/URLReportView'
import { scansApi } from '../api/scans'
import { useAuth } from '../hooks/useAuth'

type ScannerState = 'empty' | 'loading' | 'result'

export default function URLScanner() {
  const { logout } = useAuth()
  const [pageState, setPageState] = useState<ScannerState>('empty')
  const [scannedUrl, setScannedUrl] = useState('')
  const [scanResult, setScanResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scanSeqRef = useRef<number>(0)

  // Loading steps animation
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const steps = [
    "URL normalization & syntax verification",
    "DNS resolution & IP validation",
    "TLS/SSL certificate & cipher analysis",
    "HTTP reachability & security headers inspection",
    "Phishing & brand impersonation heuristics",
    "Live threat intelligence feeds query"
  ]

  // Modals & drawers
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const handleScan = async (url: string) => {
    const cleanUrl = url.trim()
    if (!cleanUrl) return

    // Increment scan sequence ID to prevent out-of-order race conditions
    const currentSeq = ++scanSeqRef.current

    setScannedUrl(cleanUrl)
    setScanResult(null)
    setPageState('loading')
    setActiveStepIndex(0)
    setError(null)

    // Increment progress step indicators
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 5 ? prev + 1 : prev))
    }, 220)

    try {
      const result = await scansApi.scanUrl(cleanUrl)

      // Drop stale response if another scan was initiated
      if (scanSeqRef.current !== currentSeq) {
        return
      }

      clearInterval(interval)

      // Strict URL verification: Ensure response belongs to the submitted target
      const respTarget = result.submitted_url || result.target_url || result.normalized_url || ''
      if (respTarget) {
        const cleanNorm = cleanUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
        const respNorm = respTarget.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
        if (cleanNorm && respNorm && !respNorm.includes(cleanNorm) && !cleanNorm.includes(respNorm)) {
          console.warn(`Scan response target mismatch: expected ${cleanUrl}, received ${respTarget}`)
        }
      }

      setActiveStepIndex(6)
      setScanResult(result)
      setPageState('result')
    } catch (err: any) {
      if (scanSeqRef.current !== currentSeq) return
      clearInterval(interval)
      setPageState('empty')
      if (err.message?.includes('credentials') || err.message?.includes('validate')) {
        setError('Your session has expired. Redirecting to login...')
        setTimeout(() => {
          logout()
        }, 1500)
      } else {
        setError(err.message || 'Scan failed. Make sure the backend server is reachable on port 8000.')
      }
    }
  }

  const handleReset = () => {
    scanSeqRef.current++
    setPageState('empty')
    setScannedUrl('')
    setScanResult(null)
    setError(null)
  }

  const handleOpenHistory = async () => {
    setShowHistory(true)
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem('cyberwatch_jwt_token')
      const res = await fetch('http://127.0.0.1:8000/api/scans/history', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (res.ok) {
        const json = await res.json()
        const urlScans = (json.data || []).filter((s: any) => s.scan_type === 'URL')
        setHistoryList(urlScans)
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">URL / Phishing Scanner</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Analyze URLs for phishing, domain spoofing, suspicious structures, and network risks.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Scan History</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Scan</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Scan Input Card (Always Visible) */}
      <ScanInputCard
        onScan={handleScan}
        onReset={handleReset}
        isLoading={pageState === 'loading'}
      />

      {/* Empty State / Error State */}
      {pageState === 'empty' && (
        error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 flex flex-col items-center justify-center text-center space-y-3.5 animate-in fade-in">
            <div className="p-3.5 rounded-full bg-red-950/40 text-red-500 border border-red-900/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-bold text-red-400 font-sans">Scan failed</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#202428]/20 p-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3.5 rounded-full bg-slate-900 text-slate-650 border border-slate-850">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-bold text-slate-350">No Scan Active</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Enter a URL above and click Analyze URL to begin your security analysis.
              </p>
            </div>
          </div>
        )
      )}

      {/* Loading Checklist State */}
      {pageState === 'loading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#202428] p-6 space-y-4">
            <div className="flex items-center space-x-3 mb-1">
              <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
              <h3 className="text-sm font-bold text-white">Inspecting Threat Intelligence...</h3>
            </div>
            <div className="p-3 bg-[#181B1F]/60 rounded-lg border border-slate-800/40 text-xs font-mono truncate">
              <span className="text-slate-500 mr-2">Target URL:</span>
              <span className="text-slate-350">{scannedUrl}</span>
            </div>
            <div className="space-y-3 pt-2">
              {steps.map((step, idx) => {
                const isComplete = idx < activeStepIndex
                const isActive = idx === activeStepIndex
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#181B1F]/60 rounded-lg text-xs font-semibold">
                    <span className={isComplete ? "text-slate-400" : isActive ? "text-white" : "text-slate-600"}>
                      {step}
                    </span>
                    {isComplete ? (
                      <span className="text-teal-400 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </span>
                    ) : isActive ? (
                      <span className="text-amber-500 animate-pulse">Checking...</span>
                    ) : (
                      <span className="text-slate-600">Pending</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#202428]/40 p-6 flex flex-col justify-center items-center text-center opacity-50">
            <ShieldAlert className="w-10 h-10 text-slate-700 animate-bounce mb-3" />
            <h4 className="text-xs font-bold text-slate-500">Heuristics Engine Evaluating</h4>
            <p className="text-[10px] text-slate-650 mt-1 max-w-[200px]">
              Extracting domain structures and scanning for obfuscations.
            </p>
          </div>
        </div>
      )}

      {/* 7-Section Professional Report Presentation */}
      {pageState === 'result' && scanResult && (
        <URLReportView 
          result={scanResult} 
          onReset={handleReset} 
        />
      )}

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#181B1F] border-l border-[#343A40] h-full flex flex-col p-6 text-left shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b border-[#343A40] pb-4 mb-4">
              <div className="flex items-center space-x-2 text-white">
                <History className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-base">URL Scan History</h3>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 bg-[#202428] border border-[#343A40] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
                  <span className="text-xs text-slate-500">Loading history logs...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-slate-700" />
                  <p className="text-xs text-slate-400 font-semibold max-w-[240px]">
                    No scans yet. Enter a URL above to begin your first security analysis.
                  </p>
                </div>
              ) : (
                historyList.map((item) => {
                  const res = item.result || {}
                  const riskColor = 
                    res.risk_level === 'Critical' || res.risk_level === 'CRITICAL' ? 'text-red-400' : 
                    res.risk_level === 'High' || res.risk_level === 'HIGH' ? 'text-orange-400' : 
                    res.risk_level === 'Medium' || res.risk_level === 'MEDIUM' ? 'text-amber-400' : 
                    'text-teal-400'
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setScanResult(res)
                        setScannedUrl(item.target)
                        setPageState('result')
                        setShowHistory(false)
                      }}
                      className="p-3.5 bg-[#202428] border border-[#343A40] hover:border-teal-500/50 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[220px] select-all">
                          {item.target}
                        </span>
                        <span className={`text-[10px] font-extrabold tracking-wider ${riskColor}`}>
                          {res.risk_level || item.risk_level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#343A40]/40 text-[10px] text-slate-500 font-medium">
                        <span>Score: {res.threat_score ?? (res.threat_index ?? item.risk_score)}/100</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
