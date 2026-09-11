import React, { useState } from 'react'
import jsPDF from 'jspdf'
import {
  ShieldAlert,
  Lock,
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
  Shield,
  FolderCode,
  AlertTriangle,
  HelpCircle
} from 'lucide-react'
import type { WebsiteScanResult, ThreatIntelSourceRecord } from '../../types/websiteScanner'

export interface WebsiteReportViewProps {
  result: WebsiteScanResult
  onNewScan?: () => void
  onReset?: () => void
}

export const WebsiteReportView: React.FC<WebsiteReportViewProps> = ({ result, onNewScan, onReset }) => {
  const [copied, setCopied] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [activeTechTab, setActiveTechTab] = useState<'dns' | 'tls' | 'server' | 'headers' | 'redirects' | 'content' | 'resources' | 'scores' | 'threat_intel' | 'json'>('dns')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleReset = onNewScan || onReset || (() => window.location.reload())

  const targetUrl = result.url || 'Unknown Website'
  const domain = result.domain || 'domain'
  const scheme = (targetUrl.toLowerCase().startsWith('https') ? 'HTTPS' : 'HTTP').toUpperCase()

  const rawScore = result.risk_score
  const numericScore = typeof rawScore === 'number' && !isNaN(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : null

  // Security Verdict and Color
  let primaryVerdict = (result.security_verdict || result.risk_level || 'LOW RISK').toUpperCase()
  let verdictColor: 'teal' | 'amber' | 'orange' | 'red' | 'slate' = 'teal'
  let verdictShortDesc = ''
  let verdictIcon = '🟢'

  const allFindings = result.findings || []
  const limitations = result.analysis_limitations || []
  const recommendations = result.recommendations || []
  const headers = result.security_headers || {}

  // Filter missing headers
  const missingHeadersList: string[] = []
  Object.keys(headers).forEach(k => {
    if (headers[k]?.status === 'Missing') {
      missingHeadersList.push(k)
    }
  })

  // Findings prioritization
  const severityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, MODERATE: 2, LOW: 1, INFO: 0 }
  const sortedFindings = [...allFindings].sort((a, b) => {
    const sevA = severityOrder[(a.severity || 'LOW').toUpperCase()] ?? 1
    const sevB = severityOrder[(b.severity || 'LOW').toUpperCase()] ?? 1
    if (sevB !== sevA) return sevB - sevA
    return (b.score_impact || 0) - (a.score_impact || 0)
  })

  // Determine Verdict Description
  if (primaryVerdict.includes('CRITICAL') || (numericScore !== null && numericScore >= 90)) {
    verdictColor = 'red'
    verdictShortDesc = 'Strong evidence of a significant security threat was detected.'
    verdictIcon = '🔴'
  } else if (primaryVerdict.includes('HIGH') || (numericScore !== null && numericScore >= 50)) {
    verdictColor = 'orange'
    verdictShortDesc = 'Multiple suspicious security indicators were detected.'
    verdictIcon = '🟠'
  } else if (primaryVerdict.includes('MEDIUM') || primaryVerdict.includes('MODERATE') || (numericScore !== null && numericScore >= 20)) {
    verdictColor = 'amber'
    verdictShortDesc = 'Some security concerns were identified and should be reviewed.'
    verdictIcon = '🟡'
  } else if (primaryVerdict.includes('LIMITED') || primaryVerdict.includes('FAILED') || primaryVerdict.includes('UNKNOWN') || numericScore === null) {
    verdictColor = 'slate'
    verdictShortDesc = 'The available evidence was limited because some security checks could not be completed.'
    verdictIcon = '⚪'
  } else {
    verdictColor = 'teal'
    if (allFindings.length > 0) {
      verdictShortDesc = 'No major threats detected. Minor security improvements are recommended.'
    } else {
      verdictShortDesc = 'No significant security concerns were detected during the completed analysis.'
    }
    verdictIcon = '🟢'
  }

  // Score Explanation Text
  let scoreExplanation = ''
  if (numericScore === null) {
    scoreExplanation = 'The risk score is unavailable because analysis was limited.'
  } else if (allFindings.length === 0) {
    scoreExplanation = 'No suspicious evidence contributed to the risk score.'
  } else if (numericScore <= 19) {
    scoreExplanation = 'Minor security configuration issues contributed to this score.'
  } else {
    scoreExplanation = 'Multiple suspicious indicators contributed to this score.'
  }

  // Local coverage & status fix: FULL ONLY if percent === 100
  const localCoverage = result.local_analysis_coverage || {
    status: 'FULL',
    percent: 100,
    modules_completed: 8,
    total_modules: 9
  }
  const localPercent = typeof localCoverage.percent === 'number' ? Math.round(localCoverage.percent) : 100
  const localCoverageStatus = localPercent === 100 ? 'FULL' : 'PARTIAL'

  // Threat Intel coverage
  const threatIntel = result.threat_intelligence || {}
  const tiSources: ThreatIntelSourceRecord[] = result.threat_intelligence_sources || threatIntel.sources_queried || []
  const configuredSourcesCount = threatIntel.configured_sources_count ?? tiSources.filter(s => s.configured || s.request_executed).length
  const totalSourcesCount = threatIntel.total_sources ?? (tiSources.length || 4)
  const tiCoverageStatus = configuredSourcesCount === 0 ? 'NOT CONFIGURED' : configuredSourcesCount >= totalSourcesCount ? 'FULL' : 'PARTIAL'
  const tiDetectionsCount = tiSources.filter(s => s.detected || s.status === 'DETECTED').length

  // Build clean Positive Security Signals (Strictly excluding Threat Intel / API status)
  const rawSignals = result.positive_signals || []
  const sanitizedPositiveSignals: string[] = []
  rawSignals.forEach(sig => {
    const lower = sig.toLowerCase()
    if (!lower.includes('threat intelligence') && !lower.includes('feed') && !lower.includes('api key') && !lower.includes('database queried')) {
      sanitizedPositiveSignals.push(sig)
    }
  })

  // Ensure default core positive signals if verified by technical details
  if (sanitizedPositiveSignals.length === 0) {
    if (scheme === 'HTTPS' && result.technical_details?.tls?.valid !== false) {
      sanitizedPositiveSignals.push('Valid HTTPS and TLS certificate detected')
    }
    if (result.technical_details?.dns?.resolved || result.technical_details?.dns?.resolved_ips?.length) {
      sanitizedPositiveSignals.push('DNS resolution completed successfully')
    }
    if (result.technical_details?.http?.reachable) {
      sanitizedPositiveSignals.push('Website responded successfully')
    }
    if (!result.technical_details?.redirects?.count || result.technical_details.redirects.count <= 1) {
      sanitizedPositiveSignals.push('No unexpected redirect chain detected')
    }
    if (!allFindings.some(f => f.category?.includes('Phishing') || f.category?.includes('Brand'))) {
      sanitizedPositiveSignals.push('No phishing indicators were detected')
    }
  }
  const displayPositiveSignals = sanitizedPositiveSignals.slice(0, 5)

  // ─────────────────────────────────────────────────────────────
  // "WHY THIS RESULT?" DYNAMIC GENERATION (A, B, C, D)
  // ─────────────────────────────────────────────────────────────

  // A. Summary Explanation (1-2 sentences)
  let whySummarySentence1 = ''
  let whySummarySentence2 = ''

  if (numericScore === null || primaryVerdict.includes('LIMITED')) {
    whySummarySentence1 = `This website received an Analysis Limited status because some security checks could not be completed.`
    whySummarySentence2 = limitations.length > 0 ? limitations[0] : 'The server was unreachable or DNS resolution failed.'
  } else if (numericScore >= 50 || primaryVerdict.includes('HIGH') || primaryVerdict.includes('CRITICAL')) {
    whySummarySentence1 = `This website received an elevated Risk Score of ${numericScore}/100 due to multiple high-risk security indicators detected during analysis.`
    const topFinding = sortedFindings[0]
    whySummarySentence2 = topFinding ? `Significant concern: ${topFinding.title} (${topFinding.reason || topFinding.evidence || 'Identified during inspection'}).` : 'Immediate review is strongly recommended.'
  } else if (numericScore >= 20 || primaryVerdict.includes('MEDIUM') || primaryVerdict.includes('MODERATE')) {
    whySummarySentence1 = `This website received a Moderate Risk score of ${numericScore}/100 due to observed configuration issues and security anomalies.`
    const topFinding = sortedFindings[0]
    whySummarySentence2 = topFinding ? `Primary factor: ${topFinding.title}.` : 'Reviewing these findings will help safeguard site visitors.'
  } else {
    // Low risk (< 20)
    whySummarySentence1 = `This website received a Low Risk score of ${numericScore}/100 because no major malicious, phishing, or connection security threats were detected during the completed analysis.`
    if (allFindings.length > 0) {
      const headerFindings = allFindings.filter(f => f.category?.toLowerCase().includes('header') || f.title?.toLowerCase().includes('header') || f.title?.toLowerCase().includes('policy'))
      if (headerFindings.length > 0) {
        whySummarySentence2 = `However, ${headerFindings.length} recommended security header${headerFindings.length > 1 ? 's were' : ' was'} not detected, which may reduce certain browser-level security protections.`
      } else {
        whySummarySentence2 = `However, ${allFindings.length} minor configuration issue${allFindings.length > 1 ? 's were' : ' was'} noted for recommended improvement.`
      }
    } else {
      whySummarySentence2 = 'All core security indicators, certificate validations, and connection tests completed with positive signals.'
    }
  }

  // B. Key Security Concerns (Top 3-5 findings prioritized)
  const keyConcerns = sortedFindings.slice(0, 5)

  // D. What This Means (Dynamic user guidance)
  let whatThisMeansText = ''
  if (primaryVerdict.includes('CRITICAL')) {
    whatThisMeansText = 'Strong threat evidence was detected. Avoid interacting with the website and do not enter personal or financial information.'
  } else if (primaryVerdict.includes('HIGH')) {
    whatThisMeansText = 'Multiple suspicious indicators were identified. Avoid entering passwords or sensitive information until the website is independently verified.'
  } else if (primaryVerdict.includes('MEDIUM') || primaryVerdict.includes('MODERATE')) {
    whatThisMeansText = 'Some suspicious signals were detected. Verify the website before entering sensitive information.'
  } else if (primaryVerdict.includes('LIMITED') || numericScore === null) {
    whatThisMeansText = 'The analysis could not fully assess the website due to technical limitations. Exercise caution when visiting.'
  } else {
    if (allFindings.length > 0) {
      whatThisMeansText = 'The website does not currently show strong evidence of being malicious. The detected issues are primarily security configuration improvements rather than direct evidence of a threat to visitors.'
    } else {
      whatThisMeansText = 'No major threat indicators were detected during this analysis. Continue following normal browsing precautions.'
    }
  }

  // Summary Rows for Section 6 (Security Summary Table)
  const missingHeadersCount = missingHeadersList.length
  const summaryRows = [
    {
      area: 'Connection Security',
      status: scheme === 'HTTPS' && result.technical_details?.tls?.valid !== false ? '✓ Secure' : '⚠ Warning',
      isWarning: scheme !== 'HTTPS' || result.technical_details?.tls?.valid === false,
      explanation: scheme === 'HTTPS' ? 'Encrypted HTTPS with a valid certificate' : 'Unencrypted HTTP protocol without encryption'
    },
    {
      area: 'Security Headers',
      status: missingHeadersCount > 0 ? '⚠ Improvements Needed' : '✓ Configured',
      isWarning: missingHeadersCount > 0,
      explanation: missingHeadersCount > 0 ? `${missingHeadersCount} recommended security header${missingHeadersCount > 1 ? 's are' : ' is'} missing` : 'Recommended security headers present'
    },
    {
      area: 'Phishing Detection',
      status: allFindings.some(f => f.category?.includes('Phishing') || f.category?.includes('Brand')) ? '⚠ Detected' : '✓ Not Detected',
      isWarning: allFindings.some(f => f.category?.includes('Phishing') || f.category?.includes('Brand')),
      explanation: allFindings.some(f => f.category?.includes('Phishing') || f.category?.includes('Brand')) ? 'Brand spoofing or credential pattern observed' : 'No phishing indicators found'
    },
    {
      area: 'Website Availability',
      status: result.technical_details?.http?.reachable ? '✓ Online' : '⚠ Limited',
      isWarning: !result.technical_details?.http?.reachable,
      explanation: result.technical_details?.http?.reachable ? 'Website responded successfully' : 'Destination unreachable or DNS failed'
    },
    {
      area: 'Threat Intelligence',
      status: tiCoverageStatus === 'FULL' ? '● Full Coverage' : tiCoverageStatus === 'PARTIAL' ? '◐ Partial Coverage' : '○ Not Configured',
      isWarning: tiDetectionsCount > 0,
      explanation: tiDetectionsCount > 0 ? 'Threat detected in external databases' : configuredSourcesCount > 0 ? 'Available sources completed without a detection' : 'External threat feed databases not configured'
    }
  ]

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
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
      doc.text('CYBERWATCH — WEBSITE SECURITY REPORT', 14, 18)

      doc.setTextColor(51, 65, 85)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toUTCString()}`, 14, 38)
      doc.text(`Website: ${targetUrl}`, 14, 44)
      doc.text(`Domain: ${domain}   |   Scan ID: ${result.scan_id || result.id || 'N/A'}`, 14, 50)

      doc.setDrawColor(203, 213, 225)
      doc.line(14, 54, 196, 54)

      // Primary Status Box
      doc.setFillColor(248, 250, 252)
      doc.rect(14, 58, 182, 32, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(14, 58, 182, 32, 'S')

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Overall Security Status: ${primaryVerdict}`, 20, 68)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Risk Score: ${numericScore !== null ? `${numericScore} / 100` : 'Unavailable'}`, 20, 76)
      doc.text(`Coverage: Local (${localPercent}%)   |   Threat Intel (${configuredSourcesCount}/${totalSourcesCount} feeds)`, 20, 84)

      // Security Findings
      let y = 100
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`SECURITY FINDINGS (${allFindings.length} Observation${allFindings.length === 1 ? '' : 's'})`, 14, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      if (allFindings.length === 0) {
        doc.text('No significant security concerns detected during completed analysis.', 14, y)
        y += 8
      } else {
        sortedFindings.forEach((f) => {
          if (y > 260) {
            doc.addPage()
            y = 20
          }
          doc.setFont('helvetica', 'bold')
          doc.text(`[${f.severity || 'LOW'}] ${f.title || 'Observation'} (+${f.score_impact || 0} pts)`, 14, y)
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

      const dateStr = new Date().toISOString().split('T')[0]
      doc.save(`CyberWatch_Website_Report_${domain}_${dateStr}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const totalTechItems =
    allFindings.length +
    Object.keys(headers).length +
    (tiSources.length || 4) +
    limitations.length +
    (result.technical_details?.redirects?.count || 0)

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200 print:space-y-3 print:text-black">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 & 2: REPORT HEADER & SCAN METADATA
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-4 sm:p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                WEBSITE SECURITY SCAN REPORT
              </span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                scheme === 'HTTPS'
                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {scheme === 'HTTPS' ? <Lock className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                <span>{scheme}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Website:</span>
              <h1 className="text-lg sm:text-xl font-bold font-mono text-teal-300 tracking-tight truncate select-all">
                {domain}
              </h1>
              <button
                onClick={handleCopyUrl}
                title="Copy Full Website Address"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[280px] sm:max-w-md text-slate-400" title={targetUrl}>
                {targetUrl}
              </span>
              {result.timestamp && (
                <span>• {new Date(result.timestamp).toLocaleString()}</span>
              )}
              {(result.scan_id || result.id) && (
                <span>• ID: #{result.scan_id || result.id}</span>
              )}
            </div>
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
          SECTION 3 & 4: OVERALL SECURITY STATUS & SINGLE RISK SCORE
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

          {/* Single Calm Score Pill — The only place Risk Score appears */}
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
          SECTION 5: WHY THIS RESULT? (4-Part Evidence-Based Breakdown)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Why This Result?
          </h2>
        </div>

        {/* A. Summary Explanation */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-1.5 text-xs text-slate-200 leading-relaxed">
          <p>
            {whySummarySentence1}
          </p>
          <p className="text-slate-300">
            {whySummarySentence2}
          </p>
        </div>

        {/* Two-Column Breakdown for Key Concerns & Positive Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* B. Key Security Concerns */}
          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Security Concerns</span>
            </div>

            {keyConcerns.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic py-1">
                No major security concerns detected on this website.
              </div>
            ) : (
              <ul className="space-y-1.5 text-xs text-slate-300">
                {keyConcerns.map((concern, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="leading-snug">
                      <span className="font-semibold text-slate-200">{concern.title}</span>
                      {concern.score_impact ? (
                        <span className="text-[10px] text-amber-400/90 ml-1 font-mono">(+{concern.score_impact} pts)</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* C. Positive Security Signals */}
          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Positive Security Signals</span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300">
              {displayPositiveSignals.map((signal, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* D. What This Means */}
        <div className="p-3 rounded-lg bg-teal-950/10 border border-teal-500/20 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            What This Means
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {whatThisMeansText}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: SECURITY SUMMARY
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
          SECTION 7: SECURITY FINDINGS (Detailed Evidence)
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
              <div className="text-[11px] text-teal-400/80">No suspicious security indicators were identified during the completed analysis.</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sortedFindings.map((finding, idx) => {
              const severity = (finding.severity || 'LOW').toUpperCase()
              const isCrit = severity === 'CRITICAL'
              const isHigh = severity === 'HIGH'
              const isMed = severity === 'MEDIUM' || severity === 'MODERATE'

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
                    <span className="truncate max-w-[180px]">{finding.category || 'Security Observation'}</span>
                    {typeof finding.score_impact === 'number' && finding.score_impact > 0 && (
                      <span className="text-amber-400 font-semibold">Risk Impact: +{finding.score_impact} pts</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: POSITIVE SECURITY SIGNALS
          ───────────────────────────────────────────────────────────── */}
      {displayPositiveSignals.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Positive Security Signals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {displayPositiveSignals.map((sig, idx) => (
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
          SECTION 9: ANALYSIS COVERAGE (FULL strictly if 100%)
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
              <span className="font-semibold text-slate-300">Local Analysis</span>
              <span className="font-mono text-teal-400 font-bold">{localCoverageStatus} — {localPercent}%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {localPercent === 100
                ? 'All planned local analysis modules completed successfully.'
                : 'Some local analysis checks could not be completed.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300">Threat Intelligence</span>
              <span className="font-mono text-slate-300 font-bold">{tiCoverageStatus} — {configuredSourcesCount} of {totalSourcesCount} sources active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {configuredSourcesCount > 0
                ? `${configuredSourcesCount} external reputation database(s) active.`
                : 'External threat feeds require API configuration.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: ANALYSIS LIMITATIONS (Only if applicable)
          ───────────────────────────────────────────────────────────── */}
      {limitations.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Analysis Limitations
            </h2>
          </div>
          <p className="text-[11px] text-slate-400">Some checks could not be completed during this scan:</p>
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
          SECTION 11: THREAT INTELLIGENCE
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {(tiSources.length > 0 ? tiSources : [
            { source: 'Google Safe Browsing', status: 'NOT_CONFIGURED' },
            { source: 'VirusTotal', status: 'NOT_CONFIGURED' },
            { source: 'URLhaus', status: 'NOT_CONFIGURED' },
            { source: 'PhishTank', status: 'NOT_DETECTED' }
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
          SECTION 12: RECOMMENDATION
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
            {recommendations[0] || 'Continue following normal browsing precautions.'}
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
          SECTION 13: ADVANCED TECHNICAL DETAILS (Collapsed by default)
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
                { id: 'dns', label: 'DNS' },
                { id: 'tls', label: 'TLS / SSL' },
                { id: 'server', label: 'Server' },
                { id: 'headers', label: 'Headers' },
                { id: 'redirects', label: 'Redirects' },
                { id: 'content', label: 'Content' },
                { id: 'resources', label: 'Resources' },
                { id: 'scores', label: 'Scores' },
                { id: 'threat_intel', label: 'Threat Intel' },
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

            {/* TAB CONTENT: DNS */}
            {activeTechTab === 'dns' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">DNS Resolution</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Resolved IPs: </span>
                    <span className="text-slate-200">
                      {result.technical_details?.dns?.resolved_ips?.join(', ') || (result.technical_details?.dns?.resolved ? 'Resolved' : 'None')}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">DNS Status: </span>
                    <span className="text-slate-200">
                      {result.technical_details?.dns?.resolved ? 'Success' : result.technical_details?.dns?.error || 'Failed'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Private IP Detected: </span>
                    <span className="text-slate-200">
                      {result.technical_details?.dns?.is_private ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TLS */}
            {activeTechTab === 'tls' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">TLS / SSL Certificate</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Issuer: </span>
                    <span className="text-teal-300">{result.technical_details?.tls?.issuer || 'Unknown'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Protocol: </span>
                    <span className="text-slate-200">{result.technical_details?.tls?.tls_version || 'TLS 1.2/1.3'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Cipher Suite: </span>
                    <span className="text-slate-200 truncate">{result.technical_details?.tls?.cipher_suite || 'Standard'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Valid Until: </span>
                    <span className="text-slate-200">{result.technical_details?.tls?.not_after || 'Valid'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SERVER */}
            {activeTechTab === 'server' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Server Information</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Server Banner: </span>
                    <span className="text-slate-200">{result.technical_details?.http?.server || 'Not Disclosed'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">HTTP Status: </span>
                    <span className="text-teal-300 font-bold">{result.technical_details?.http?.status_code || 200}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Primary IP: </span>
                    <span className="text-slate-200">{result.technical_details?.dns?.resolved_ips?.[0] || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Reachable: </span>
                    <span className="text-slate-200">{result.technical_details?.http?.reachable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HEADERS */}
            {activeTechTab === 'headers' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Security Headers</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.keys(headers).map(headerKey => {
                    const h = headers[headerKey]
                    const isPresent = h?.status !== 'Missing'
                    return (
                      <div key={headerKey} className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center font-mono">
                          <span className="font-semibold text-slate-200">{headerKey}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isPresent ? 'bg-teal-500/15 text-teal-300' : 'bg-amber-500/15 text-amber-300'
                          }`}>
                            {isPresent ? 'Present' : 'Missing'}
                          </span>
                        </div>
                        {h?.value && <p className="text-[11px] text-slate-400 font-mono truncate">{h.value}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REDIRECTS */}
            {activeTechTab === 'redirects' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Redirect Chain</div>
                <div className="space-y-1.5 font-mono text-xs">
                  {(result.technical_details?.redirects?.chain || []).length > 0 ? (
                    result.technical_details?.redirects?.chain?.map((hop, idx) => (
                      <div key={idx} className="flex items-center space-x-2 p-2 bg-slate-900/60 rounded border border-slate-800">
                        <span className="text-teal-400 font-bold">#{hop.hop || idx + 1}</span>
                        <span className="text-slate-300 truncate">{hop.from} &rarr; {hop.to}</span>
                        <span className="text-[10px] text-slate-400 ml-auto font-bold">{hop.status_code}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-slate-400">
                      No redirects detected. Target accessed directly.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: CONTENT */}
            {activeTechTab === 'content' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Content & Forms</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Page Title: </span>
                    <span className="text-slate-200 truncate">{result.technical_details?.content?.title || domain}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Forms Count: </span>
                    <span className="text-slate-200">{result.technical_details?.content?.forms_count ?? 0}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Password Fields: </span>
                    <span className="text-slate-200">{result.technical_details?.content?.has_password_input ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Language: </span>
                    <span className="text-slate-200">{result.technical_details?.content?.language || 'Unspecified'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESOURCES */}
            {activeTechTab === 'resources' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Resources & Scripts</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">External Scripts: </span>
                    <span className="text-slate-200">{result.external_resources?.scripts ?? 0}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
                    <span className="text-slate-400">Total External Domains: </span>
                    <span className="text-slate-200">{result.external_resources?.unique_domains ?? 0}</span>
                  </div>
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
                    <span className="text-slate-400">Active Findings Count:</span>
                    <span className="text-amber-300 font-bold">{allFindings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Positive Signals Count:</span>
                    <span className="text-teal-300 font-bold">{displayPositiveSignals.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: THREAT INTEL */}
            {activeTechTab === 'threat_intel' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Threat Intelligence Audit</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {(tiSources.length > 0 ? tiSources : [
                    { source: 'Google Safe Browsing', status: 'NOT_CONFIGURED' },
                    { source: 'VirusTotal', status: 'NOT_CONFIGURED' },
                    { source: 'URLhaus', status: 'NOT_CONFIGURED' },
                    { source: 'PhishTank', status: 'NOT_DETECTED' }
                  ]).map((src: any, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
                      <div className="font-semibold text-slate-200">{src.source || src.name}</div>
                      <div className="text-slate-400">Status: <span className="text-teal-300">{src.status || (src.detected ? 'DETECTED' : 'NOT_DETECTED')}</span></div>
                    </div>
                  ))}
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

export default WebsiteReportView
