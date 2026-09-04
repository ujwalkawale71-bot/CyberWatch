import { useState } from 'react'
import { 
  History, Layers, RefreshCw, AlertCircle, CheckCircle, XCircle, 
  FileText, Download, ShieldAlert, ShieldCheck, CheckSquare, AlertTriangle, Award 
} from 'lucide-react'
import ScanInputCard from '../components/url-scanner/ScanInputCard'
import { scansApi } from '../api/scans'
import { useAuth } from '../hooks/useAuth'

type ScannerState = 'empty' | 'loading' | 'result'

interface URLScanResponse {
  target_url: string
  extracted_domain: string
  inspected_date: string
  security_audit_status: string
  threat_index: number
  risk_level: string
  security_verdict: string
  audit_checklist: {
    https: boolean
    domain_structure: boolean
    url_pattern: boolean
    suspicious_indicators: boolean
    redirect_shortener: boolean
  }
  heuristic_indicators: string[]
  recommendations: string[]
  
  normalized_url?: string
  hostname?: string
  domain?: string
  protocol?: string
  detected_indicators?: string[]
  passed_checks?: string[]
  warnings?: string[]
  threat_intelligence_result?: any | null
  threat_score?: number
  explanation?: string
  timestamp?: string
}

export default function URLScanner() {
  const { logout } = useAuth()
  const [pageState, setPageState] = useState<ScannerState>('empty')
  const [scannedUrl, setScannedUrl] = useState('')
  const [scanResult, setScanResult] = useState<URLScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Loading steps animation
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const steps = [
    "URL validation",
    "Domain analysis",
    "SSL/HTTPS check",
    "URL structure analysis",
    "Suspicious pattern detection",
    "Risk calculation"
  ]

  // Modals & drawers
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showDetailedModal, setShowDetailedModal] = useState(false)

  const handleScan = async (url: string) => {
    if (!url.trim()) return
    setScannedUrl(url)
    setPageState('loading')
    setActiveStepIndex(0)
    setError(null)

    // Increment progress step indicators
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 5 ? prev + 1 : prev))
    }, 220)

    try {
      const result = await scansApi.scanUrl(url)
      clearInterval(interval)
      setActiveStepIndex(6)
      setScanResult(result)
      setPageState('result')
    } catch (err: any) {
      clearInterval(interval)
      setPageState('empty')
      if (err.message?.includes('credentials') || err.message?.includes('validate')) {
        setError('Your session has expired. Redirecting to login...')
        setTimeout(() => {
          logout()
        }, 1500)
      } else {
        setError(err.message || 'Scan failed. Make sure the backend is active on port 8000.')
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
        const urlScans = (json.data || []).filter((s: any) => s.scan_type === 'URL')
        setHistoryList(urlScans)
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSaveReport = () => {
    if (!scanResult) return
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CyberWatch_URL_Report_${scanResult.extracted_domain || 'report'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Risk Score colors
  const getRiskColors = (score: number) => {
    if (score >= 75) return { text: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5', stroke: '#D9534F' }
    if (score >= 50) return { text: 'text-orange-500', border: 'border-orange-500/20', bg: 'bg-orange-500/5', stroke: '#E07A3F' }
    if (score >= 25) return { text: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5', stroke: '#D4A72C' }
    return { text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', stroke: '#2A9D8F' }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">URL / Phishing Scanner</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Analyze URLs for phishing, malware, and suspicious activity using structural audits.
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
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
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
                Enter a URL above and click Scan URL to begin your first security analysis.
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
              <RefreshCw className="w-5 h-5 text-[#2A9D8F] animate-spin" />
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
                      <span className="text-emerald-500 flex items-center space-x-1">
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

      {/* Dynamic Results Dashboard */}
      {pageState === 'result' && scanResult && (() => {
        const score = scanResult.threat_score ?? (scanResult.threat_index ?? 0)
        const colors = getRiskColors(score)
        const checks = {
          https: scanResult.passed_checks?.includes('https') ?? (scanResult.audit_checklist?.https ?? true),
          domain_structure: scanResult.passed_checks?.includes('domain_structure') ?? (scanResult.audit_checklist?.domain_structure ?? true),
          url_pattern: scanResult.passed_checks?.includes('url_pattern') ?? (scanResult.audit_checklist?.url_pattern ?? true),
          suspicious_indicators: scanResult.passed_checks?.includes('suspicious_indicators') ?? (scanResult.audit_checklist?.suspicious_indicators ?? true),
          redirect_shortener: scanResult.passed_checks?.includes('redirect_shortener') ?? (scanResult.audit_checklist?.redirect_shortener ?? true)
        }
        const indicatorsList = scanResult.detected_indicators || (scanResult.heuristic_indicators || [])
        const recommendationsList = scanResult.recommendations || []
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            
            {/* Left side checklist and details (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Summary Metadata card */}
              <div className="rounded-xl border border-slate-800 bg-[#202428] p-5 space-y-3.5">
                <div className="flex items-center space-x-2 text-white pb-3 border-b border-slate-800">
                  <CheckSquare className="w-4 h-4 text-[#2A9D8F]" />
                  <h3 className="text-sm font-extrabold">Scanned Host Parameters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-500 block mb-1">Target URL</span>
                    <span className="text-slate-200 select-all break-all">{scanResult.target_url}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Extracted Domain</span>
                    <span className="text-slate-200 select-all">{scanResult.domain || scanResult.extracted_domain}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Inspected Date</span>
                    <span className="text-slate-400">
                      {new Date(scanResult.timestamp || scanResult.inspected_date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Security Audit Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {scanResult.security_audit_status || 'Completed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Checks List card */}
              <div className="rounded-xl border border-slate-800 bg-[#202428] p-5 space-y-3">
                <div className="flex items-center space-x-2 text-white pb-3 border-b border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-[#2A9D8F]" />
                  <h3 className="text-sm font-extrabold">Security Audits Checklist</h3>
                </div>
                <div className="space-y-2.5 pt-1.5 text-xs font-semibold">
                  <div className="flex items-center justify-between p-2 bg-[#181B1F]/60 rounded-lg">
                    <span className="text-slate-350">Transport Layer Status (HTTPS)</span>
                    {checks.https ? (
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>✓ HTTPS Secured</span>
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>✗ Unencrypted connection</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#181B1F]/60 rounded-lg">
                    <span className="text-slate-350">Domain Structure Integrity</span>
                    {checks.domain_structure ? (
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>✓ Clean Structure</span>
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Anomaly detected</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#181B1F]/60 rounded-lg">
                    <span className="text-slate-350">URL Pattern Verifier</span>
                    {checks.url_pattern ? (
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>✓ Standard Pattern</span>
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Obfuscated parameter matched</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#181B1F]/60 rounded-lg">
                    <span className="text-slate-350">Suspicious Brand Keywords Check</span>
                    {checks.suspicious_indicators ? (
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>✓ Clean Content</span>
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Malicious terminology flagged</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#181B1F]/60 rounded-lg">
                    <span className="text-slate-350">Redirects / Link Shortener Shield</span>
                    {checks.redirect_shortener ? (
                      <span className="text-emerald-500 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>✓ Standard Host</span>
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Link Mask Shortener found</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detected Indicators List */}
              <div className="rounded-xl border border-slate-800 bg-[#202428] p-5 space-y-3">
                <div className="flex items-center space-x-2 text-white pb-3 border-b border-slate-800">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-extrabold">Heuristics Indicators Identified</h3>
                </div>
                {indicatorsList.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 font-semibold">
                    No suspicious threat indicators detected.
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 font-semibold text-xs">
                    {indicatorsList.map((ind: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2.5 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations Section */}
              <div className="rounded-xl border border-slate-800 bg-[#202428] p-5 space-y-3">
                <div className="flex items-center space-x-2 text-white pb-3 border-b border-slate-800">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-extrabold">Operator Safety Recommendations</h3>
                </div>
                <div className="space-y-2 pt-1 font-semibold text-xs">
                  {recommendationsList.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-350">
                      <span className="text-[#2A9D8F] font-bold">0{idx + 1}.</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions stack */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-lg transition-all active:scale-[0.99]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Another URL</span>
                </button>
                <button
                  onClick={() => setShowDetailedModal(true)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-lg transition-all active:scale-[0.99]"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Detailed Report</span>
                </button>
                <button
                  onClick={handleSaveReport}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-[#2A9D8F] hover:bg-[#238276] text-white font-bold text-xs rounded-lg transition-all active:scale-[0.99] shadow-lg shadow-[#2A9D8F]/10"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Report JSON</span>
                </button>
              </div>

            </div>

            {/* Right side circular threat score gauge */}
            <div className="rounded-xl border border-slate-800 bg-[#202428] p-6 flex flex-col items-center justify-between text-center min-h-[400px]">
              <div className="w-full text-left">
                <h3 className="text-sm font-extrabold text-white">Threat Score Audit</h3>
                <span className="text-[10px] text-slate-500 block mt-0.5">Calculated by active metrics rules</span>
              </div>

              {/* SVG circular score gauge */}
              <div className="relative w-44 h-44 flex items-center justify-center my-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    stroke="#171A1D"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    stroke={colors.stroke}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 76}
                    strokeDashoffset={2 * Math.PI * 76 * (1 - score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black ${colors.text}`}>{score}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Threat index</span>
                </div>
              </div>

              {/* Verdict summaries */}
              <div className="space-y-1.5 pb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Security Verdict</span>
                <span className={`text-lg font-black tracking-tight block ${colors.text}`}>{scanResult.security_verdict}</span>
                <span className="text-xs text-slate-400 font-semibold block">
                  Risk Level evaluated as <span className="font-bold text-white">{scanResult.risk_level}</span>
                </span>
              </div>
            </div>

          </div>
        )
      })()}

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#181B1F] border-l border-[#343A40] h-full flex flex-col p-6 text-left shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b border-[#343A40] pb-4 mb-4">
              <div className="flex items-center space-x-2 text-white">
                <History className="w-5 h-5 text-[#2A9D8F]" />
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
                  <RefreshCw className="w-6 h-6 text-[#2A9D8F] animate-spin" />
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
                  const res = item.result || {};
                  const riskColor = 
                    res.risk_level === 'Critical' ? 'text-red-500' : 
                    res.risk_level === 'High' ? 'text-orange-500' : 
                    res.risk_level === 'Medium' ? 'text-amber-500' : 
                    'text-emerald-500';
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setScanResult(res);
                        setScannedUrl(item.target);
                        setPageState('result');
                        setShowHistory(false);
                      }}
                      className="p-3.5 bg-[#202428] border border-[#343A40] hover:border-[#2A9D8F]/50 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
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
                        <span>Score: {res.threat_index ?? (res.risk_score ?? item.risk_score)}/100</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Report Modal */}
      {showDetailedModal && scanResult && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#181B1F] border border-[#343A40] rounded-xl flex flex-col max-h-[85vh] p-6 text-left shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#343A40] pb-4 mb-4">
              <div className="flex items-center space-x-2 text-white">
                <FileText className="w-5 h-5 text-[#2A9D8F]" />
                <h3 className="font-extrabold text-base">Detailed Inspection Report</h3>
              </div>
              <button 
                onClick={() => setShowDetailedModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 bg-[#202428] border border-[#343A40] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#111315] border border-[#343A40] p-4 rounded-lg font-mono text-xs text-emerald-400/90 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <pre>{JSON.stringify(scanResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
