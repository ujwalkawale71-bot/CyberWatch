import { useState, useRef } from 'react'
import type { DragEvent } from 'react'
import {
  UploadCloud,
  FileText,
  Binary,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  History,
  ArrowRight,
  Info,
  Eye
} from 'lucide-react'
import { scansApi } from '../api/scans'
import { useAuth } from '../hooks/useAuth'
import type { FileScanResult } from '../types/fileScanner'
import FileReportView from '../components/file-scanner/FileReportView'

type ScannerState = 'empty' | 'loading' | 'result'

export default function FileScanner() {
  const { logout } = useAuth()
  const [pageState, setPageState] = useState<ScannerState>('empty')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scanResult, setScanResult] = useState<FileScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Loading steps animation
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const steps = [
    "Reading file bytes safely & computing hashes (SHA-256, SHA-1, MD5)",
    "Magic byte identification & file signature detection",
    "Shannon entropy analysis & packing inspection",
    "Static structure inspection (PE / Script / Document / Archive)",
    "Suspicious string & static pattern analysis",
    "Live threat intelligence lookup (MalwareBazaar / VirusTotal)",
    "Evidence-based risk calibration & report generation"
  ]

  // Modals & drawers
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const handleFileSelect = (file: File) => {
    setError(null)
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the maximum limit of 50 MB.')
      return
    }
    setSelectedFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleScan = async () => {
    if (!selectedFile) return
    setScanResult(null)
    setPageState('loading')
    setActiveStepIndex(0)
    setError(null)

    // Increment progress step indicators
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 6 ? prev + 1 : prev))
    }, 280)

    try {
      const result = await scansApi.scanFile(selectedFile)
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
        setError(err.message || 'File scan failed. Please verify that the backend server is reachable.')
      }
    }
  }

  const handleReset = () => {
    setPageState('empty')
    setSelectedFile(null)
    setScanResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
        const fileScans = (json.data || []).filter((s: any) => s.scan_type === 'File')
        setHistoryList(fileScans)
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleViewHistoricalReport = (item: any) => {
    if (item.result) {
      setScanResult(item.result)
      setPageState('result')
      setShowHistory(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} bytes`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Binary className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              File & Malware Scanner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Upload a file to analyze its security characteristics, suspicious indicators, file integrity, and available malware intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-center">
          <button
            onClick={handleOpenHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-teal-400" />
            <span>Scan History</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ERROR BANNER
          ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 flex items-start space-x-3 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold">Scan Error</div>
            <div>{error}</div>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE 1: EMPTY / FILE INPUT CARD
          ───────────────────────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Static File Analysis & Malware Intelligence
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Safe Static Inspection Only • Max 50 MB
              </span>
            </div>

            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0])
                }
              }}
              className="hidden"
            />

            {/* Drag and Drop Zone */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-teal-400 bg-teal-950/20'
                    : 'border-slate-700/80 hover:border-teal-500/50 bg-slate-950/40 hover:bg-slate-950/60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-200">
                    Drop your file here, or <span className="text-teal-400 underline">browse files</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Supports Executables, Documents, Scripts, Archives, Images & Binaries
                  </div>
                </div>

                <div className="pt-2">
                  <span className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg inline-flex items-center space-x-1.5">
                    <span>Choose File</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Selected File Card */
              <div className="p-4 rounded-xl border border-slate-700/90 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md font-mono">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center flex-shrink-0">
                  <button
                    onClick={handleRemoveFile}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-300 bg-slate-900 hover:bg-red-950/20 border border-slate-800 hover:border-red-500/30 rounded-lg transition-colors"
                  >
                    Remove File
                  </button>

                  <button
                    onClick={handleScan}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-all"
                  >
                    <span>Analyze File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Static Safety Notice */}
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Safety Guarantee: </span>
                Uploaded files are inspected in pure static memory mode. CyberWatch never executes binaries, scripts, or macros during inspection.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE 2: LOADING PROGRESS
          ───────────────────────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-base sm:lg font-bold text-white">
              Analyzing File Security
            </h2>
            <p className="text-xs text-teal-300 font-mono truncate max-w-md mx-auto">
              {selectedFile?.name}
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2 text-left max-w-lg mx-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {steps.map((step, idx) => {
              const isDone = activeStepIndex > idx
              const isCurrent = activeStepIndex === idx
              return (
                <div key={idx} className="flex items-center space-x-2.5 text-xs">
                  {isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                  )}
                  <span className={isCurrent ? 'text-teal-300 font-semibold' : isDone ? 'text-slate-300' : 'text-slate-400'}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE 3: SCAN RESULT
          ───────────────────────────────────────────────────────────── */}
      {pageState === 'result' && scanResult && (
        <FileReportView
          result={scanResult}
          onNewScan={handleReset}
          onReset={handleReset}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCAN HISTORY DRAWER
          ───────────────────────────────────────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col space-y-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  File Scan History
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-xs text-slate-400 py-8 text-center flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                <span>Loading past scans...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                No previous file scans recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {historyList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start font-mono">
                      <span className="font-semibold text-slate-200 truncate max-w-[180px]">{item.target}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH'
                          ? 'bg-red-500/20 text-red-300'
                          : item.risk_level === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-teal-500/20 text-teal-300'
                      }`}>
                        {item.risk_level} ({item.risk_score})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</span>
                      {item.result && (
                        <button
                          onClick={() => handleViewHistoricalReport(item)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
