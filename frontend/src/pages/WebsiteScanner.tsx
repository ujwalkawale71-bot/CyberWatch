import { useState } from 'react'
import { History, Layers, RefreshCw, AlertCircle } from 'lucide-react'
import ScanInputCard from '../components/website-scanner/ScanInputCard'
import WebsiteRiskGauge from '../components/website-scanner/WebsiteRiskGauge'
import SubScoreCards from '../components/website-scanner/SubScoreCards'
import WebsiteInfoCard from '../components/website-scanner/WebsiteInfoCard'
import AIAnalysisSummary from '../components/website-scanner/AIAnalysisSummary'
import RiskRadarChart from '../components/website-scanner/RiskRadarChart'
import ThreatIntelMatches from '../components/website-scanner/ThreatIntelMatches'
import DetectedTechnologies from '../components/website-scanner/DetectedTechnologies'
import ScreenshotCard from '../components/website-scanner/ScreenshotCard'
import SecurityHeaders from '../components/website-scanner/SecurityHeaders'
import AIRecommendation from '../components/website-scanner/AIRecommendation'
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

  const handleScan = async (url: string) => {
    if (!url.trim()) return
    setScannedUrl(url)
    setPageState('loading')
    setError(null)

    try {
      const result = await scansApi.scanWebsite(url)
      setScanResult(result)
      setPageState('result')
    } catch (err: any) {
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Website Scanner</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Scan websites for malware, suspicious content, and security vulnerabilities.
          </p>
        </div>

        {/* Top-Right Buttons */}
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
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-650 hover:from-blue-600 hover:to-purple-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Page Error Alert block */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scan Input Card (Always Visible) */}
      <ScanInputCard
        onScan={handleScan}
        onReset={handleReset}
        isLoading={pageState === 'loading'}
      />

      {/* Pages State Controller */}
      {pageState === 'empty' && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3.5 rounded-full bg-slate-900 text-slate-655 border border-slate-850">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-xs space-y-1">
            <h3 className="text-sm font-bold text-slate-350">No Scan Active</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter a website URL above and click Scan Website to see results.
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
              <h3 className="text-sm font-bold text-white">Scanning website...</h3>
              <p className="text-[11px] text-slate-500 font-mono font-medium truncate max-w-md">
                {scannedUrl}
              </p>
            </div>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-40 select-none pointer-events-none">
            <div className="h-60 bg-slate-900/40 rounded-xl animate-pulse border border-slate-850" />
            <div className="h-60 bg-slate-900/40 rounded-xl animate-pulse border border-slate-850" />
          </div>
        </div>
      )}

      {pageState === 'result' && scanResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Row 1: Overall Risk gauge + Sub-score cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WebsiteRiskGauge
              score={scanResult.overallScore}
              severity={scanResult.severity}
              confidence={scanResult.confidence}
              engine={scanResult.engine}
              warningMessage={scanResult.warningMessage}
            />
            <SubScoreCards items={scanResult.subScores} />
          </div>

          {/* Row 2: Website Information + AI Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WebsiteInfoCard info={scanResult.info} />
            <AIAnalysisSummary checks={scanResult.aiChecks} />
          </div>

          {/* Row 3: Risk Breakdown Radar + Threat Intel Matches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskRadarChart data={scanResult.radarData} />
            <ThreatIntelMatches matches={scanResult.intelMatches} />
          </div>

          {/* Row 4: Technologies + Screenshot + Headers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetectedTechnologies technologies={scanResult.technologies} />
            <ScreenshotCard />
            <SecurityHeaders headers={scanResult.securityHeaders} />
          </div>

          {/* Row 5: AI Recommendations Banner */}
          <AIRecommendation riskLevel={scanResult.severity} score={scanResult.overallScore} />
        </div>
      )}
    </div>
  )
}
