export type IOCType = 'url' | 'domain' | 'ipv4' | 'ipv6' | 'sha256' | 'unknown'

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN' | 'UNASSESSED'

export type ProviderOperationalStatus = 'ONLINE' | 'AVAILABLE' | 'NOT_CONFIGURED' | 'RATE_LIMITED' | 'FAILED' | 'NOT_SUPPORTED'

export interface DetectionItem {
  source: string
  category: string
  evidence: string
  timestamp?: string
}

export interface VerdictEvidenceItem {
  source: string
  category: string
  finding: string
}

export interface LocalAnalysisFinding {
  source: string
  category: string
  severity: string
  finding: string
}

export interface LocalAnalysisResult {
  available: boolean
  risk_score: number
  findings: LocalAnalysisFinding[]
}

export interface SourceRecord {
  source: string
  target_queried?: string
  configured: boolean
  authentication_required: boolean
  request_executed: boolean
  status: 'DETECTED' | 'NOT_DETECTED' | 'NOT_CONFIGURED' | 'RATE_LIMITED' | 'FAILED' | 'NOT_SUPPORTED'
  data_origin?: string
  http_status: number | null
  detections: { category: string; evidence: string }[]
  error: string | null
  reason: string | null
  checked_at: string
  first_seen?: string | null
  last_seen?: string | null
  details?: any
}

export interface IOCInvestigationStats {
  total_sources: number
  configured_sources: number
  executed_sources: number
  detected_sources: number
  clean_sources: number
}

export interface IOCInvestigationResult {
  scan_id?: number
  target: string
  target_type: IOCType
  input_ioc: string
  ioc: string
  normalized_ioc: string
  ioc_type: IOCType
  verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN' | 'UNASSESSED'
  risk_score: number
  threat_level: ThreatLevel
  confidence: number
  providers_checked: number
  providers_available: number
  feed_detections: number
  first_seen: string
  last_seen: string
  investigated_at: string
  sources: SourceRecord[]
  local_analysis?: LocalAnalysisResult
  detections: DetectionItem[]
  verdict_evidence: VerdictEvidenceItem[]
  stats: IOCInvestigationStats
}

export interface ProviderStatus {
  name: string
  type: string
  supported_iocs: string[]
  is_configured: boolean
  auth_required: boolean
  operational_status: ProviderOperationalStatus
  description: string
  docs_url: string
}

export interface RecentIntelligenceItem {
  id: number
  indicator: string
  type: string
  category: string
  source: string
  risk_score: number
  threat_level: string
  created_at: string | null
}

export interface ThreatCategoryCount {
  category: string
  count: number
}

export interface ThreatIntelOverviewData {
  kpis: {
    indicators_checked: number
    threats_confirmed: number
    active_alerts: number
    sources_online: string
  }
  provider_statuses: ProviderStatus[]
  recent_intelligence: RecentIntelligenceItem[]
  threat_categories: ThreatCategoryCount[]
}
