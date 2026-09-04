import { useState } from 'react'
import { History, Layers, RefreshCw, AlertCircle } from 'lucide-react'
import ScanInputCard from '../components/extension-scanner/ScanInputCard'
import ExtensionRiskGauge from '../components/extension-scanner/ExtensionRiskGauge'
import SubScoreCards from '../components/extension-scanner/SubScoreCards'
import ExtensionInfoCard from '../components/extension-scanner/ExtensionInfoCard'
import PermissionsAnalysis from '../components/extension-scanner/PermissionsAnalysis'
import AIAnalysisSummary from '../components/extension-scanner/AIAnalysisSummary'
import RiskRadarChart from '../components/extension-scanner/RiskRadarChart'
import AIRecommendation from '../components/extension-scanner/AIRecommendation'
import { scansApi } from '../api/scans'
import { useAuth } from '../hooks/useAuth'
import type { ExtensionScanResult } from '../types/extensionScanner'

type ScannerState = 'empty' | 'loading' | 'result' | 'error'

export default function ExtensionScanner() {
  const [pageState, setPageState] = useState<ScannerState>('empty')
  const [scannedVal, setScannedVal] = useState('')
  const [scanResult, setScanResult] = useState<ExtensionScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const { logout } = useAuth()

  const handleScan = async (value: string, method: 'id' | 'upload') => {
    setScannedVal(method === 'id' ? value : 'manifest.json')
    setPageState('loading')
    setErrorMsg(null)

    try {
      let payload: any = {}
      if (method === 'id') {
        payload = { extension_id: value }
      } else {
        // parse the JSON manifest content
        const manifest = JSON.parse(value)
        payload = {
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          manifest_version: manifest.manifest_version,
          permissions: manifest.permissions || [],
          host_permissions: manifest.host_permissions || []
        }
      }
      
      const result = await scansApi.scanExtension(payload)
      setScanResult(result)
      setPageState('result')
    } catch (err: any) {
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
            Analyze browser extensions for malicious permissions, suspicious code patterns, and privacy risks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <History className="w-3.5 h-3.5" />
            <span>Scan History</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Scan</span>
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
          <div className="p-3.5 rounded-full bg-slate-900 text-slate-650 border border-slate-850">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-xs space-y-1">
            <h3 className="text-sm font-bold text-slate-350">No Scan Active</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter an extension ID or upload a manifest to see results.
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
              <h3 className="text-sm font-bold text-white">Analyzing extension...</h3>
              <p className="text-[11px] text-slate-500 font-mono font-medium truncate max-w-md">
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
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Row 1: Overall Gauge + Sub score cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExtensionRiskGauge
              score={scanResult.overallScore}
              severity={scanResult.severity}
              confidence={scanResult.confidence}
              engine={scanResult.engine}
              warningMessage={scanResult.warningMessage}
            />
            <SubScoreCards items={scanResult.subScores} />
          </div>

          {/* Row 2: Extension Information + Permissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExtensionInfoCard info={scanResult.info} />
            <PermissionsAnalysis permissions={scanResult.permissions} />
          </div>

          {/* Row 3: AI Indicators Summary + Risk Radar Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIAnalysisSummary checks={scanResult.aiChecks} />
            <RiskRadarChart data={scanResult.radarData} />
          </div>

          {/* Row 4: AI Recommendations Full Width banner */}
          <AIRecommendation />
        </div>
      )}
    </div>
  )
}
