import React, { useState } from 'react'
import jsPDF from 'jspdf'
import {
  Shield,
  Globe,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Activity,
  FileDown,
  Copy,
  Check,
  Info,
  Sparkles,
  FolderCode,
  AlertTriangle,
  HelpCircle,
  Binary,
  Code2
} from 'lucide-react'
import type { FileScanResult, ThreatIntelSourceRecord } from '../../types/fileScanner'

export interface FileReportViewProps {
  result: FileScanResult
  onNewScan?: () => void
  onReset?: () => void
}

export const FileReportView: React.FC<FileReportViewProps> = ({ result, onNewScan, onReset }) => {
  const [copiedHash, setCopiedHash] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [activeTechTab, setActiveTechTab] = useState<'identity' | 'hashes' | 'entropy' | 'pe' | 'pdf' | 'office' | 'archive' | 'script' | 'threat_intel' | 'scores' | 'json'>('identity')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleReset = onNewScan || onReset || (() => window.location.reload())

  const fileName = result.file_name || 'Unknown File'
  const fileType = result.file_type || 'Unknown Format'
  const mimeType = result.mime_type || 'application/octet-stream'
  const fileSize = result.file_size || 0
  const formattedSize = fileSize > 1024 * 1024
    ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
    : fileSize > 1024
    ? `${(fileSize / 1024).toFixed(1)} KB`
    : `${fileSize} bytes`

  const sha256 = result.sha256 || ''
  const scanId = result.scan_id || result.id || 'N/A'
  const scanDate = result.timestamp || result.scan_date || new Date().toISOString()

  const rawScore = result.risk_score
  const numericScore = typeof rawScore === 'number' && !isNaN(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : null

  // Determine Verdict and Colors
  let primaryVerdict = (result.security_verdict || result.overall_risk || 'LOW RISK').toUpperCase()
  let verdictColor: 'teal' | 'amber' | 'orange' | 'red' | 'slate' = 'teal'
  let verdictShortDesc = ''
  let verdictIcon = '🟢'

  const allFindings = result.findings || []
  const limitations = result.analysis_limitations || []
  const recommendations = result.recommendations || []
  const positiveSignals = result.positive_signals || []

  // Prioritize findings by severity and contribution
  const severityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, MODERATE: 2, LOW: 1, INFO: 0 }
  const sortedFindings = [...allFindings].sort((a, b) => {
    const sevA = severityOrder[(a.severity || 'LOW').toUpperCase()] ?? 1
    const sevB = severityOrder[(b.severity || 'LOW').toUpperCase()] ?? 1
    if (sevB !== sevA) return sevB - sevA
    return (b.score_contribution || b.score_impact || 0) - (a.score_contribution || a.score_impact || 0)
  })

  if (primaryVerdict.includes('CRITICAL') || (numericScore !== null && numericScore >= 90)) {
    verdictColor = 'red'
    verdictShortDesc = 'Verified malware intelligence or critical malicious indicators detected.'
    verdictIcon = '🔴'
  } else if (primaryVerdict.includes('HIGH') || (numericScore !== null && numericScore >= 50)) {
    verdictColor = 'orange'
    verdictShortDesc = 'Multiple suspicious characteristics were detected, but no verified malware intelligence is confirmed.'
    verdictIcon = '🟠'
  } else if (primaryVerdict.includes('MEDIUM') || (numericScore !== null && numericScore >= 20)) {
    verdictColor = 'amber'
    verdictShortDesc = 'Some suspicious indicators or format anomalies were identified and should be reviewed.'
    verdictIcon = '🟡'
  } else if (primaryVerdict.includes('LIMITED') || primaryVerdict.includes('FAILED') || numericScore === null) {
    verdictColor = 'slate'
    verdictShortDesc = 'The available evidence was limited because static analysis could not complete all modules.'
    verdictIcon = '⚪'
  } else {
    verdictColor = 'teal'
    verdictShortDesc = allFindings.length > 0
      ? 'No major malware indicators detected. Minor static observations were noted.'
      : 'No significant malicious indicators were detected during static analysis.'
    verdictIcon = '🟢'
  }

  // Score Explanation
  let scoreExplanation = ''
  if (numericScore === null) {
    scoreExplanation = 'The risk score is unavailable because analysis was limited.'
  } else if (allFindings.length === 0) {
    scoreExplanation = 'No suspicious evidence contributed to the risk score.'
  } else if (numericScore <= 19) {
    scoreExplanation = 'Minor static observations contributed to this score.'
  } else {
    scoreExplanation = 'Multiple suspicious indicators contributed to this score.'
  }

  // Coverage calculation
  const localCoverage = result.analysis_coverage?.local_analysis || {
    status: 'FULL',
    percent: 100,
    modules_completed: 7,
    total_modules: 7
  }
  const localPercent = typeof localCoverage.percent === 'number' ? Math.round(localCoverage.percent) : 100
  const localCoverageStatus = localPercent === 100 ? 'FULL' : 'PARTIAL'

  const threatIntel = result.threat_intelligence || {}
  const tiSources: ThreatIntelSourceRecord[] = result.threat_intelligence_sources || threatIntel.sources_queried || []
  const configuredSourcesCount = threatIntel.configured_sources_count ?? tiSources.filter(s => s.configured || s.request_executed).length
  const totalSourcesCount = threatIntel.total_sources ?? (tiSources.length || 2)
  const tiCoverageStatus = configuredSourcesCount === 0 ? 'NOT CONFIGURED' : configuredSourcesCount >= totalSourcesCount ? 'FULL' : 'PARTIAL'

  // Why This Result bullets (max 4-5 items)
  const whyThisResult: Array<{ text: string; isPositive: boolean }> = []
  sortedFindings.slice(0, 3).forEach(f => {
    whyThisResult.push({
      text: f.title || f.reason || 'Suspicious characteristic detected',
      isPositive: false
    })
  })
  if (whyThisResult.length < 4 && positiveSignals.length > 0) {
    positiveSignals.slice(0, 4 - whyThisResult.length).forEach(sig => {
      whyThisResult.push({ text: sig, isPositive: true })
    })
  }

  const handleCopyHash = () => {
    if (sha256) {
      navigator.clipboard.writeText(sha256)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
    const dateStr = new Date().toISOString().split('T')[0]
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `CyberWatch_File_Scan_${sanitizedName}_${dateStr}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const generatePDF = () => {
    setGeneratingPdf(true)
    try {
      const doc = new jsPDF()
      doc.setFont('helvetica', 'normal')

      // Header Banner
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(15)
      doc.setFont('helvetica', 'bold')
      doc.text('CYBERWATCH — FILE & MALWARE REPORT', 14, 18)

      doc.setTextColor(51, 65, 85)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toUTCString()}`, 14, 38)
      doc.text(`File Name: ${fileName}   |   Size: ${formattedSize}`, 14, 44)
      doc.text(`Type: ${fileType}   |   MIME: ${mimeType}`, 14, 50)
      doc.text(`SHA-256: ${sha256}`, 14, 56)

      doc.setDrawColor(203, 213, 225)
      doc.line(14, 60, 196, 60)

      // Primary Status Box
      doc.setFillColor(248, 250, 252)
      doc.rect(14, 64, 182, 32, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(14, 64, 182, 32, 'S')

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Overall Security Status: ${primaryVerdict}`, 20, 74)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Risk Score: ${numericScore !== null ? `${numericScore} / 100` : 'Unavailable'}`, 20, 82)
      doc.text(`Coverage: Local (${localPercent}%)   |   Threat Intel (${configuredSourcesCount}/${totalSourcesCount} sources active)`, 20, 90)

      // Findings
      let y = 106
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`SECURITY FINDINGS (${allFindings.length} Observation${allFindings.length === 1 ? '' : 's'})`, 14, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      if (allFindings.length === 0) {
        doc.text('No significant security concerns detected during static file analysis.', 14, y)
        y += 8
      } else {
        sortedFindings.forEach((f) => {
          if (y > 260) {
            doc.addPage()
            y = 20
          }
          doc.setFont('helvetica', 'bold')
          doc.text(`[${f.severity || 'LOW'}] ${f.title || 'Observation'} (+${f.score_contribution || f.score_impact || 0} pts)`, 14, y)
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.text(f.reason || f.evidence || '', 18, y, { maxWidth: 175 })
          y += 8
        })
      }

      // Recommendations
      y += 4
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('RECOMMENDATIONS', 14, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      recommendations.forEach((rec) => {
        doc.text(`- ${rec}`, 14, y, { maxWidth: 180 })
        y += 6
      })

      const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
      const dateStr = new Date().toISOString().split('T')[0]
      doc.save(`CyberWatch_File_Report_${sanitizedName}_${dateStr}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Summary Rows
  const isExecutable = result.technical_details?.identity?.is_executable ?? false
  const hasEmbedded = allFindings.some(f => 
    f.category?.includes('Document') || 
    f.category?.includes('Archive') || 
    f.category?.includes('Embedded') ||
    f.title?.toLowerCase().includes('macro') ||
    f.title?.toLowerCase().includes('launch') ||
    f.title?.toLowerCase().includes('javascript')
  )
  const hasScriptFindings = allFindings.some(f => 
    f.category?.includes('Script') || 
    f.title?.toLowerCase().includes('powershell') || 
    f.title?.toLowerCase().includes('encoded') ||
    f.title?.toLowerCase().includes('download')
  )

  const summaryRows = [
    {
      area: 'File Identity',
      status: allFindings.some(f => f.category === 'File Identity') ? '⚠ Suspicious' : '✓ Normal',
      isWarning: allFindings.some(f => f.category === 'File Identity'),
      explanation: allFindings.some(f => f.category === 'File Identity')
        ? 'Extension mismatch or disguised filename detected'
        : 'Filename extension matches detected binary magic signature'
    },
    {
      area: 'File Type',
      status: isExecutable ? '⚠ Executable' : '✓ Standard Format',
      isWarning: isExecutable,
      explanation: isExecutable
        ? `Binary executable structure identified (${fileType})`
        : `Static document or data format (${fileType})`
    },
    {
      area: 'Embedded Content',
      status: hasEmbedded ? '⚠ Active Streams / Macros' : '✓ Clean Embedded Structure',
      isWarning: hasEmbedded,
      explanation: hasEmbedded
        ? 'Active macros, embedded payload streams, or auto-launch triggers identified'
        : 'No suspicious embedded executables, macros, or launch actions detected'
    },
    {
      area: 'Script Analysis',
      status: hasScriptFindings ? '⚠ Suspicious Script Patterns' : '✓ Normal / Non-Script',
      isWarning: hasScriptFindings,
      explanation: hasScriptFindings
        ? 'Encoded commands, dynamic execution routines, or network download cradles identified'
        : 'No encoded commands, evasion patterns, or suspicious download scripts identified'
    },
    {
      area: 'Threat Intelligence',
      status: result.threat_intelligence?.verified_malware_detected
        ? '🔴 Malware Hit'
        : tiCoverageStatus === 'FULL'
        ? '● Full Coverage'
        : tiCoverageStatus === 'PARTIAL'
        ? '◐ Partial Coverage'
        : '○ Not Configured',
      isWarning: result.threat_intelligence?.verified_malware_detected,
      explanation: result.threat_intelligence?.verified_malware_detected
        ? 'Confirmed malicious hash match in threat intelligence database'
        : configuredSourcesCount > 0
        ? `${configuredSourcesCount} reputation source(s) queried without detection`
        : 'External malware database lookups require API configuration'
    }
  ]

  const totalTechItems =
    allFindings.length +
    (tiSources.length || 2) +
    limitations.length +
    Object.keys(result.technical_details?.hashes || {}).length

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200 print:space-y-3 print:text-black">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: REPORT HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-4 sm:p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                FILE SECURITY SCAN REPORT
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                <Binary className="w-2.5 h-2.5" />
                <span>{fileType}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">File:</span>
              <h1 className="text-lg sm:text-xl font-bold font-mono text-teal-300 tracking-tight truncate select-all">
                {fileName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-mono">
              <span>Size: {formattedSize}</span>
              <span>• MIME: {mimeType}</span>
              {scanDate && (
                <span>• {new Date(scanDate).toLocaleString()}</span>
              )}
              {scanId && (
                <span>• ID: #{scanId}</span>
              )}
            </div>

            {/* SHA-256 Hash Row */}
            {sha256 && (
              <div className="flex items-center space-x-1.5 pt-0.5 text-[11px] font-mono text-slate-400">
                <span className="text-slate-400">SHA-256:</span>
                <span className="text-slate-300 truncate max-w-[240px] sm:max-w-md select-all" title={sha256}>
                  {sha256}
                </span>
                <button
                  onClick={handleCopyHash}
                  title="Copy SHA-256 Hash"
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 self-start md:self-center flex-shrink-0 pt-1 md:pt-0">
            <button
              onClick={handlePrint}
              title="Print Audit Report"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadJson}
              title="Download Scan JSON"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={generatePDF}
              disabled={generatingPdf}
              title="Save as PDF"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-400" />
              <span>{generatingPdf ? 'Saving...' : 'Save PDF'}</span>
            </button>

            <button
              onClick={handleReset}
              title="New Scan"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 & 3: OVERALL SECURITY STATUS & SINGLE RISK SCORE
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-xl border p-4 sm:p-5 shadow-sm backdrop-blur-sm transition-colors ${
          verdictColor === 'teal'
            ? 'border-teal-500/30 bg-teal-950/15'
            : verdictColor === 'amber'
            ? 'border-amber-500/30 bg-amber-950/15'
            : verdictColor === 'orange'
            ? 'border-orange-500/30 bg-orange-950/15'
            : verdictColor === 'red'
            ? 'border-red-500/30 bg-red-950/20'
            : 'border-slate-800 bg-slate-900/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <span className="text-base">{verdictIcon}</span>
              <span
                className={`px-2.5 py-0.5 rounded text-sm sm:text-base font-black tracking-wide border ${
                  verdictColor === 'teal'
                    ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
                    : verdictColor === 'amber'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : verdictColor === 'orange'
                    ? 'bg-orange-500/15 text-orange-300 border-orange-500/40'
                    : verdictColor === 'red'
                    ? 'bg-red-500/15 text-red-300 border-red-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {primaryVerdict}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed max-w-xl">
              {verdictShortDesc}
            </p>

            <p className="text-[11px] text-slate-400">
              {scoreExplanation}
            </p>
          </div>

          {/* Single Calm Score Pill */}
          <div className="flex items-center sm:self-center bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl flex-shrink-0 space-x-3">
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Risk Score
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {numericScore !== null ? `${numericScore} / 100` : 'Unavailable'}
              </div>
            </div>

            <div
              className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                verdictColor === 'teal'
                  ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                  : verdictColor === 'amber'
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : verdictColor === 'orange'
                  ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]'
                  : verdictColor === 'red'
                  ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                  : 'bg-slate-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: WHY THIS RESULT?
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Why This Result?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {whyThisResult.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 p-2.5 rounded-lg border ${
                item.isPositive
                  ? 'bg-slate-950/40 border-slate-850 text-slate-300'
                  : 'bg-amber-950/15 border-amber-500/25 text-amber-300'
              }`}
            >
              {item.isPositive ? (
                <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: SECURITY SUMMARY
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Security Summary
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Core Surface Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-2.5">Security Area</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40 text-xs">
              {summaryRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 font-semibold text-slate-200">{row.area}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.isWarning
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-300">{row.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: SECURITY FINDINGS
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Security Findings
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {allFindings.length} Observation{allFindings.length === 1 ? '' : 's'}
          </span>
        </div>

        {allFindings.length === 0 ? (
          <div className="p-3.5 rounded-lg border border-teal-500/20 bg-teal-950/10 text-xs text-teal-300 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">No Significant Security Concerns Detected</div>
              <div className="text-[11px] text-teal-400/80">Static analysis found no active malicious signatures or suspicious indicators.</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sortedFindings.map((finding, idx) => {
              const severity = (finding.severity || 'LOW').toUpperCase()
              const isCrit = severity === 'CRITICAL'
              const isHigh = severity === 'HIGH'
              const isMed = severity === 'MEDIUM' || severity === 'MODERATE'
              const impact = finding.score_contribution || finding.score_impact || 0

              return (
                <div
                  key={finding.id || idx}
                  className={`p-3 rounded-lg border transition-colors space-y-1.5 text-left ${
                    isCrit
                      ? 'border-red-500/30 bg-red-950/15'
                      : isHigh
                      ? 'border-orange-500/30 bg-orange-950/15'
                      : isMed
                      ? 'border-amber-500/25 bg-amber-950/10'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white leading-tight">
                      {finding.title}
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide flex-shrink-0 border ${
                        isCrit
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : isHigh
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : isMed
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-teal-500/10 text-teal-300 border-teal-500/25'
                      }`}
                    >
                      {severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {finding.reason || finding.evidence}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-850">
                    <span className="truncate max-w-[180px]">{finding.category || 'File Security'}</span>
                    {impact > 0 && (
                      <span className="text-amber-400 font-semibold">Risk Impact: +{impact} pts</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: POSITIVE SECURITY SIGNALS
          ───────────────────────────────────────────────────────────── */}
      {positiveSignals.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Positive Security Signals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {positiveSignals.map((sig, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/40 border border-slate-850"
              >
                <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span className="truncate">{sig}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: ANALYSIS COVERAGE
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Analysis Coverage
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">Local Static Analysis</span>
              <span className="font-mono text-teal-400 font-bold">{localCoverageStatus} — {localPercent}%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {localPercent === 100
                ? 'All planned static inspection modules completed successfully without execution.'
                : 'Local static inspection partially completed.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">Threat Intelligence</span>
              <span className="font-mono text-slate-300 font-bold">{tiCoverageStatus} — {configuredSourcesCount} of {totalSourcesCount} sources active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {configuredSourcesCount > 0
                ? `${configuredSourcesCount} external malware reputation database(s) active.`
                : 'External threat feeds require API configuration.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: ANALYSIS LIMITATIONS (Only if applicable)
          ───────────────────────────────────────────────────────────── */}
      {limitations.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Analysis Limitations
            </h2>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            {limitations.map((lim, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{lim}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: THREAT INTELLIGENCE
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Threat Intelligence
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {configuredSourcesCount} of {totalSourcesCount} active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(tiSources.length > 0 ? tiSources : [
            { source: 'MalwareBazaar', status: 'NOT_DETECTED' },
            { source: 'VirusTotal', status: 'NOT_CONFIGURED' }
          ]).map((src: any, idx) => {
            const isDetected = src.detected || src.status === 'DETECTED'
            const isConfigured = src.configured || src.request_executed || src.status === 'NOT_DETECTED'
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-850 space-y-1">
                <div className="font-semibold text-slate-200 truncate">{src.source || src.name}</div>
                <div>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isDetected
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : isConfigured
                      ? 'bg-teal-500/15 text-teal-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDetected ? 'Detected' : isConfigured ? 'Not Detected' : 'Not Configured'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 11: RECOMMENDATION
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Recommendation
          </h2>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-white leading-relaxed">
            {recommendations[0] || 'Continue following standard file safety practices.'}
          </div>

          {recommendations.length > 1 && (
            <div className="space-y-1 text-[11px] text-slate-300">
              {recommendations.slice(1).map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 12: ADVANCED TECHNICAL DETAILS (Collapsed by default)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm overflow-hidden transition-all">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-2.5">
            <FolderCode className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Advanced Technical Details
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {totalTechItems} Items
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>{showTechnicalDetails ? 'Hide' : 'Show'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="border-t border-slate-800/80 p-4 sm:p-5 bg-slate-950/40 space-y-4">
            {/* Tech Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
              {[
                { id: 'identity', label: 'Identity' },
                { id: 'hashes', label: 'Hashes' },
                { id: 'entropy', label: 'Entropy' },
                { id: 'pe', label: 'PE Executable' },
                { id: 'pdf', label: 'PDF' },
                { id: 'office', label: 'Office' },
                { id: 'archive', label: 'Archive' },
                { id: 'script', label: 'Script' },
                { id: 'threat_intel', label: 'Threat Intel' },
                { id: 'scores', label: 'Scores' },
                { id: 'json', label: 'Raw JSON' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTechTab(tab.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors ${
                    activeTechTab === tab.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: IDENTITY */}
            {activeTechTab === 'identity' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">File Identity Metadata</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">File Name: </span>
                    <span className="text-teal-300 font-bold">{fileName}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">File Size: </span>
                    <span className="text-slate-200">{formattedSize}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Detected Format: </span>
                    <span className="text-slate-200">{fileType}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">MIME Type: </span>
                    <span className="text-slate-200">{mimeType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HASHES */}
            {activeTechTab === 'hashes' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cryptographic Hashes</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <div className="text-slate-400 mb-1">SHA-256:</div>
                    <div className="text-teal-300 select-all break-all">{result.technical_details?.hashes?.sha256 || sha256}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <div className="text-slate-400 mb-1">SHA-1:</div>
                    <div className="text-slate-300 select-all break-all">{result.technical_details?.hashes?.sha1 || result.sha1}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <div className="text-slate-400 mb-1">MD5:</div>
                    <div className="text-slate-300 select-all break-all">{result.technical_details?.hashes?.md5 || result.md5}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ENTROPY */}
            {activeTechTab === 'entropy' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Entropy & Randomness Analysis</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Shannon Entropy: </span>
                    <span className="text-white font-bold">{result.technical_details?.entropy?.value ?? 'N/A'} / 8.00</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Classification: </span>
                    <span className="text-teal-300 font-bold">{result.technical_details?.entropy?.classification || 'Normal'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PE EXECUTABLE */}
            {activeTechTab === 'pe' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Windows PE Binary Header</div>
                {result.technical_details?.pe ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                        <span className="text-slate-400">Target Architecture: </span>
                        <span className="text-slate-200">{result.technical_details.pe.machine}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                        <span className="text-slate-400">Compiled Time: </span>
                        <span className="text-slate-200">{result.technical_details.pe.compile_timestamp || 'N/A'}</span>
                      </div>
                    </div>
                    {result.technical_details.pe.sections && (
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
                        <div className="text-slate-400 font-bold">Sections ({result.technical_details.pe.sections.length}):</div>
                        {result.technical_details.pe.sections.map((s, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                            <span>{s.name}</span>
                            <span>Entropy: {s.entropy}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400">
                    Target file is not a Windows PE executable.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PDF */}
            {activeTechTab === 'pdf' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">PDF Structure Inspection</div>
                {result.technical_details?.pdf ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">Embedded JS (/JavaScript): </span>
                      <span className={result.technical_details.pdf.has_javascript ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {result.technical_details.pdf.has_javascript ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">Launch Actions (/Launch): </span>
                      <span className={result.technical_details.pdf.has_launch_action ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {result.technical_details.pdf.has_launch_action ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">Embedded Files: </span>
                      <span className="text-slate-200">{result.technical_details.pdf.has_embedded_files ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">URI Links Count: </span>
                      <span className="text-slate-200">{result.technical_details.pdf.uri_links_count ?? 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400">
                    Target file is not a PDF document.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: OFFICE */}
            {activeTechTab === 'office' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Office Document Inspection</div>
                {result.technical_details?.office ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">VBA Macros: </span>
                      <span className={result.technical_details.office.has_vba_macros ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {result.technical_details.office.has_vba_macros ? 'Detected' : 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">Embedded Executables: </span>
                      <span className="text-slate-200">
                        {result.technical_details.office.embedded_executables?.length ? result.technical_details.office.embedded_executables.join(', ') : 'None'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400">
                    Target file is not a Microsoft Office document.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ARCHIVE */}
            {activeTechTab === 'archive' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Archive Members Inspection</div>
                {result.technical_details?.archive ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                        <span className="text-slate-400">Files Count: </span>
                        <span className="text-slate-200">{result.technical_details.archive.file_count}</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                        <span className="text-slate-400">Contains Executable: </span>
                        <span className={result.technical_details.archive.contains_executable ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                          {result.technical_details.archive.contains_executable ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400">
                    Target file is not a ZIP/compressed archive.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SCRIPT */}
            {activeTechTab === 'script' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Script Pattern Matching</div>
                {result.technical_details?.script ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">Encoded Payload: </span>
                      <span className={result.technical_details.script.has_encoded_payload ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {result.technical_details.script.has_encoded_payload ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                      <span className="text-slate-400">Network Download Cradle: </span>
                      <span className={result.technical_details.script.has_network_download ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {result.technical_details.script.has_network_download ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-400">
                    Target file is not a script.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: THREAT INTEL */}
            {activeTechTab === 'threat_intel' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Threat Intelligence Feeds</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {(tiSources.length > 0 ? tiSources : [
                    { source: 'MalwareBazaar', status: 'NOT_DETECTED' },
                    { source: 'VirusTotal', status: 'NOT_CONFIGURED' }
                  ]).map((src: any, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
                      <div className="font-semibold text-slate-200">{src.source || src.name}</div>
                      <div className="text-slate-400">Status: <span className="text-teal-300">{src.status}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SCORES */}
            {activeTechTab === 'scores' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Score Breakdown Details</div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final Risk Score:</span>
                    <span className="text-white font-bold">{numericScore !== null ? `${numericScore} / 100` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Heuristic Score Contribution:</span>
                    <span className="text-amber-300 font-bold">{result.heuristic_score ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified Threat Score Contribution:</span>
                    <span className="text-red-400 font-bold">{result.verified_threat_score ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RAW JSON */}
            {activeTechTab === 'json' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Complete Scan JSON</div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto select-all">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FileReportView
