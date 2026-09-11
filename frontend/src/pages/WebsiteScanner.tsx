import { useState } from 'react'
import {
  History, RefreshCw, AlertCircle,
  CheckCircle
} from 'lucide-react'
import ScanInputCard from '../components/website-scanner/ScanInputCard'
import WebsiteReportView from '../components/website-scanner/WebsiteReportView'
import { scansApi } from '../api/scans'
import { useAuth } from '../hooks/useAuth'
import type { WebsiteScanResult } from '../types/websiteScanner'

type ScannerState = 'empty' | 'loading' | 'result'

export default function WebsiteScanner() {
  const { logout } = useAuth()
  const [pageState, setPageState] = useState<ScannerState>('empty')
  const [scannedUrl, setScannedUrl] = useState('')
  const [scanResult, setScanResult] = useState<WebsiteScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Loading steps animation
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const steps = [
    "Input normalization & SSRF check",
    "DNS resolution & network routing",
    "HTTP reachability & response headers",
    "SSL/TLS handshake & certificate audit",
    "HTML structure & form security",
    "Brand impersonation & phishing analysis",
    "Live threat intelligence lookup"
  ]

  // Modals & drawers
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const handleScan = async (url: string) => {
    if (!url.trim()) return
    setScannedUrl(url)
    setScanResult(null)
    setPageState('loading')
    setActiveStepIndex(0)
    setError(null)

    // Increment progress step indicators
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 6 ? prev + 1 : prev))
    }, 250)

    try {
      const result = await scansApi.scanWebsite(url)
      clearInterval(interval)
      setActiveStepIndex(7)
      setScanResult(result)
      setPageState('result')
    } catch (err: any) {
      clearInterval(interval)
      setPageState('empty')
      if (err.message?.includes('credentials') || err.message?.includes('expired') || err.message?.includes('validate')) {
        setError('Your session has expired. Redirecting to login...')
        setTimeout(() => {
          logout()
        }, 1500)
      } else {
        setError(err.message || 'Website scan failed. Please verify that the backend is online.')
      }
    }
  }

  const handleReset = () => {
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
        const websiteScans = (json.data || []).filter((s: any) => s.scan_type === 'Website')
        setHistoryList(websiteScans)
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
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Website Scanner</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Evidence-based website security auditor: TLS/SSL certificates, security headers, form security, and threat intelligence.
          </p>
        </div>

        {/* Top-Right Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Scan History</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Page Error Alert block */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scan Input Card (Visible when not showing result, or minimized) */}
      {pageState !== 'result' && (
        <ScanInputCard
          onScan={handleScan}
          onReset={handleReset}
          isLoading={pageState === 'loading'}
        />
      )}

      {/* Pages State Controller */}
      {pageState === 'empty' && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-12 sm:p-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-xs space-y-1">
            <h3 className="text-sm font-bold text-slate-300">Ready for Website Inspection</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter a website URL above (e.g. example.com or https://...) to execute a live security audit.
            </p>
          </div>
        </div>
      )}

      {pageState === 'loading' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-10 h-10">
              <span className="absolute inset-0 rounded-full border-2 border-teal-500/10" />
              <span className="absolute inset-0 rounded-full border-2 border-t-teal-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Inspecting website security parameters...</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                {scannedUrl}
              </p>
            </div>

            {/* Diagnostic Steps Checklist */}
            <div className="w-full max-w-md space-y-2 pt-2 text-left">
              {steps.map((step, idx) => {
                const isDone = idx < activeStepIndex
                const isCurrent = idx === activeStepIndex
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${
                      isDone
                        ? 'text-teal-400 font-medium'
                        : isCurrent
                        ? 'text-white font-bold animate-pulse'
                        : 'text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border border-teal-400 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {pageState === 'result' && scanResult && (
        <WebsiteReportView
          result={scanResult}
          onNewScan={handleReset}
          onReset={handleReset}
        />
      )}

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Recent Website Scans</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {loadingHistory ? (
                <div className="text-center py-8 text-slate-500 text-xs">Loading audit history...</div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No previous website scans found.</div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowHistory(false)
                      if (item.result) {
                        setScanResult(item.result)
                        setPageState('result')
                      } else {
                        handleScan(item.target)
                      }
                    }}
                    className="p-3 bg-slate-950/60 border border-slate-850 hover:border-slate-700 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-850/40"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono font-bold text-white truncate max-w-sm">
                        {item.target}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(item.created_at).toLocaleString()} • ID #{item.id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : item.risk_level === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      }`}>
                        {item.risk_level || 'COMPLETED'}
                      </span>
                      {typeof item.risk_score === 'number' && (
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {item.risk_score}/100
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
