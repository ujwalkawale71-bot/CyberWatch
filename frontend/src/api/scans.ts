import type { WebsiteScanResult } from '../types/websiteScanner'

const JWT_KEY = 'cyberwatch_jwt_token'

export const scansApi = {
  scanUrl: async (url: string): Promise<any> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/scan/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url })
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `URL scan failed with status ${res.status}`)
    }

    const json = await res.json()
    return json.data
  },

  scanWebsite: async (url: string): Promise<WebsiteScanResult> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/scans/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url })
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `Website scan failed with status ${res.status}`)
    }

    const json = await res.json()
    const { data } = json

    if (!data) {
      throw new Error('Malformed response: Backend returned an empty payload.')
    }

    const {
      risk_score = 0,
      risk_level = 'SAFE',
      confidence = 0.95,
      findings = [],
      security_headers = {},
      technology = [],
      external_resources = { scripts: 0, unique_domains: 0, css: 0, images: 0, iframes: 0, domains_list: [] },
      redirects = [],
      metadata = {}
    } = data || {}

    // Map findings by category to compute subScores
    const countCategory = (category: string) => (findings || []).filter((f: any) => f?.category === category).length

    const malwareCount = countCategory('Mixed Content') + countCategory('Suspicious Indicators')
    const phishingCount = countCategory('Phishing Indicators') + countCategory('Form Action')
    const headerCount = countCategory('Security Headers')

    const subScores = [
      { id: 'web-mal', label: 'Malware Score', score: Math.min(100, malwareCount * 35), maxScore: 100, severity: (malwareCount > 0 ? 'HIGH' : 'SAFE') as any },
      { id: 'web-phish', label: 'Phishing Score', score: Math.min(100, phishingCount * 40), maxScore: 100, severity: (phishingCount > 0 ? 'CRITICAL' : 'SAFE') as any },
      { id: 'web-rep', label: 'Reputation Score', score: Math.max(0, 100 - Math.round(risk_score)), maxScore: 100, severity: (risk_level || 'SAFE') as any },
      { id: 'web-content', label: 'Content Score', score: Math.min(100, (external_resources?.unique_domains ?? 0) * 10), maxScore: 100, severity: 'LOW' as any },
      { id: 'web-ssl', label: 'SSL Score', score: url?.toLowerCase()?.startsWith('https') ? 100 : 20, maxScore: 100, severity: (url?.toLowerCase()?.startsWith('https') ? 'SAFE' : 'CRITICAL') as any },
      { id: 'web-trend', label: 'Risk Trend', score: Math.round(risk_score), maxScore: 100, severity: (risk_level || 'SAFE') as any, trend: risk_score > 50 ? 'Increasing' : 'Stable' }
    ]

    let hostname = 'Resolving...'
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      hostname = parsed.hostname || url
    } catch {
      hostname = url || 'N/A'
    }

    const info = [
      { label: 'Domain', value: hostname },
      { label: 'Server Header', value: metadata?.server || 'N/A' },
      { label: 'Content Type', value: metadata?.content_type || 'text/html' },
      { label: 'Language', value: metadata?.language || 'en' },
      { label: 'Protocol', value: url?.toLowerCase()?.startsWith('https') ? 'HTTPS' : 'HTTP' },
      { label: 'HTML Title', value: metadata?.title || 'N/A' },
      { label: 'Canonical URL', value: metadata?.canonical || 'N/A' },
      { label: 'Redirects Count', value: String(Math.max(0, (redirects?.length ?? 1) - 1)) },
      { label: 'External Scripts', value: String(external_resources?.scripts ?? 0) },
      { label: 'External Domains', value: String(external_resources?.unique_domains ?? 0) }
    ]

    const aiChecks = (findings || []).map((f: any, idx: number) => ({
      id: `check-${idx}`,
      name: f?.title || 'Diagnostic Check',
      finding: f?.description || f?.evidence || 'No detailed info',
      severity: f?.severity === 'SAFE' ? 'SAFE' : (f?.severity || 'LOW')
    }))

    if (aiChecks.length === 0) {
      aiChecks.push({
        id: 'check-clean',
        name: 'All Diagnostic Checks',
        finding: 'No active website vulnerabilities detected',
        severity: 'SAFE'
      })
    }

    const radarData = [
      { subject: 'Malware', currentScore: Math.min(100, malwareCount * 30), baselineScore: 10 },
      { subject: 'Phishing', currentScore: Math.min(100, phishingCount * 40), baselineScore: 5 },
      { subject: 'Reputation', currentScore: Math.round(risk_score), baselineScore: 90 },
      { subject: 'Content', currentScore: Math.min(100, (external_resources?.unique_domains ?? 0) * 10), baselineScore: 15 },
      { subject: 'SSL Security', currentScore: url?.toLowerCase()?.startsWith('https') ? 10 : 90, baselineScore: 95 },
      { subject: 'Behavior', currentScore: headerCount > 4 ? 80 : 20, baselineScore: 12 }
    ]

    // Accurate threat intel representation (no fake watchlists)
    const intelMatches = [
      {
        id: 'intel-status',
        source: 'Threat Intelligence Feeds',
        matchValue: 'Live external threat intelligence feeds not yet configured',
        type: 'INFO',
        confidence: 0
      }
    ]

    const technologies = (technology || []).map((t: string) => {
      let category = 'Library'
      if (t === 'Cloudflare') category = 'CDN/Security'
      else if (t === 'WordPress') category = 'CMS'
      else if (t === 'Next.js') category = 'Web Framework'
      else if (t === 'Bootstrap' || t === 'Tailwind') category = 'CSS Framework'
      else if (t === 'React') category = 'Frontend Library'
      return { name: t, category }
    })

    if (technologies.length === 0) {
      technologies.push({ name: 'Standard Web Stack', category: 'Frontend' })
    }

    const securityHeaders = Object.keys(security_headers || {}).map((name) => ({
      name,
      status: security_headers[name]?.status || 'Missing'
    }))

    if (securityHeaders.length === 0) {
      const defaultHeaders = [
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy',
        'Permissions-Policy'
      ]
      defaultHeaders.forEach((name) => {
        securityHeaders.push({ name, status: 'Missing' })
      })
    }

    return {
      url,
      overallScore: Math.round(risk_score),
      severity: (risk_level || 'SAFE') as any,
      confidence: confidence || 0.95,
      scanTime: new Date().toISOString(),
      engine: 'CyberWatch Web Shield 1.0',
      warningMessage: findings.length > 0 ? `${findings.length} security findings identified during deep scan.` : 'All baseline security checks passed.',
      subScores,
      info,
      aiChecks,
      radarData,
      intelMatches,
      technologies,
      securityHeaders
    }
  },

  scanExtension: async (payload: ExtensionScanPayload): Promise<ExtensionScanResult> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch('http://127.0.0.1:8000/api/scans/extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch backend server on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 401 || res.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      throw new Error(data?.detail || `Extension scan failed with status ${res.status}`)
    }

    const json = await res.json()
    const { data } = json

    if (!data) {
      throw new Error('Malformed response: Backend returned an empty payload.')
    }

    // Map backend response to ExtensionScanResult for the UI
    const permFindings: PermissionAnalysisItem[] = [
      ...(data.permission_findings || []).map((f: any) => ({
        name: f.permission || '',
        description: f.reason || '',
        severity: (f.severity || 'LOW') as PermissionSeverity
      })),
      ...(data.host_findings || []).map((f: any) => ({
        name: f.permission || '',
        description: f.reason || '',
        severity: (f.severity || 'LOW') as PermissionSeverity
      }))
    ]

    const aiChecks: AICheckItem[] = [
      ...(data.combination_findings || []).map((f: any, idx: number) => ({
        id: `combo-${idx}`,
        name: `Dangerous Combination: ${(f.combination || []).join(' + ')}`,
        finding: f.reason || '',
        severity: (f.severity || 'HIGH') as PermissionSeverity
      })),
      ...(data.metadata_issues || []).map((msg: string, idx: number) => ({
        id: `meta-${idx}`,
        name: 'Metadata Issue',
        finding: msg,
        severity: 'LOW' as PermissionSeverity
      }))
    ]

    if (data.manifest_finding) {
      aiChecks.push({
        id: 'manifest-mv',
        name: data.manifest_finding.check || 'Manifest Version',
        finding: data.manifest_finding.reason || '',
        severity: (data.manifest_finding.severity || 'LOW') as PermissionSeverity
      })
    }

    if (aiChecks.length === 0) {
      aiChecks.push({
        id: 'check-clean',
        name: 'All Diagnostic Checks',
        finding: 'No dangerous permission combinations detected.',
        severity: 'SAFE' as PermissionSeverity
      })
    }

    const score = data.risk_score ?? 0
    const riskLevel = (data.risk_level || 'SAFE') as PermissionSeverity

    const permScore = Math.min(100, (data.permission_findings || []).reduce((sum: number, f: any) => {
      const weights: Record<string, number> = { CRITICAL: 30, HIGH: 20, MEDIUM: 12, LOW: 5 }
      return sum + (weights[f.severity] || 5)
    }, 0))

    const hostScore = Math.min(100, (data.host_findings || []).reduce((sum: number, f: any) => {
      const weights: Record<string, number> = { CRITICAL: 30, HIGH: 20, MEDIUM: 12, LOW: 5 }
      return sum + (weights[f.severity] || 5)
    }, 0))

    const comboScore = Math.min(100, (data.combination_findings || []).reduce((sum: number, f: any) => {
      return sum + (f.extra_score || 0)
    }, 0))

    const subScores: SubScoreItem[] = [
      {
        id: 'ext-perm',
        label: 'Permission Risk',
        score: permScore,
        maxScore: 100,
        severity: permScore >= 80 ? 'CRITICAL' : permScore >= 60 ? 'HIGH' : permScore >= 35 ? 'MEDIUM' : permScore >= 10 ? 'LOW' : 'SAFE'
      },
      {
        id: 'ext-host',
        label: 'Host Access Risk',
        score: hostScore,
        maxScore: 100,
        severity: hostScore >= 30 ? 'CRITICAL' : hostScore >= 15 ? 'HIGH' : hostScore > 0 ? 'LOW' : 'SAFE'
      },
      {
        id: 'ext-combo',
        label: 'Combination Risk',
        score: comboScore,
        maxScore: 100,
        severity: comboScore >= 30 ? 'CRITICAL' : comboScore >= 20 ? 'HIGH' : comboScore > 0 ? 'MEDIUM' : 'SAFE'
      },
      {
        id: 'ext-overall',
        label: 'Overall Score',
        score: Math.round(score),
        maxScore: 100,
        severity: riskLevel
      }
    ]

    const info: ExtensionInfoItem[] = [
      { label: 'Name', value: data.name || 'Unknown' },
      { label: 'Extension ID', value: data.extension_id || 'N/A' },
      { label: 'Version', value: data.version || 'N/A' },
      { label: 'Manifest Version', value: data.manifest_version != null ? `MV${data.manifest_version}` : 'N/A' },
      { label: 'Permissions Count', value: String((data.permissions_analyzed || []).length) },
      { label: 'Host Permissions Count', value: String((data.host_permissions_analyzed || []).length) },
      { label: 'Dangerous Combinations', value: String((data.combination_findings || []).length) },
      { label: 'Scan Engine', value: data.engine || 'CyberWatch Extension Analyzer 1.0' }
    ]

    const radarData: RadarDataPoint[] = [
      { subject: 'Permissions', currentScore: permScore, baselineScore: 10 },
      { subject: 'Host Access', currentScore: hostScore, baselineScore: 5 },
      { subject: 'Combinations', currentScore: comboScore, baselineScore: 0 },
      { subject: 'Metadata', currentScore: Math.min(100, (data.metadata_issues || []).length * 15), baselineScore: 0 },
      { subject: 'Overall', currentScore: Math.round(score), baselineScore: 10 }
    ]

    const warningMessage = data.summary || (
      score >= 60
        ? 'This extension has high-risk permissions. Review carefully before installing.'
        : score >= 20
        ? 'This extension has moderate-risk permissions. Verify the publisher before installing.'
        : 'This extension appears to have minimal permission risk.'
    )

    return {
      extensionId: data.extension_id || 'N/A',
      name: data.name || 'Unknown Extension',
      version: data.version || 'N/A',
      manifestVersion: data.manifest_version ?? null,
      overallScore: Math.round(score),
      severity: riskLevel,
      confidence: 0.95,
      scanTime: new Date().toISOString(),
      engine: data.engine || 'CyberWatch Extension Analyzer 1.0',
      warningMessage,
      subScores,
      info,
      permissions: permFindings.length > 0 ? permFindings : [{
        name: 'No permissions declared',
        description: 'This extension declares no permissions. Very low risk.',
        severity: 'SAFE'
      }],
      aiChecks,
      radarData
    }
  }
}

// ── Supporting types used by scanExtension ────────────────────────────────────
type PermissionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'

interface PermissionAnalysisItem {
  name: string
  description: string
  severity: PermissionSeverity
}

interface AICheckItem {
  id: string
  name: string
  finding: string
  severity: PermissionSeverity
}

interface SubScoreItem {
  id: string
  label: string
  score: number
  maxScore: number
  severity: PermissionSeverity
}

interface ExtensionInfoItem {
  label: string
  value: string
}

interface RadarDataPoint {
  subject: string
  currentScore: number
  baselineScore: number
}

interface ExtensionScanResult {
  extensionId: string
  name: string
  version: string
  manifestVersion: number | null
  overallScore: number
  severity: PermissionSeverity
  confidence: number
  scanTime: string
  engine: string
  warningMessage: string
  subScores: SubScoreItem[]
  info: ExtensionInfoItem[]
  permissions: PermissionAnalysisItem[]
  aiChecks: AICheckItem[]
  radarData: RadarDataPoint[]
}

export interface ExtensionScanPayload {
  extension_id?: string
  name?: string
  version?: string
  description?: string
  manifest_version?: number
  permissions?: string[]
  host_permissions?: string[]
}
