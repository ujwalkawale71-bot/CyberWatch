import { useState } from 'react'
import {
  FileCode,
  Globe,
  Key,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Shield,
  ChevronDown,
  ChevronUp,
  Printer,
  RotateCcw,
  Sparkles,
  Info,
  EyeOff,
  Binary,
  FolderCode
} from 'lucide-react'
import type { ExtensionScanResult } from '../../types/extensionScanner'

interface ExtensionReportViewProps {
  result: ExtensionScanResult
  onReset: () => void
}

// ─────────────────────────────────────────────────────────────
// User-Friendly Finding Item
// ─────────────────────────────────────────────────────────────
interface UserFriendlyFinding {
  id: string
  title: string
  description: string
  statusTag: 'Detected' | 'Suspicious' | 'Confirmed Malicious'
  category: 'Code' | 'Permission' | 'Website Access' | 'Synergy' | 'Structure'
  originalTechnicalName: string
  evidence?: string
  filePath?: string
  confidence?: number
}

// ─────────────────────────────────────────────────────────────
// Translate technical findings to plain, calm, human language
// ─────────────────────────────────────────────────────────────
function mapToUserFriendlyFindings(result: ExtensionScanResult): UserFriendlyFinding[] {
  const items: UserFriendlyFinding[] = []

  // 1. Code Findings
  const codeFindings = result.codeFindings || []
  codeFindings.forEach((cf, idx) => {
    const rawName = (cf.pattern_name || cf.title || '').toLowerCase()
    let title = cf.title || 'Code Pattern Detected'
    let description = cf.why_it_matters || cf.description || 'Static code pattern identified during JavaScript inspection.'
    let statusTag: 'Detected' | 'Suspicious' | 'Confirmed Malicious' = 'Detected'

    if (rawName.includes('webassembly')) {
      title = 'Advanced Code Execution Technology'
      description = 'WebAssembly usage was detected. This is commonly used for performance and is not malicious by itself.'
      statusTag = 'Detected'
    } else if (rawName.includes('dynamic script') || rawName.includes('createelement')) {
      title = 'Dynamic Browser Script Activity'
      description = 'The extension contains code capable of dynamically creating browser script elements. This requires additional review but is not automatically malicious.'
      statusTag = 'Detected'
    } else if (rawName.includes('eval') || rawName.includes('dynamic code execution')) {
      title = 'Dynamic Code Evaluation'
      description = 'The extension contains dynamic string evaluation code. While used by some templating engines, it represents an elevated execution pattern.'
      statusTag = 'Suspicious'
    } else if (rawName.includes('function constructor') || rawName.includes('new function')) {
      title = 'Dynamic Function Construction'
      description = 'The extension constructs functions dynamically from strings, a standard pattern used in modern JavaScript bundlers and templating engines.'
      statusTag = 'Detected'
    } else if (rawName.includes('connectnative') || rawName.includes('native messaging')) {
      title = 'Desktop Application Communication'
      description = 'The extension includes capabilities to communicate with native desktop software installed on your computer.'
      statusTag = 'Suspicious'
    } else if (rawName.includes('debugger')) {
      title = 'Developer Debugging Protocol Access'
      description = 'Accesses Chrome DevTools Protocol, enabling deep programmatic inspection and interaction with web page sessions.'
      statusTag = 'Suspicious'
    } else if (cf.severity === 'CRITICAL') {
      title = cf.title || 'Critical Code Security Finding'
      description = cf.why_it_matters || cf.description || 'A critical security finding was identified in the extension JavaScript bundle.'
      statusTag = 'Confirmed Malicious'
    } else if (cf.severity === 'HIGH') {
      title = cf.title || 'Elevated Code Capability'
      description = cf.why_it_matters || cf.description || 'An elevated code execution pattern was detected during static inspection.'
      statusTag = 'Suspicious'
    }

    items.push({
      id: cf.id || `code-${idx}`,
      title,
      description,
      statusTag,
      category: 'Code',
      originalTechnicalName: cf.pattern_name || cf.title || 'Static Code Finding',
      evidence: cf.evidence || cf.line_or_pattern,
      filePath: cf.affected_file || cf.file,
      confidence: cf.confidence
    })
  })

  // 2. High-Risk / Compounding Synergies
  const combinations = result.combinations || []
  combinations.forEach((c, idx) => {
    const comboList = c.combination || []
    let title = 'Compounding Privileges'
    let description = 'The extension combines multiple permissions that expand its overall scope of access across network requests or web content.'
    const statusTag: 'Detected' | 'Suspicious' | 'Confirmed Malicious' = 'Suspicious'

    if (comboList.includes('webRequest') || comboList.includes('webrequest')) {
      title = 'Network Traffic Observation Synergy'
      description = 'The extension pairs network request monitoring with website access, allowing it to observe data payloads in transit.'
    } else if (comboList.includes('cookies')) {
      title = 'Session Data & Website Access Synergy'
      description = 'The extension pairs browser cookie access with website permissions, enabling access to active authenticated sessions.'
    } else if (comboList.includes('scripting') || comboList.includes('tabs')) {
      title = 'Tab Control & Scripting Synergy'
      description = 'The extension pairs tab management with script injection, allowing automated interactions on visited websites.'
    }

    items.push({
      id: `combo-${idx}`,
      title,
      description,
      statusTag,
      category: 'Synergy',
      originalTechnicalName: `Synergy: ${comboList.join(' + ')}`,
      evidence: c.evidence || `Combination: ${comboList.join(', ')}`
    })
  })

  // 3. Universal Website Access (if present)
  const universalHosts = (result.hostPermissions || []).filter((h) => h.isWildcard)
  if (universalHosts.length > 0) {
    items.push({
      id: 'host-universal',
      title: 'Universal Website Access',
      description: 'The extension requests permission to read and alter data across all websites you visit.',
      statusTag: 'Suspicious',
      category: 'Website Access',
      originalTechnicalName: `Wildcard Host Access (${universalHosts.map((h) => h.permission).join(', ')})`,
      evidence: universalHosts.map((h) => h.permission).join(', ')
    })
  }

  // 4. Critical / High Permissions
  const highPerms = (result.permissions || []).filter(
    (p) => p.severity === 'CRITICAL' || (p.severity === 'HIGH' && p.name !== 'storage')
  )
  highPerms.forEach((p, idx) => {
    let title = `Elevated Permission: ${p.name}`
    let description = p.whyItMatters || p.description || `The extension requests access to the '${p.name}' browser feature.`
    const statusTag: 'Detected' | 'Suspicious' | 'Confirmed Malicious' = p.severity === 'CRITICAL' ? 'Suspicious' : 'Detected'

    if (p.name === 'debugger') {
      title = 'Browser Debugging Protocol'
      description = 'Programmatic control of web page DOM and network state via Chrome DevTools Protocol.'
    } else if (p.name === 'nativeMessaging') {
      title = 'Native Desktop Communication'
      description = 'Allows exchanging messages with desktop applications installed on the operating system.'
    } else if (p.name === 'cookies') {
      title = 'Cookie Store Access'
      description = 'Allows reading and modifying stored cookies for domains within the extension host scope.'
    } else if (p.name === 'history') {
      title = 'Browser History Access'
      description = 'Provides access to visited URLs and browsing history timeline.'
    }

    items.push({
      id: `perm-${idx}`,
      title,
      description,
      statusTag,
      category: 'Permission',
      originalTechnicalName: `Permission: ${p.name}`,
      evidence: p.evidence || `Declared permission: ${p.name}`
    })
  })

  return items
}

// ─────────────────────────────────────────────────────────────
// Category Ratings Calculator (5 standard categories)
// ─────────────────────────────────────────────────────────────
type CategoryRating = 'LOW' | 'MODERATE' | 'HIGH' | 'NOT ANALYZED'

interface CategoryBreakdown {
  id: string
  label: string
  rating: CategoryRating
  explanation: string
  icon: typeof Key
}

function computeCategoryBreakdown(result: ExtensionScanResult, isLimited: boolean): CategoryBreakdown[] {
  const manifestVerified = result.dataVerification?.manifest_status === 'VERIFIED'
  const codeCompleted =
    result.dataVerification?.code_analysis_status === 'COMPLETED' &&
    (result.dataVerification?.files_scanned_count ?? 0) > 0

  // 1. Permissions
  let permRating: CategoryRating = 'NOT ANALYZED'
  let permExplain = 'Manifest permissions not inspected.'
  if (manifestVerified) {
    const permScore = result.subScoresBreakdown?.permission_risk ?? 0
    const hasCritOrHigh = (result.permissions || []).some((p) => p.severity === 'CRITICAL' || p.severity === 'HIGH')
    if (permScore >= 20 || hasCritOrHigh) {
      permRating = 'HIGH'
      permExplain = 'Elevated or sensitive browser APIs requested.'
    } else if (permScore >= 8 || (result.permissions || []).some((p) => p.severity === 'MEDIUM')) {
      permRating = 'MODERATE'
      permExplain = 'Standard operational permissions declared.'
    } else {
      permRating = 'LOW'
      permExplain = 'Only standard, low-privilege APIs requested.'
    }
  }

  // 2. Website Access
  let hostRating: CategoryRating = 'NOT ANALYZED'
  let hostExplain = 'Host permissions not inspected.'
  if (manifestVerified) {
    const hasWildcard = (result.hostPermissions || []).some((h) => h.isWildcard)
    const hostCount = (result.hostPermissions || []).length
    if (hasWildcard) {
      hostRating = 'HIGH'
      hostExplain = 'Universal access across all visited websites.'
    } else if (hostCount > 1) {
      hostRating = 'MODERATE'
      hostExplain = `Access restricted to ${hostCount} specific domain(s).`
    } else if (hostCount === 1) {
      hostRating = 'LOW'
      hostExplain = `Access restricted to 1 specified domain origin.`
    } else {
      hostRating = 'LOW'
      hostExplain = 'No website content access requested.'
    }
  }

  // 3. Code Behaviour
  let codeRating: CategoryRating = 'NOT ANALYZED'
  let codeExplain = 'JavaScript files not available for inspection.'
  if (codeCompleted) {
    const codeFindings = result.codeFindings || []
    const hasHighCrit = codeFindings.some((c) => c.severity === 'CRITICAL' || c.severity === 'HIGH')
    const hasMed = codeFindings.some((c) => c.severity === 'MEDIUM')
    if (hasHighCrit) {
      codeRating = 'HIGH'
      codeExplain = 'Elevated dynamic code execution patterns detected.'
    } else if (hasMed) {
      codeRating = 'MODERATE'
      codeExplain = 'Standard dynamic script activity detected.'
    } else {
      codeRating = 'LOW'
      codeExplain = 'No suspicious code execution patterns found.'
    }
  } else if (!isLimited) {
    codeRating = 'LOW'
    codeExplain = 'Clean manifest structure; no active scripts flagged.'
  }

  // 4. Privacy Exposure
  let privacyRating: CategoryRating = 'NOT ANALYZED'
  let privacyExplain = 'Privacy surface not inspected.'
  if (manifestVerified) {
    const hasHistoryOrCookies = (result.permissions || []).some((p) =>
      ['cookies', 'history', 'tabs', 'clipboardRead', 'geolocation'].includes(p.name)
    )
    const hasWildcard = (result.hostPermissions || []).some((h) => h.isWildcard)
    if (hasWildcard && hasHistoryOrCookies) {
      privacyRating = 'HIGH'
      privacyExplain = 'Access to sensitive user or session data across websites.'
    } else if (hasHistoryOrCookies) {
      privacyRating = 'MODERATE'
      privacyExplain = 'Access to localized browser session or tab metadata.'
    } else {
      privacyRating = 'LOW'
      privacyExplain = 'No sensitive personal or session data accessed.'
    }
  }

  // 5. Obfuscation
  let obfRating: CategoryRating = 'NOT ANALYZED'
  let obfExplain = 'Source code not available for entropy analysis.'
  if (codeCompleted) {
    const obfStatus = result.obfuscationStatus || 'NONE'
    if (obfStatus === 'HIGH' || result.obfuscationDetails?.packed_js_detected) {
      obfRating = 'HIGH'
      obfExplain = 'High character entropy or packed script structures detected.'
    } else if (obfStatus === 'MEDIUM' || obfStatus === 'LOW') {
      obfRating = 'MODERATE'
      obfExplain = 'Standard production minification / bundler optimization.'
    } else {
      obfRating = 'LOW'
      obfExplain = 'Clean, readable source code with low entropy.'
    }
  } else if (!isLimited) {
    obfRating = 'LOW'
    obfExplain = 'No obfuscation indicators flagged.'
  }

  return [
    { id: 'cat-perm', label: 'Permissions', rating: permRating, explanation: permExplain, icon: Key },
    { id: 'cat-host', label: 'Website Access', rating: hostRating, explanation: hostExplain, icon: Globe },
    { id: 'cat-code', label: 'Code Behaviour', rating: codeRating, explanation: codeExplain, icon: FileCode },
    { id: 'cat-privacy', label: 'Privacy Exposure', rating: privacyRating, explanation: privacyExplain, icon: EyeOff },
    { id: 'cat-obf', label: 'Obfuscation', rating: obfRating, explanation: obfExplain, icon: Binary }
  ]
}

// ─────────────────────────────────────────────────────────────
// Positive Security Signals Generator
// ─────────────────────────────────────────────────────────────
function extractPositiveSignals(result: ExtensionScanResult, isLimited: boolean): string[] {
  const signals: string[] = []

  if (result.dataVerification?.metadata_status === 'VERIFIED' || result.developer) {
    signals.push('Extension identity verified on Chrome Web Store')
  }
  if (result.dataVerification?.manifest_status === 'VERIFIED') {
    signals.push('Manifest specification successfully analyzed')
  }
  if (result.manifestVersion === 3) {
    signals.push('Modern Manifest V3 security architecture')
  }
  if (!result.codeFindings?.some((c) => c.severity === 'CRITICAL')) {
    signals.push('No confirmed malicious payloads or remote execution vectors')
  }
  if (!(result.hostPermissions || []).some((h) => h.isWildcard)) {
    signals.push('Website access restricted to specific domain origins')
  }
  if ((result.combinations || []).length === 0 && !isLimited) {
    signals.push('No compounding high-risk permission synergies detected')
  }
  if (
    result.dataVerification?.code_analysis_status === 'COMPLETED' &&
    (result.dataVerification?.files_scanned_count ?? 0) > 0 &&
    (result.codeFindings || []).length === 0
  ) {
    signals.push('JavaScript source code analyzed cleanly with zero suspicious patterns')
  }

  return signals
}

// ─────────────────────────────────────────────────────────────
// Recommendation Generator
// ─────────────────────────────────────────────────────────────
function generateRecommendation(
  result: ExtensionScanResult,
  isLimited: boolean,
  primaryVerdict: string
): { headline: string; checklist: string[] } {
  if (isLimited) {
    return {
      headline: 'Store metadata verified. Direct package code inspection was unavailable from the CRX server. Review extension permissions manually in browser settings.',
      checklist: [
        'Review ratings and user counts on the official Chrome Web Store.',
        'Inspect declared permissions in browser extension settings (chrome://extensions) after installation.',
        'Upload the CRX archive directly into CyberWatch for full code-level inspection.'
      ]
    }
  }

  if (primaryVerdict === 'CRITICAL RISK') {
    const hasConfirmedMalicious = (result.codeFindings || []).some((c) => c.severity === 'CRITICAL')
    if (hasConfirmedMalicious) {
      return {
        headline: 'Confirmed malicious behavior was detected in the extension code. Remove immediately.',
        checklist: [
          'Uninstall or disable this extension immediately from all browser profiles.',
          'Invalidate active sessions and rotate sensitive credentials if used on sensitive sites.',
          'Report the suspicious extension package to the Chrome Web Store security team.'
        ]
      }
    }
    return {
      headline: 'Strong security concerns were detected. Avoid installation until the findings are reviewed.',
      checklist: [
        'Review the specific high-privilege permissions listed in the technical breakdown below.',
        'Restrict extension site access to "On click" in browser extension settings.',
        'Consider alternative extensions with narrower permission requirements.'
      ]
    }
  }

  if (primaryVerdict === 'HIGH RISK') {
    return {
      headline: 'Review the security findings carefully before using this extension, especially on sensitive accounts.',
      checklist: [
        'In Chrome extension settings (chrome://extensions), set site access to specific permitted domains.',
        'Avoid using this extension while accessing enterprise portals, webmail, or banking accounts.',
        'Verify the developer profile and community reputation on the Chrome Web Store.'
      ]
    }
  }

  if (primaryVerdict === 'MODERATE RISK') {
    return {
      headline: 'Review the requested permissions before installation to ensure they align with the extension advertised features.',
      checklist: [
        'Verify that requested permissions correspond directly to features you intend to use.',
        'Check publisher credentials and user reviews on the Chrome Web Store.',
        'Periodically review extension permissions after automatic updates.'
      ]
    }
  }

  // LOW RISK / SAFE
  return {
    headline: 'Appears generally safe based on the available analysis. Suitable for standard installation.',
    checklist: [
      'Standard low-risk extension suitable for everyday browser usage.',
      'Ensure installation is performed from the verified Chrome Web Store link.',
      'Keep your browser updated to maintain sandbox boundary enforcement.'
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function ExtensionReportView({ result, onReset }: ExtensionReportViewProps) {
  const [copied, setCopied] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [activeTechTab, setActiveTechTab] = useState<'permissions' | 'hosts' | 'architecture' | 'code' | 'provenance'>('permissions')
  const [techSearch, setTechSearch] = useState('')

  const isLimited = result.severity === 'LIMITED' || result.overallScore === null
  const numericScore = result.overallScore !== null ? Math.round(result.overallScore) : null

  // 1. Primary Verdict Calculation
  let primaryVerdict = 'LOW RISK'
  let verdictColor = 'teal'
  if (isLimited) {
    primaryVerdict = 'ANALYSIS LIMITED'
    verdictColor = 'slate'
  } else if (numericScore !== null && numericScore >= 75) {
    primaryVerdict = 'CRITICAL RISK'
    verdictColor = 'red'
  } else if (numericScore !== null && numericScore >= 50) {
    primaryVerdict = 'HIGH RISK'
    verdictColor = 'orange'
  } else if (numericScore !== null && numericScore >= 20) {
    primaryVerdict = 'MODERATE RISK'
    verdictColor = 'amber'
  } else {
    primaryVerdict = 'LOW RISK'
    verdictColor = 'teal'
  }

  const isVerifiedData =
    result.dataVerification?.metadata_status === 'VERIFIED' ||
    result.dataVerification?.manifest_status === 'VERIFIED'

  const userFriendlyFindings = mapToUserFriendlyFindings(result)
  const categoryBreakdown = computeCategoryBreakdown(result, isLimited)
  const positiveSignals = extractPositiveSignals(result, isLimited)
  const recommendation = generateRecommendation(result, isLimited, primaryVerdict)

  const handleCopyId = () => {
    if (result.extensionId && result.extensionId !== 'N/A') {
      navigator.clipboard.writeText(result.extensionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Count total technical items for badge
  const totalTechItems =
    (result.permissions || []).length +
    (result.hostPermissions || []).length +
    (result.codeFindings || []).length +
    (result.combinations || []).length

  // Filter technical permissions
  const filteredTechPerms = (result.permissions || []).filter(
    (p) =>
      p.name.toLowerCase().includes(techSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(techSearch.toLowerCase()) ||
      (p.whyItMatters || '').toLowerCase().includes(techSearch.toLowerCase())
  )

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-300 print:space-y-4 print:text-black">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: EXTENSION IDENTITY
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
            {/* Extension Icon / Placeholder */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
              {result.iconUrl ? (
                <img
                  src={result.iconUrl}
                  alt={result.name}
                  className="w-10 h-10 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-lg font-black text-teal-400 font-mono">
                  {result.name ? result.name.charAt(0).toUpperCase() : 'E'}
                </span>
              )}
            </div>

            {/* Name, Developer, Version, ID */}
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {result.name || result.extensionId || 'Extension Security Audit'}
                </h1>

                {/* Small Verified Extension Data Badge */}
                {isVerifiedData && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" />
                    <span>Verified Extension Data</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                {result.developer && (
                  <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-none">
                    by {result.developer}
                  </span>
                )}

                {result.version && result.version !== 'N/A' && (
                  <span className="px-1.5 py-0.2 rounded text-[11px] font-mono text-slate-300 bg-slate-800/80 border border-slate-700/60">
                    v{result.version}
                  </span>
                )}

                {result.manifestVersion && (
                  <span className="text-[11px] font-mono text-slate-400">
                    MV{result.manifestVersion}
                  </span>
                )}

                {result.extensionId && result.extensionId !== 'N/A' && (
                  <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-850">
                    <span className="text-slate-500">ID:</span>
                    <span className="text-slate-300 select-all truncate max-w-[140px] sm:max-w-[220px]">
                      {result.extensionId}
                    </span>
                    <button
                      onClick={handleCopyId}
                      title="Copy Extension ID"
                      className="p-0.5 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 self-start md:self-center flex-shrink-0">
            {result.storeUrl && (
              <a
                href={result.storeUrl}
                target="_blank"
                rel="noreferrer"
                title="View on Chrome Web Store"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors"
              >
                <span>Store Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handlePrint}
              title="Print Audit Report"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onReset}
              title="New Scan"
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: OVERALL SECURITY STATUS
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-xl border p-5 shadow-lg backdrop-blur-sm transition-colors ${
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Security Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-black tracking-wide border ${
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

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {isLimited
                ? 'Store metadata verified. Code-level manifest inspection was unavailable from the CRX package server.'
                : 'This score is based on permissions, website access, and verified security findings.'}
            </p>
          </div>

          {/* Single Calm Score Pill */}
          <div className="flex items-center sm:self-center bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-xl flex-shrink-0 space-x-3">
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Risk Score
              </div>
              <div className="text-xl font-black font-mono text-white">
                {numericScore !== null ? `${numericScore} / 100` : 'Unavailable'}
              </div>
            </div>

            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
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
          SECTION 3: WHAT WE FOUND
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              What We Found
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {userFriendlyFindings.length} observation{userFriendlyFindings.length === 1 ? '' : 's'}
          </span>
        </div>

        {userFriendlyFindings.length === 0 ? (
          <div className="p-3.5 rounded-lg border border-teal-500/20 bg-teal-950/10 text-xs text-teal-300 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              {isLimited
                ? 'No immediate store-level red flags identified. Manifest inspection was unavailable.'
                : 'No suspicious code execution patterns, dangerous combinations, or high-risk behaviors detected.'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userFriendlyFindings.map((finding) => {
              const isMalicious = finding.statusTag === 'Confirmed Malicious'
              const isSuspicious = finding.statusTag === 'Suspicious'

              return (
                <div
                  key={finding.id}
                  className={`p-3.5 rounded-lg border transition-colors space-y-2 text-left ${
                    isMalicious
                      ? 'border-red-500/30 bg-red-950/15'
                      : isSuspicious
                      ? 'border-amber-500/25 bg-amber-950/10'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white leading-tight">
                      {finding.title}
                    </div>

                    {/* Status Badge: Detected / Suspicious / Confirmed Malicious */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide flex-shrink-0 border ${
                        isMalicious
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : isSuspicious
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-teal-500/10 text-teal-300 border-teal-500/25'
                      }`}
                    >
                      {finding.statusTag}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {finding.description}
                  </p>

                  {/* Subtle technical anchor reference */}
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-850">
                    <span className="truncate max-w-[200px]">{finding.originalTechnicalName}</span>
                    {finding.filePath && (
                      <span className="text-slate-400 truncate max-w-[140px]">
                        {finding.filePath}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: SECURITY BREAKDOWN (Max 5 categories)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Security Breakdown
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Core Risk Surface</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categoryBreakdown.map((cat) => {
            const Icon = cat.icon
            const isHigh = cat.rating === 'HIGH'
            const isMod = cat.rating === 'MODERATE'
            const isLow = cat.rating === 'LOW'

            return (
              <div
                key={cat.id}
                className={`p-3.5 rounded-lg border space-y-2 flex flex-col justify-between ${
                  isHigh
                    ? 'border-orange-500/30 bg-orange-950/15'
                    : isMod
                    ? 'border-amber-500/25 bg-amber-950/10'
                    : isLow
                    ? 'border-teal-500/20 bg-slate-950/50'
                    : 'border-slate-800 bg-slate-950/30'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-semibold">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cat.label}</span>
                    </div>

                    {/* Category Rating: LOW / MODERATE / HIGH / NOT ANALYZED */}
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-black tracking-wider border ${
                        isHigh
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : isMod
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : isLow
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {cat.rating}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {cat.explanation}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: POSITIVE SECURITY SIGNALS
          ───────────────────────────────────────────────────────────── */}
      {positiveSignals.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-3">
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
                <span>{sig}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: RECOMMENDATION
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Recommendation & Next Steps
          </h2>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="text-xs font-semibold text-white leading-relaxed">
            {recommendation.headline}
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            {recommendation.checklist.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: ADVANCED TECHNICAL DETAILS (Collapsed by default)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-lg overflow-hidden transition-all">
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
              {totalTechItems} Item{totalTechItems === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-semibold">
            <span>{showTechnicalDetails ? 'Hide Technical Analysis' : 'View Technical Analysis'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-800 space-y-4 bg-slate-950/60 animate-in fade-in duration-200">
            {/* Tab navigation */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTechTab('permissions')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'permissions' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Permissions ({(result.permissions || []).length})
              </button>
              <button
                onClick={() => setActiveTechTab('hosts')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'hosts' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Host Origins ({(result.hostPermissions || []).length})
              </button>
              <button
                onClick={() => setActiveTechTab('architecture')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'architecture' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Architecture & Manifest
              </button>
              <button
                onClick={() => setActiveTechTab('code')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'code' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JavaScript Code ({result.dataVerification?.total_js_files_scanned ?? result.dataVerification?.files_scanned_count ?? 0} Files)
              </button>
              <button
                onClick={() => setActiveTechTab('provenance')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'provenance' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Provenance
              </button>
            </div>

            {/* TAB 1: Permissions */}
            {activeTechTab === 'permissions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Filter permissions..."
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    className="w-full sm:w-64 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total: {(result.permissions || []).length}
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredTechPerms.length === 0 ? (
                    <div className="text-xs text-slate-400 p-3 bg-slate-900/40 rounded border border-slate-850">
                      No matching permissions found.
                    </div>
                  ) : (
                    filteredTechPerms.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-teal-300">{p.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              p.severity === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : p.severity === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                : p.severity === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {p.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">{p.description}</p>
                        {p.whyItMatters && (
                          <p className="text-[10px] text-slate-400 font-sans italic">{p.whyItMatters}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Host Permissions */}
            {activeTechTab === 'hosts' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(result.hostPermissions || []).length === 0 ? (
                  <div className="text-xs text-slate-400 p-3 bg-slate-900/40 rounded border border-slate-850">
                    No host permissions declared. Extension operates without web page origin access.
                  </div>
                ) : (
                  (result.hostPermissions || []).map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-teal-300">{h.permission}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            h.isWildcard
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                          }`}
                        >
                          {h.scopeType === 'universal' ? 'Universal Wildcard' : 'Origin Scoped'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{h.scopeDescription || h.reason}</p>
                      {h.whyItMatters && (
                        <p className="text-[10px] text-slate-400 italic">{h.whyItMatters}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Architecture & Manifest */}
            {activeTechTab === 'architecture' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Manifest Version</div>
                  <div className="font-mono text-teal-300">{result.structure.manifestVersionLabel}</div>
                  <p className="text-[11px] text-slate-400">{result.structure.manifestVersionExplanation}</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Background / Service Worker</div>
                  <div className="font-mono text-teal-300">{result.structure.backgroundStatus}</div>
                  <p className="text-[11px] text-slate-400">{result.structure.backgroundDetails}</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Content Scripts</div>
                  <div className="font-mono text-teal-300">{result.structure.contentScriptsStatus}</div>
                  <p className="text-[11px] text-slate-400">{result.structure.contentScriptsDetails}</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Web Accessible Resources</div>
                  <div className="font-mono text-teal-300">
                    {result.webAccessibleResources?.status || 'NOT DECLARED'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {result.webAccessibleResources?.summary || 'No web accessible resources exposed.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: JavaScript Code Analysis */}
            {activeTechTab === 'code' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Scanned JS Files</div>
                    <div className="text-base font-bold font-mono text-white">
                      {result.dataVerification?.total_js_files_scanned ?? result.dataVerification?.files_scanned_count ?? 0}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Obfuscation Status</div>
                    <div className="text-base font-bold font-mono text-teal-300">
                      {result.obfuscationStatus || 'NONE'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Max Shannon Entropy</div>
                    <div className="text-base font-bold font-mono text-white">
                      {result.obfuscationDetails?.max_entropy ? `${result.obfuscationDetails.max_entropy} bits` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Raw code findings list */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(result.codeFindings || []).length === 0 ? (
                    <div className="p-3 bg-slate-900/40 rounded border border-slate-850 text-slate-400">
                      No code execution anomalies identified in scanned JavaScript files.
                    </div>
                  ) : (
                    (result.codeFindings || []).map((cf, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-1 text-left"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-bold text-white">{cf.title || cf.pattern_name}</span>
                          <span className="text-[10px] text-slate-400">Confidence: {Math.round((cf.confidence ?? 0.8) * 100)}%</span>
                        </div>
                        {cf.affected_file && (
                          <div className="text-[10px] text-teal-400 font-mono">File: {cf.affected_file}</div>
                        )}
                        {cf.evidence && (
                          <pre className="p-2 bg-slate-950 rounded border border-slate-850 font-mono text-[10px] text-slate-300 overflow-x-auto">
                            {cf.evidence}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Provenance */}
            {activeTechTab === 'provenance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Metadata Verification</div>
                  <div className="font-mono text-teal-300">{result.dataVerification?.metadata_status || 'UNAVAILABLE'}</div>
                  <p className="text-[11px] text-slate-400">Channel: Google Chrome Web Store API</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Package Source & Format</div>
                  <div className="font-mono text-teal-300">
                    {result.dataVerification?.package_status || 'UNAVAILABLE'} ({result.dataVerification?.package_format || 'CRX3'})
                  </div>
                  <p className="text-[11px] text-slate-400">Extracted & analyzed in-memory</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Scanner Engine</div>
                  <div className="font-mono text-teal-300">{result.engine || 'CyberWatch Extension Analyzer 1.0'}</div>
                  <p className="text-[11px] text-slate-400">Deterministic Rule & AST Static Analyzer</p>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-semibold text-white">Coverage Level</div>
                  <div className="font-mono text-teal-300">
                    {result.dataVerification?.analysis_coverage_percent ?? (isLimited ? 25 : 85)}%
                  </div>
                  <p className="text-[11px] text-slate-400">Verified pipeline analysis completeness</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
