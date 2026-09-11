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
  ArrowRight,
  Copy,
  Check,
  Server,
  Info,
  Sparkles,
  Shield,
  FolderCode
} from 'lucide-react'

export interface ThreatIntelSourceRecord {
  source: string
  configured?: boolean
  request_executed?: boolean
  response_received?: boolean
  status: 'DETECTED' | 'NOT_DETECTED' | 'NOT DETECTED' | 'NOT_CONFIGURED' | 'NOT CONFIGURED' | 'NOT ANALYZED' | 'FAILED' | 'RATE LIMITED' | string
  data_origin?: string
  detected?: boolean
  reason: string
  checked_at: string
  details?: any
}

export interface ScoreComponent {
  id?: string
  title?: string
  category?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string
  evidence_type?: string
  score_contribution?: number
  confidence?: string
  reason?: string
  evidence?: string
}

export interface URLReportData {
  id?: number
  scan_id?: number
  submitted_url?: string
  target_url: string
  normalized_url?: string
  hostname?: string
  domain?: string
  extracted_domain?: string
  protocol?: string
  port?: number
  threat_score?: number | null
  threat_index?: number | null
  risk_score?: number | null
  heuristic_score?: number | null
  verified_threat_score?: number | null
  overall_risk?: string
  risk_level?: string
  evidence_confidence?: string
  local_analysis_confidence?: string
  threat_intelligence_confidence?: string
  overall_assessment_confidence?: string
  analysis_confidence?: string
  local_analysis_status?: string
  threat_intel_coverage?: string
  local_analysis_coverage?: {
    status: string
    percent: number
    modules_completed?: number
    total_modules?: number
  }
  threat_intelligence_coverage?: {
    status: string
    sources_configured?: number
    sources_total?: number
    percent?: number
  }
  security_verdict?: string
  explanation?: string
  confidence_explanation?: string
  detected_indicators?: string[]
  findings?: Array<{
    id?: string
    category?: string
    title?: string
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string
    evidence_type?: string
    score_impact?: number
    confidence_rating?: string
    statusTag?: string
    reason?: string
    evidence?: string
    module?: string
    confidence?: number
    timestamp?: string
  }>
  score_components?: ScoreComponent[]
  passed_checks?: string[]
  warnings?: string[]
  checks_performed?: string[]
  checks_not_performed?: Array<string | { name: string; reason: string }>
  positive_signals?: string[]
  recommendations?: string[]
  threat_intelligence?: {
    sources_queried?: ThreatIntelSourceRecord[]
    total_sources?: number
    configured_sources_count?: number
    active_sources_count?: number
    detections_count?: number
    coverage_status?: 'AVAILABLE' | 'PARTIAL' | 'NOT AVAILABLE' | string
    coverage_note?: string
    findings?: any[]
  }
  threat_intelligence_result?: any
  threat_intelligence_sources?: ThreatIntelSourceRecord[]
  timestamp?: string
  status?: string
  analysis_limitations?: string
  technical_details?: {
    url_structure?: {
      original_url?: string
      normalized_url?: string
      scheme?: string
      hostname?: string
      port?: number
      registered_domain?: string
      subdomains?: string[]
      tld?: string
      path?: string
      query?: string
      query_parameters_count?: number
      is_ip_host?: boolean
      percent_encoded_count?: number
      suspicious_characters?: string
    }
    dns?: {
      resolved?: boolean
      resolved_ips?: string[]
      ipv4?: string[]
      ipv6?: string[]
      is_private?: boolean
      latency_ms?: number
      error?: string | null
    }
    tls?: {
      valid?: boolean
      tls_version?: string
      cipher_suite?: string
      issuer?: string
      issuer_cn?: string
      subject_cn?: string
      subject_alt_names?: string[]
      not_before?: string
      not_after?: string
      days_remaining?: number
      is_expired?: boolean
      is_self_signed?: boolean
      error?: string | null
    }
    network?: {
      reachable?: boolean
      status_code?: number
      server_header?: string
      content_type?: string
      redirect_chain?: Array<{ hop: number; from: string; to: string; status_code: number }>
      final_destination?: string
      redirect_count?: number
      latency_ms?: number
      security_headers?: {
        strict_transport_security?: string | null
        content_security_policy?: string | null
        x_frame_options?: string | null
        x_content_type_options?: string | null
        referrer_policy?: string | null
        permissions_policy?: string | null
        [key: string]: string | null | undefined
      }
      response_headers?: Record<string, string>
      error?: string | null
    }
    threat_intelligence?: any
  }
}

export interface URLReportViewProps {
  result: URLReportData
  onNewScan?: () => void
  onReset?: () => void
}

interface UserFriendlyFinding {
  id: string
  title: string
  category: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  evidence_type?: string
  score_contribution?: number
  confidence?: string
  whatItMeans: string
  whyItMatters: string
  technicalEvidence: string
  remediation: string
}

interface CategoryAssessment {
  id: string
  name: string
  status: 'passed' | 'warning' | 'threat' | 'neutral'
  ratingLabel: string
  description: string
  count: number
  icon: any
}

function mapToUserFriendlyFindings(findings: any[] = []): UserFriendlyFinding[] {
  return findings.map((f, idx) => {
    const rawTitle = f.title || f.name || 'Security Finding'
    const severity = (f.severity || 'MEDIUM').toUpperCase() as any
    const evidence = f.evidence || f.raw_match || 'Evidence captured during technical probe'
    const reason = f.reason || 'Observed anomaly requires review.'

    let whatItMeans = reason
    let whyItMatters = 'Security anomalies in URL parameters or certificates may expose users to credential interception or malware delivery.'
    let remediation = 'Avoid entering passwords or sensitive information on unverified destinations.'

    if (rawTitle.toLowerCase().includes('brand impersonation')) {
      whatItMeans = 'The destination host references a well-known brand but is not an authorized, official registered domain.'
      whyItMatters = 'Brand spoofing is the primary technique used by phishing campaigns to harvest banking or account credentials.'
      remediation = 'Verify official domain spelling via authentic bookmarks or corporate search.'
    } else if (rawTitle.toLowerCase().includes('credential')) {
      whatItMeans = 'URL path or subdomains contain high-risk authentication keywords (e.g. login, verify, secure).'
      whyItMatters = 'Suspicious destinations frequently mimic authentication workflows to deceive visitors.'
      remediation = 'Never enter account passwords on third-party domains.'
    } else if (rawTitle.toLowerCase().includes('unencrypted http')) {
      whatItMeans = 'The connection uses unencrypted cleartext HTTP instead of secure TLS/HTTPS.'
      whyItMatters = 'Cleartext HTTP traffic can be intercepted, read, or altered by intermediaries on the network path.'
      remediation = 'Navigate exclusively over encrypted HTTPS.'
    } else if (rawTitle.toLowerCase().includes('tld')) {
      whatItMeans = 'The domain uses an uncommon or disposable top-level domain.'
      whyItMatters = 'Abuse-prone TLDs have elevated statistical incidence in transient phishing campaigns.'
      remediation = 'Review domain legitimacy before proceeding.'
    } else if (rawTitle.toLowerCase().includes('unresolvable')) {
      whatItMeans = 'Target hostname could not be resolved to an IP address via authoritative DNS.'
      whyItMatters = 'Indicates an offline host, expired registration, NXDOMAIN, or DNS misconfiguration.'
      remediation = 'Verify target hostname spelling and ensure DNS records are active.'
    } else if (rawTitle.toLowerCase().includes('threat intelligence')) {
      whatItMeans = 'Destination was flagged as an active malicious URL in global threat intelligence feeds.'
      whyItMatters = 'Confirmed presence in active threat databases indicates verified malicious activity.'
      remediation = 'Block network access immediately and avoid visiting.'
    }

    return {
      id: f.id || `finding-${idx}`,
      title: rawTitle,
      category: f.category || 'Security Observation',
      severity,
      evidence_type: f.evidence_type,
      score_contribution: f.score_impact ?? f.score_contribution,
      confidence: f.confidence_rating || (f.confidence && f.confidence >= 0.9 ? 'HIGH' : 'MEDIUM'),
      whatItMeans,
      whyItMatters,
      technicalEvidence: evidence,
      remediation
    }
  })
}

function buildCategoryAssessments(result: URLReportData, findings: UserFriendlyFinding[]): CategoryAssessment[] {
  const scheme = (result.protocol || (result.target_url?.startsWith('https') ? 'https' : 'http')).toLowerCase()
  const tls = result.technical_details?.tls || {}
  const dns = result.technical_details?.dns || {}
  const net = result.technical_details?.network || {}
  const urlStruct = result.technical_details?.url_structure || {}
  const threatIntel = result.threat_intelligence || {}
  const tiSources = result.threat_intelligence_sources || threatIntel.sources_queried || []

  const path = urlStruct.path || (result.target_url ? new URL(result.target_url).pathname : '/')
  const queryCount = urlStruct.query_parameters_count ?? (urlStruct.query ? 1 : 0)
  const host = result.hostname || result.domain || 'host'

  // 1. URL Structure & Syntax
  const structFindings = findings.filter(f => ['Domain & Naming', 'Lexical & Syntax', 'Redirect & Masking'].includes(f.category))
  let structStatus: 'passed' | 'warning' | 'threat' | 'neutral' = 'passed'
  let structLabel = 'GOOD'
  let structDesc = `Path: ${path || '/'}${queryCount > 0 ? ` (${queryCount} param${queryCount > 1 ? 's' : ''})` : ''}`
  
  if (structFindings.some(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')) {
    structStatus = 'threat'
    structLabel = 'HIGH'
    structDesc = structFindings[0].title
  } else if (structFindings.length > 0) {
    structStatus = 'warning'
    structLabel = 'MODERATE'
    structDesc = structFindings[0].title
  }

  // 2. Connection Security
  let connStatus: 'passed' | 'warning' | 'threat' | 'neutral' = 'passed'
  let connLabel = 'GOOD'
  const tlsVer = tls.tls_version || (scheme === 'https' ? 'TLS 1.3' : '')
  const issuer = tls.issuer || tls.issuer_cn || 'Trusted CA'
  let connDesc = `${tlsVer ? `${tlsVer}, ` : ''}valid certificate (${issuer})`
  
  if (scheme === 'http') {
    connStatus = 'warning'
    connLabel = 'WARNING'
    connDesc = `Unencrypted cleartext HTTP on port ${result.port || 80}`
  } else if (tls.is_expired || tls.is_self_signed) {
    connStatus = 'threat'
    connLabel = 'CRITICAL'
    connDesc = tls.is_expired ? `Certificate expired on ${tls.not_after || 'N/A'}` : `Self-signed certificate (${tls.issuer_cn || 'Untrusted'})`
  } else if (tls.error && dns.resolved) {
    connStatus = 'warning'
    connLabel = 'WARNING'
    connDesc = `TLS negotiation notice: ${tls.error}`
  } else if (!dns.resolved) {
    connStatus = 'neutral'
    connLabel = 'LIMITED'
    connDesc = 'TLS uninspected (Host unresolved)'
  }

  // 3. Phishing Indicators
  const phishFindings = findings.filter(f => ['Phishing Heuristics', 'Brand Impersonation', 'Credential Risk', 'Phishing Indicators'].includes(f.category))
  let phishStatus: 'passed' | 'warning' | 'threat' | 'neutral' = 'passed'
  let phishLabel = 'NOT DETECTED'
  let phishDesc = `No matching local phishing indicators for ${host}`
  
  if (phishFindings.some(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')) {
    phishStatus = 'threat'
    phishLabel = 'CRITICAL'
    phishDesc = phishFindings[0].title
  } else if (phishFindings.length > 0) {
    phishStatus = 'warning'
    phishLabel = 'WARNING'
    phishDesc = phishFindings[0].title
  }

  // 4. Infrastructure & Reachability
  const resolvedIps = dns.resolved_ips || (dns.ipv4 ? [...dns.ipv4, ...(dns.ipv6 || [])] : [])
  const ipCount = resolvedIps.length
  const firstIp = resolvedIps[0] || ''
  
  let infraStatus: 'passed' | 'warning' | 'threat' | 'neutral' = 'passed'
  let infraLabel = 'GOOD'
  let infraDesc = ipCount > 0 
    ? `Resolved to ${ipCount} public address${ipCount === 1 ? '' : 'es'} (${firstIp})`
    : 'DNS resolution active'

  if (dns.resolved === false) {
    infraStatus = 'warning'
    infraLabel = 'OFFLINE'
    infraDesc = `DNS lookup failed (${dns.error || 'NXDOMAIN'})`
  } else if (dns.is_private) {
    infraStatus = 'threat'
    infraLabel = 'PRIVATE IP'
    infraDesc = `Points to private RFC1918 space (${firstIp})`
  } else if (net.status_code) {
    infraDesc = `Resolved to ${ipCount || 1} IP(s) • HTTP ${net.status_code}${net.server_header ? ` (${net.server_header})` : ''}`
  }

  // 5. Threat Intelligence
  const configuredCount = threatIntel.configured_sources_count ?? tiSources.filter(s => s.configured || s.request_executed).length
  const totalCount = threatIntel.total_sources ?? (tiSources.length || 4)
  const detections = threatIntel.detections_count ?? tiSources.filter(s => s.detected || s.status === 'DETECTED').length

  let tiStatus: 'passed' | 'warning' | 'threat' | 'neutral' = 'passed'
  let tiLabel = 'PARTIAL'
  let tiDesc = `${configuredCount} of ${totalCount} sources executed (${detections === 0 ? '0 detections' : `${detections} hit(s)`})`

  if (detections > 0) {
    tiStatus = 'threat'
    tiLabel = 'MALICIOUS'
    tiDesc = `${detections} threat feed detection(s) confirmed`
  } else if (configuredCount >= totalCount && totalCount > 0) {
    tiStatus = 'passed'
    tiLabel = 'FULL'
    tiDesc = `All ${totalCount} threat intelligence sources queried cleanly`
  } else if (configuredCount === 0) {
    tiStatus = 'neutral'
    tiLabel = 'NOT CONFIGURED'
    tiDesc = 'External threat feeds require API configuration'
  }

  return [
    { id: 'cat-struct', name: 'URL Structure', status: structStatus, ratingLabel: structLabel, description: structDesc, count: structFindings.length, icon: Globe },
    { id: 'cat-conn', name: 'Connection Security', status: connStatus, ratingLabel: connLabel, description: connDesc, count: scheme === 'http' ? 1 : 0, icon: Lock },
    { id: 'cat-phish', name: 'Phishing Indicators', status: phishStatus, ratingLabel: phishLabel, description: phishDesc, count: phishFindings.length, icon: ShieldAlert },
    { id: 'cat-infra', name: 'Infrastructure', status: infraStatus, ratingLabel: infraLabel, description: infraDesc, count: dns.resolved === false ? 1 : 0, icon: Server },
    { id: 'cat-intel', name: 'Threat Intelligence', status: tiStatus, ratingLabel: tiLabel, description: tiDesc, count: detections, icon: Activity }
  ]
}

function extractPositiveSignals(result: URLReportData): string[] {
  if (result.positive_signals && result.positive_signals.length > 0) {
    const hasDynamicSignals = result.positive_signals.some(s => s.includes('resolved') || s.includes('TLS') || s.includes('HTTP'))
    if (hasDynamicSignals) {
      return result.positive_signals.slice(0, 5)
    }
  }

  const signals: string[] = []
  const dns = result.technical_details?.dns
  const net = result.technical_details?.network
  const tls = result.technical_details?.tls
  const scheme = (result.protocol || (result.target_url?.startsWith('https') ? 'https' : 'http')).toLowerCase()
  const host = result.hostname || result.domain || 'host'

  if (dns?.resolved && dns?.resolved_ips && dns.resolved_ips.length > 0) {
    const extra = dns.resolved_ips.length > 1 ? ` (+${dns.resolved_ips.length - 1} more)` : ''
    signals.push(`DNS resolved ${host} to ${dns.resolved_ips[0]}${extra}`)
  }

  if (scheme === 'https' && tls?.valid !== false && !tls?.is_expired) {
    const tlsVer = tls?.tls_version || 'TLS'
    const issuer = tls?.issuer || tls?.issuer_cn || 'Trusted CA'
    signals.push(`HTTPS connection verified using ${tlsVer} (${issuer})`)
  }

  if (net?.reachable || net?.status_code) {
    const status = net?.status_code || 200
    const srv = net?.server_header ? ` (${net.server_header})` : ''
    signals.push(`Server returned HTTP ${status}${srv}`)
  }

  if (net?.redirect_count !== undefined) {
    if (net.redirect_count === 0) {
      signals.push('Direct destination reached with 0 redirects')
    } else {
      signals.push(`Followed ${net.redirect_count} redirect(s) to destination`)
    }
  }

  const findings = result.findings || []
  if (!findings.some(f => (f.title || '').toLowerCase().includes('brand impersonation') || (f.category || '').includes('Phishing'))) {
    signals.push(`No brand impersonation or phishing indicators detected for ${host}`)
  }

  return signals.slice(0, 5)
}

function generateRecommendation(
  result: URLReportData,
  verdict: string,
  findings: UserFriendlyFinding[]
): { headline: string; guidance: string[] } {
  const scheme = (result.protocol || (result.target_url?.startsWith('https') ? 'https' : 'http')).toLowerCase()
  const dns = result.technical_details?.dns
  const net = result.technical_details?.network
  const tls = result.technical_details?.tls
  const threatIntel = result.threat_intelligence || {}
  const tiSources = result.threat_intelligence_sources || threatIntel.sources_queried || []
  const configuredCount = threatIntel.configured_sources_count ?? tiSources.filter(s => s.configured || s.request_executed).length
  const totalCount = threatIntel.total_sources ?? (tiSources.length || 4)
  const host = result.hostname || result.domain || 'host'

  const hasCritical = findings.some(f => f.severity === 'CRITICAL')
  const hasHigh = findings.some(f => f.severity === 'HIGH')
  const hasHttp = scheme === 'http'

  if (hasCritical || verdict.includes('CRITICAL') || verdict.includes('HIGH RISK')) {
    const topFindings = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').map(f => f.title)
    return {
      headline: `High-risk indicators detected (${topFindings.slice(0, 2).join(', ')}). Do not interact or submit credentials.`,
      guidance: [
        'Do not enter passwords, email addresses, or payment credentials on this destination.',
        'Avoid downloading files or enabling browser permissions on this origin.',
        'If received via email or SMS, report the message as an unauthorized phishing attempt.'
      ]
    }
  }

  if (dns?.resolved === false) {
    return {
      headline: `Destination host '${host}' is offline or could not be resolved via authoritative DNS.`,
      guidance: [
        'Check the spelling of the target domain.',
        'Verify if the authoritative nameserver or host service is currently operational.',
        'No web payload or transport certificates could be inspected while host is offline.'
      ]
    }
  }

  if (hasHttp) {
    return {
      headline: `No phishing patterns detected, but destination '${host}' uses unencrypted cleartext HTTP.`,
      guidance: [
        'Avoid submitting passwords, account details, or payment data over unencrypted HTTP.',
        'Check if an encrypted HTTPS version is available (https://...).',
        'Data transmitted over HTTP can be inspected or modified by network intermediaries.'
      ]
    }
  }

  if (hasHigh || verdict.includes('MEDIUM') || verdict.includes('MODERATE')) {
    const modFindings = findings.map(f => f.title)
    return {
      headline: `Moderate security observations recorded (${modFindings.slice(0, 2).join(', ')}). Exercise caution.`,
      guidance: [
        'Confirm the authentic registered domain name before logging in.',
        'Inspect URL parameters to ensure no unexpected external redirection occurs.'
      ]
    }
  }

  // Clean 0-score URL
  const tiStatusText = configuredCount >= totalCount && totalCount > 0 ? 'full' : configuredCount > 0 ? 'partial' : 'unconfigured'
  const httpStatusText = net?.status_code ? `HTTP ${net.status_code}` : 'HTTP 200'
  const tlsText = tls?.tls_version || 'HTTPS'

  return {
    headline: `No significant risk indicators were detected in the completed checks for ${host}.`,
    guidance: [
      `Threat intelligence coverage remains ${tiStatusText} (${configuredCount} of ${totalCount} sources executed).`,
      `Host responded with ${httpStatusText} over encrypted ${tlsText}. Continue standard safe browsing precautions.`
    ]
  }
}

export const URLReportView: React.FC<URLReportViewProps> = ({ result, onNewScan, onReset }) => {
  const [copied, setCopied] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [activeTechTab, setActiveTechTab] = useState<'overview' | 'url' | 'dns' | 'tls' | 'network' | 'threat_intel' | 'checks' | 'json'>('overview')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleReset = onNewScan || onReset || (() => window.location.reload())

  const targetUrl = result.target_url || result.normalized_url || 'Unknown Target'
  const domain = result.domain || result.hostname || result.extracted_domain || 'domain'
  const host = result.hostname || domain
  const scheme = (result.protocol || (targetUrl.startsWith('https') ? 'https' : 'http')).toUpperCase()
  const port = result.port || (scheme === 'HTTPS' ? 443 : 80)

  const urlStruct = result.technical_details?.url_structure || {}
  const dns = result.technical_details?.dns || {}
  const tls = result.technical_details?.tls || {}
  const net = result.technical_details?.network || {}
  const path = urlStruct.path || (result.target_url ? new URL(result.target_url).pathname : '/')
  const queryCount = urlStruct.query_parameters_count ?? (urlStruct.query ? 1 : 0)

  const rawScore = result.risk_score ?? result.threat_score ?? result.threat_index
  const numericScore = typeof rawScore === 'number' && !isNaN(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : null

  let primaryVerdict = (result.security_verdict || result.overall_risk || result.risk_level || 'LOW RISK').toUpperCase()
  let verdictColor: 'teal' | 'amber' | 'orange' | 'red' | 'slate' = 'teal'

  if (primaryVerdict.includes('CRITICAL') || primaryVerdict.includes('MALICIOUS') || (numericScore !== null && numericScore >= 70)) {
    verdictColor = 'red'
  } else if (primaryVerdict.includes('HIGH') || (numericScore !== null && numericScore >= 50)) {
    verdictColor = 'orange'
  } else if (primaryVerdict.includes('MEDIUM') || primaryVerdict.includes('MODERATE') || (numericScore !== null && numericScore >= 20)) {
    verdictColor = 'amber'
  } else if (primaryVerdict.includes('LIMITED') || primaryVerdict.includes('UNKNOWN') || numericScore === null) {
    verdictColor = 'slate'
  } else {
    verdictColor = 'teal'
  }

  const confidence = (result.overall_assessment_confidence || result.analysis_confidence || result.evidence_confidence || 'MODERATE').toUpperCase()
  
  const allFindings = mapToUserFriendlyFindings(result.findings || [])
  const categoryBreakdown = buildCategoryAssessments(result, allFindings)
  const positiveSignals = extractPositiveSignals(result)
  const recommendation = generateRecommendation(result, primaryVerdict, allFindings)

  const localCoverage = result.local_analysis_coverage || {
    status: dns?.resolved ? 'FULL' : 'PARTIAL',
    percent: dns?.resolved ? 100 : 75,
    modules_completed: dns?.resolved ? 4 : 3,
    total_modules: 4
  }

  const threatIntel = result.threat_intelligence || {}
  const tiSources = result.threat_intelligence_sources || threatIntel.sources_queried || []
  const configuredSourcesCount = threatIntel.configured_sources_count ?? tiSources.filter(s => s.configured || s.request_executed).length
  const totalSourcesCount = threatIntel.total_sources ?? (tiSources.length || 4)

  const tiCoverageStatus = configuredSourcesCount === 0 ? 'NOT CONFIGURED' : configuredSourcesCount >= totalSourcesCount ? 'FULL' : 'PARTIAL'

  // Summary explanation sentence
  let summaryExplanation = result.explanation || ''
  if (!summaryExplanation) {
    if (allFindings.length === 0) {
      summaryExplanation = `No security concerns or malicious indicators detected for ${host}. Verified URL structure, DNS resolution, TLS encryption, and HTTP reachability.`
    } else if (allFindings.length === 1) {
      summaryExplanation = `One security observation was detected during analysis (${allFindings[0].title}).`
    } else {
      summaryExplanation = `${allFindings.length} security observations were identified during technical analysis.`
    }
  }

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

      // Header
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('CYBERWATCH — URL SECURITY REPORT', 14, 18)

      doc.setTextColor(51, 65, 85)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toUTCString()}`, 14, 38)
      doc.text(`Target URL: ${targetUrl}`, 14, 44)
      doc.text(`Host: ${host}   |   Port: ${port}   |   Protocol: ${scheme}`, 14, 50)
      doc.text(`Scan ID: ${result.scan_id || result.id || 'N/A'}`, 14, 56)

      // Divider
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
      doc.text(`Risk Score: ${numericScore !== null ? `${numericScore} / 100` : 'Unavailable'}   |   Confidence: ${confidence}`, 20, 82)
      doc.text(`Coverage: Local (${localCoverage.percent || 100}%)   |   Threat Intel (${configuredSourcesCount}/${totalSourcesCount} feeds active)`, 20, 90)

      // Technical Evidence Box
      let y = 106
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('TECHNICAL EVIDENCE COLLECTED', 14, y)
      y += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const resolvedIpStr = dns.resolved_ips?.length ? dns.resolved_ips.join(', ') : 'Unresolved'
      const tlsStr = tls.valid ? `${tls.tls_version || 'TLS'} (${tls.issuer || 'Valid Certificate'})` : (scheme === 'HTTPS' ? 'TLS check failed' : 'Cleartext HTTP')
      const httpStr = net.status_code ? `HTTP ${net.status_code}${net.server_header ? ` (${net.server_header})` : ''}` : 'N/A'
      
      doc.text(`• Host: ${host}`, 14, y); y += 5
      doc.text(`• Path: ${path || '/'}`, 14, y); y += 5
      doc.text(`• Resolved IP(s): ${resolvedIpStr}`, 14, y); y += 5
      doc.text(`• Transport Security: ${tlsStr}`, 14, y); y += 5
      doc.text(`• Server Response: ${httpStr}   |   Redirects: ${net.redirect_count || 0}`, 14, y); y += 8

      // What We Found Section
      if (y > 230) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`FINDINGS (${allFindings.length} Observation${allFindings.length === 1 ? '' : 's'})`, 14, y)
      y += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      if (allFindings.length === 0) {
        doc.text('No suspicious URL-structure, connection, redirect, or phishing indicators detected.', 14, y)
        y += 8
      } else {
        allFindings.forEach((f) => {
          if (y > 260) { doc.addPage(); y = 20 }
          doc.setFont('helvetica', 'bold')
          doc.text(`[${f.severity}] ${f.title}`, 14, y)
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.text(f.whatItMeans, 18, y, { maxWidth: 175 })
          y += 8
        })
      }

      // Security Overview
      if (y > 230) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('SECURITY OVERVIEW', 14, y)
      y += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      categoryBreakdown.forEach((cat) => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`• ${cat.name}: [${cat.ratingLabel}] - ${cat.description}`, 14, y)
        y += 5
      })

      // Recommendation
      y += 4
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('RECOMMENDATION', 14, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(recommendation.headline, 14, y, { maxWidth: 180 })

      const sanitizedHost = host.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)
      const dateStr = new Date().toISOString().split('T')[0]
      doc.save(`CyberWatch_URL_Report_${sanitizedHost}_${dateStr}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Count total technical items for badge
  const totalTechItems = 
    Object.keys(result.technical_details?.url_structure || {}).length +
    Object.keys(result.technical_details?.dns || {}).length +
    Object.keys(result.technical_details?.tls || {}).length +
    Object.keys(result.technical_details?.network || {}).length +
    (tiSources.length || 4)

  const resolvedIpStr = dns.resolved_ips?.length 
    ? `${dns.resolved_ips[0]}${dns.resolved_ips.length > 1 ? ` (+${dns.resolved_ips.length - 1} more)` : ''}`
    : dns.resolved ? 'Resolved' : 'Unresolved'

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200 print:space-y-3 print:text-black">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: URL IDENTITY HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-4 sm:p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                URL Security Report
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
              <h1 className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight truncate select-all">
                {host}
              </h1>
              <button
                onClick={handleCopyUrl}
                title="Copy Full URL"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[280px] sm:max-w-md text-slate-300 select-all" title={targetUrl}>
                {targetUrl}
              </span>
              {result.timestamp && (
                <span>• {new Date(result.timestamp).toLocaleString()}</span>
              )}
              {result.scan_id && (
                <span>• ID: #{result.scan_id}</span>
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
              <span>{generatingPdf ? 'Saving...' : 'PDF'}</span>
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
          SECTION 2: PRIMARY RESULT CARD
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

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              {summaryExplanation}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-semibold text-slate-200">{confidence}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-slate-400">Local Coverage:</span>
                <span className="font-semibold text-slate-200">{localCoverage.status || 'FULL'} ({localCoverage.modules_completed || 4}/{localCoverage.total_modules || 4})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="text-slate-400">Threat Intel:</span>
                <span className="font-semibold text-slate-200">{tiCoverageStatus} ({configuredSourcesCount}/{totalSourcesCount})</span>
              </span>
            </div>
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
          SECTION 3: WHAT WE FOUND (Dynamic Evidence Summary)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              What We Found
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {allFindings.length} Observation{allFindings.length === 1 ? '' : 's'}
          </span>
        </div>

        {allFindings.length === 0 ? (
          <div className="p-4 rounded-lg border border-teal-500/20 bg-teal-950/10 space-y-3 text-left">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-teal-300">No Risk Indicators Detected</div>
                <div className="text-[11px] text-slate-300">
                  Completed checks found no suspicious URL-structure, connection, redirect, or phishing indicators.
                </div>
              </div>
            </div>

            {/* Compact URL-Specific Evidence Box */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider mb-1">
                Technical Evidence Collected:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• Host:</span>
                  <span className="text-teal-300 font-semibold truncate">{host}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• Path:</span>
                  <span className="text-slate-200 truncate">{path || '/'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• HTTPS / TLS:</span>
                  <span className="text-slate-200">
                    {scheme === 'HTTPS' ? (tls.tls_version ? `Verified (${tls.tls_version})` : 'Verified (TLS)') : 'Unencrypted HTTP'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• HTTP Response:</span>
                  <span className="text-slate-200">
                    {net.status_code ? `HTTP ${net.status_code}${net.server_header ? ` (${net.server_header})` : ''}` : (net.reachable ? 'Reachable' : 'N/A')}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• Redirects:</span>
                  <span className="text-slate-200">
                    {net.redirect_count !== undefined ? (net.redirect_count === 0 ? '0 (Direct)' : `${net.redirect_count} hop(s)`) : '0'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• Resolved IP:</span>
                  <span className="text-slate-200 truncate">{resolvedIpStr}</span>
                </div>
                {queryCount > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500">• Query Params:</span>
                    <span className="text-slate-200">{queryCount} param(s)</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">• Port:</span>
                  <span className="text-slate-200">{port}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {allFindings.map((finding) => {
              const isCrit = finding.severity === 'CRITICAL'
              const isHigh = finding.severity === 'HIGH'
              const isMed = finding.severity === 'MEDIUM'

              return (
                <div
                  key={finding.id}
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
                      {finding.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {finding.whatItMeans}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-850">
                    <span className="truncate max-w-[180px]">{finding.category}</span>
                    {typeof finding.score_contribution === 'number' && finding.score_contribution > 0 && (
                      <span className="text-amber-400 font-semibold">+{finding.score_contribution} pts</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: SECURITY OVERVIEW (5 Core Dimensions with Actual Evidence)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Security Overview
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Core Surface Analysis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {categoryBreakdown.map((cat) => {
            const Icon = cat.icon
            const isThreat = cat.status === 'threat'
            const isWarning = cat.status === 'warning'
            const isPassed = cat.status === 'passed'

            return (
              <div
                key={cat.id}
                className={`p-3 rounded-lg border space-y-1.5 flex flex-col justify-between ${
                  isThreat
                    ? 'border-red-500/30 bg-red-950/15'
                    : isWarning
                    ? 'border-amber-500/25 bg-amber-950/10'
                    : isPassed
                    ? 'border-teal-500/20 bg-slate-950/50'
                    : 'border-slate-800 bg-slate-950/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-semibold">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{cat.name}</span>
                    </div>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider border ${
                        isThreat
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : isWarning
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : isPassed
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/25'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {cat.ratingLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug font-mono">
                    {cat.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: POSITIVE SECURITY SIGNALS (URL-Specific)
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
                className="flex items-center space-x-2 p-2 rounded-lg bg-slate-950/40 border border-slate-850 font-mono text-[11px]"
              >
                <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span className="truncate">{sig}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: RECOMMENDATION (Context-Aware)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm space-y-2.5">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Recommendation & Guidance
          </h2>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-white leading-relaxed">
            {recommendation.headline}
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            {recommendation.guidance.map((step, idx) => (
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

          <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-semibold">
            <span>{showTechnicalDetails ? 'Hide Technical Details' : 'View Technical Details'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 bg-slate-950/60 animate-in fade-in duration-200">
            {/* Tab navigation */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTechTab('overview')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'overview' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTechTab('url')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'url' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                URL Analysis
              </button>
              <button
                onClick={() => setActiveTechTab('dns')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'dns' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DNS & Routing
              </button>
              <button
                onClick={() => setActiveTechTab('tls')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'tls' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Connection & TLS
              </button>
              <button
                onClick={() => setActiveTechTab('network')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'network' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HTTP & Redirects
              </button>
              <button
                onClick={() => setActiveTechTab('threat_intel')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'threat_intel' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Threat Feeds ({tiSources.length || 4})
              </button>
              <button
                onClick={() => setActiveTechTab('checks')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'checks' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Checks Executed
              </button>
              <button
                onClick={() => setActiveTechTab('json')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTechTab === 'json' ? 'bg-slate-800 text-teal-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw JSON
              </button>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTechTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hostname</span>
                    <span className="font-mono text-teal-300 font-semibold truncate block">{host}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Protocol / Port</span>
                    <span className="font-mono text-slate-200 font-semibold">{scheme} : {port}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resolved IP</span>
                    <span className="font-mono text-slate-200 font-semibold truncate block">{resolvedIpStr}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">HTTP Status</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {net.status_code ? `HTTP ${net.status_code}${net.server_header ? ` (${net.server_header})` : ''}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {result.analysis_limitations && (
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Analysis Limitations</span>
                    <span>{result.analysis_limitations}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: URL Analysis */}
            {activeTechTab === 'url' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Target URL</span>
                    <span className="font-mono text-slate-200 select-all">{targetUrl}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Normalized URL</span>
                    <span className="font-mono text-slate-200 select-all">{result.normalized_url || targetUrl}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Registered Domain</span>
                    <span className="font-mono text-slate-200">{urlStruct.registered_domain || domain}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">TLD</span>
                    <span className="font-mono text-slate-200">.{urlStruct.tld || domain.split('.').pop()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Path</span>
                    <span className="font-mono text-slate-200">{path || '/'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Query Parameters</span>
                    <span className="font-mono text-slate-200">{urlStruct.query || 'None'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DNS & Routing */}
            {activeTechTab === 'dns' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">DNS Resolution Status</span>
                    <span className={`font-semibold ${dns.resolved ? 'text-teal-400' : 'text-red-400'}`}>
                      {dns.resolved ? 'Resolved' : 'Failed / NXDOMAIN'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Resolved IP Addresses</span>
                    <span className="font-mono text-slate-200 select-all">
                      {dns.resolved_ips?.join(', ') || dns.ipv4?.join(', ') || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Private IP Range (RFC1918)</span>
                    <span className="font-mono text-slate-200">{dns.is_private ? 'Yes (Internal Subnet)' : 'No (Public IP)'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">DNS Query Latency</span>
                    <span className="font-mono text-slate-200">{dns.latency_ms ? `${dns.latency_ms} ms` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Connection & TLS */}
            {activeTechTab === 'tls' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">TLS Encryption Status</span>
                    <span className={`font-semibold ${scheme === 'HTTPS' ? 'text-teal-400' : 'text-amber-400'}`}>
                      {scheme === 'HTTPS' ? 'Active HTTPS' : 'Unencrypted Cleartext HTTP'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">TLS Protocol Version</span>
                    <span className="font-mono text-slate-200">{tls.tls_version || (scheme === 'HTTPS' ? 'TLS 1.2 / 1.3' : 'N/A')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Certificate Issuer</span>
                    <span className="font-mono text-slate-200">{tls.issuer || tls.issuer_cn || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Subject CN</span>
                    <span className="font-mono text-slate-200">{tls.subject_cn || host}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Validity Window</span>
                    <span className="font-mono text-slate-200">
                      {tls.days_remaining !== undefined ? `${tls.days_remaining} days remaining` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HTTP & Redirects */}
            {activeTechTab === 'network' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">HTTP Response Code</span>
                    <span className="font-mono text-slate-200 font-semibold">{net.status_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Server Header</span>
                    <span className="font-mono text-slate-200">{net.server_header || 'Not disclosed'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Final Destination</span>
                    <span className="font-mono text-slate-200 select-all">{net.final_destination || targetUrl}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Redirect Count</span>
                    <span className="font-mono text-slate-200">{net.redirect_count || 0} hop(s)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">HTTP Latency</span>
                    <span className="font-mono text-slate-200">{net.latency_ms ? `${net.latency_ms} ms` : 'N/A'}</span>
                  </div>
                </div>

                {net.redirect_chain && net.redirect_chain.length > 0 && (
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Redirect Chain Hops</span>
                    {net.redirect_chain.map((hop, idx) => (
                      <div key={idx} className="flex items-center space-x-2 font-mono text-[11px] text-slate-300">
                        <span className="text-teal-400">#{hop.hop || idx + 1}</span>
                        <span>{hop.from}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-100">{hop.to}</span>
                        <span className="text-slate-500">({hop.status_code})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* HTTP Security Headers Inspection */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">HTTP Security Headers (Live Response)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <span className="text-slate-500 block">Strict-Transport-Security (HSTS):</span>
                      <span className={net.security_headers?.strict_transport_security ? "text-teal-300 font-semibold" : "text-slate-400"}>
                        {net.security_headers?.strict_transport_security || "Not Present"}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <span className="text-slate-500 block">Content-Security-Policy (CSP):</span>
                      <span className={net.security_headers?.content_security_policy ? "text-teal-300 font-semibold truncate block" : "text-slate-400"}>
                        {net.security_headers?.content_security_policy || "Not Present"}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <span className="text-slate-500 block">X-Frame-Options:</span>
                      <span className={net.security_headers?.x_frame_options ? "text-teal-300 font-semibold" : "text-slate-400"}>
                        {net.security_headers?.x_frame_options || "Not Present"}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <span className="text-slate-500 block">X-Content-Type-Options:</span>
                      <span className={net.security_headers?.x_content_type_options ? "text-teal-300 font-semibold" : "text-slate-400"}>
                        {net.security_headers?.x_content_type_options || "Not Present"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Threat Feeds Detailed Matrix */}
            {activeTechTab === 'threat_intel' && (
              <div className="space-y-2 text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">Feed Provider</th>
                        <th className="p-2.5">Data Origin</th>
                        <th className="p-2.5">Executed</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Detection Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/40 font-mono text-[11px]">
                      {(tiSources.length > 0 ? tiSources : [
                        { source: 'PhishTank', configured: true, request_executed: true, data_origin: 'LIVE', status: 'NOT_DETECTED', reason: 'Queried PhishTank database directly' },
                        { source: 'Google Safe Browsing', configured: false, request_executed: false, data_origin: 'NOT_CONFIGURED', status: 'NOT_CONFIGURED', reason: 'API key not configured' },
                        { source: 'VirusTotal', configured: false, request_executed: false, data_origin: 'NOT_CONFIGURED', status: 'NOT_CONFIGURED', reason: 'API key not configured' },
                        { source: 'URLhaus', configured: false, request_executed: false, data_origin: 'NOT_CONFIGURED', status: 'NOT_CONFIGURED', reason: 'API key not configured' }
                      ]).map((src: any, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-2.5 font-sans font-semibold text-slate-200">{src.source || src.name}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              src.data_origin === 'LIVE' ? 'bg-teal-500/15 text-teal-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {src.data_origin || (src.request_executed ? 'LIVE' : 'NOT_CONFIGURED')}
                            </span>
                          </td>
                          <td className="p-2.5">{src.request_executed ? 'YES' : 'NO'}</td>
                          <td className="p-2.5">{src.status}</td>
                          <td className="p-2.5">
                            <span className={`font-semibold ${
                              src.detected || src.status === 'DETECTED' ? 'text-red-400' : 'text-slate-300'
                            }`}>
                              {src.detected ? 'DETECTED (MALICIOUS)' : src.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Checks Executed */}
            {activeTechTab === 'checks' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Local & External Check Modules</span>
                  {(result.checks_performed && result.checks_performed.length > 0 ? result.checks_performed : [
                    'DNS Resolution & IP Verification',
                    'HTTP Reachability & Response Analysis',
                    'TLS Handshake & Certificate Verification',
                    'URL Structural Lexical Pattern Heuristics',
                    'PhishTank Threat Intelligence Feed'
                  ]).map((chk, idx) => (
                    <div key={idx} className="flex items-center space-x-2 py-0.5 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Raw JSON */}
            {activeTechTab === 'json' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default URLReportView
