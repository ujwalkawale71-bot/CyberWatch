import { useState } from 'react'
import { History, RefreshCw, AlertCircle, X } from 'lucide-react'
import ScanInputCard from '../components/extension-scanner/ScanInputCard'
import ExtensionReportView from '../components/extension-scanner/ExtensionReportView'
import { scansApi } from '../api/scans'
import { useAuth } from '../hooks/useAuth'
import type { ExtensionScanResult } from '../types/extensionScanner'

type ScannerState = 'empty' | 'loading' | 'result' | 'error'

export default function ExtensionScanner() {
  const [pageState, setPageState] = useState<ScannerState>('empty')
  const [scannedVal, setScannedVal] = useState('')
  const [scanResult, setScanResult] = useState<ExtensionScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const { logout } = useAuth()

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem('cyberwatch_jwt_token')
      const res = await fetch('http://127.0.0.1:8000/api/scans/history', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (res.ok) {
        const json = await res.json()
        const extScans = (json.data || []).filter((s: any) => s.scan_type === 'Extension')
        setHistoryItems(extScans)
      }
    } catch (err) {
      console.error('Failed to load extension scan history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleOpenHistory = () => {
    setShowHistoryModal(true)
    fetchHistory()
  }

  const handleScan = async (value: string, method: 'url' | 'id' | 'upload' | 'paste' | 'package') => {
    // 1. Immediately reset state to isolate from prior scans
    setScanResult(null)
    setPageState('loading')
    setErrorMsg(null)

    let requestedId: string | null = null

    try {
      let payload: any = {}
      if (method === 'url' || method === 'id') {
        setScannedVal(value)
        payload = { input_value: value }
        const idMatch = value.match(/([a-p]{32})/i)
        if (idMatch) {
          requestedId = idMatch[1].toLowerCase()
        }
      } else if (method === 'package') {
        setScannedVal('Uploaded Extension Archive')
        payload = { package_base64: value }
      } else {
        let manifest: any
        try {
          manifest = JSON.parse(value)
        } catch (parseErr: any) {
          throw new Error(`Invalid JSON in manifest: ${parseErr.message}`)
        }

        requestedId = manifest.id || manifest.extension_id || null
        setScannedVal(manifest.name || (method === 'paste' ? 'Pasted manifest' : 'manifest.json'))
        payload = {
          input_value: value,
          extension_id: manifest.id || manifest.extension_id || undefined,
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          manifest_version: manifest.manifest_version,
          permissions: manifest.permissions || [],
          host_permissions: manifest.host_permissions || [],
          optional_permissions: manifest.optional_permissions || [],
          optional_host_permissions: manifest.optional_host_permissions || [],
          content_scripts: manifest.content_scripts || undefined,
          background: manifest.background || undefined,
          raw_manifest: manifest,
          _clientParsedManifest: manifest
        }
      }

      const result = await scansApi.scanExtension(payload)

      // 2. Strict ID verification check: stop analysis if mismatch
      if (requestedId && result.extensionId && result.extensionId !== 'N/A') {
        if (result.extensionId.toLowerCase() !== requestedId.toLowerCase()) {
          throw new Error(`RESULT_MISMATCH: Requested extension ID '${requestedId}' does not match resolved ID '${result.extensionId}'.`)
        }
      }

      setScanResult(result)
      setPageState('result')
    } catch (err: any) {
      setScanResult(null)
      if (err.message?.includes('session has expired')) {
        setErrorMsg('Session expired. Logging out...')
        setTimeout(() => logout(), 1500)
      } else {
        setErrorMsg(err.message || 'Failed to analyze extension.')
      }
      setPageState('error')
    }
  }


  const handleReset = () => {
    setPageState('empty')
    setScannedVal('')
    setScanResult(null)
    setErrorMsg(null)
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Extension Scanner</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Analyze browser extensions for dangerous permissions, broad host access, and privacy risks with transparent deterministic scoring.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Scan History</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/10 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Error state alert */}
      {pageState === 'error' && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-400">Scan Failed</h3>
            <p className="text-xs text-red-300/80 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Input panel (always visible) */}
      <ScanInputCard
        onScan={handleScan}
        onReset={handleReset}
        isLoading={pageState === 'loading'}
      />

      {/* State views */}
      {pageState === 'empty' && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-xs space-y-1">
            <h3 className="text-sm font-bold text-slate-300">No Scan Active</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter an extension ID, choose a test preset, or upload a manifest.json to view the security audit report.
            </p>
          </div>
        </div>
      )}

      {pageState === 'loading' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-10 h-10">
              <span className="absolute inset-0 rounded-full border-2 border-blue-500/10" />
              <span className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Analyzing extension permissions & security model...</h3>
              <p className="text-[11px] text-slate-400 font-mono font-medium truncate max-w-md">
                {scannedVal}
              </p>
            </div>
          </div>

          {/* Pulsing skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-40 select-none pointer-events-none">
            <div className="h-60 bg-slate-900/40 rounded-xl animate-pulse border border-slate-850" />
            <div className="h-60 bg-slate-900/40 rounded-xl animate-pulse border border-slate-850" />
          </div>
        </div>
      )}

      {pageState === 'result' && scanResult && (
        <ExtensionReportView result={scanResult} onReset={handleReset} />
      )}

      {/* Scan History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Extension Scan History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading audit history...</div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No previous extension scans recorded. Perform a scan to view history here.
                </div>
              ) : (
                historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white font-mono">{item.target}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border leading-none ${
                          item.risk_level === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : item.risk_level === 'HIGH'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : item.risk_level === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.risk_level} ({item.risk_score})
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
