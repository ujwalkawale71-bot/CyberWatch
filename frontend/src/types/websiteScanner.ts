export interface ThreatIntelSourceRecord {
  source: string
  configured?: boolean
  request_executed?: boolean
  status: 'DETECTED' | 'NOT_DETECTED' | 'NOT DETECTED' | 'NOT_CONFIGURED' | 'NOT CONFIGURED' | 'NOT ANALYZED' | 'FAILED' | 'RATE LIMITED' | string
  data_origin?: string
  detected?: boolean
  reason?: string
  checked_at?: string
  http_status?: number | null
  details?: any
}

export interface ScoreComponent {
  id?: string
  title?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string
  evidence_type?: string
  score_contribution?: number
  confidence?: string
  reason?: string
  evidence?: string
}

export interface WebsiteFinding {
  id?: string
  category?: string
  title?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string
  evidence_type?: string
  score_impact?: number
  statusTag?: string
  reason?: string
  evidence?: string
  remediation?: string
  confidence?: number
}

export interface WebsiteScanResult {
  id?: number
  scan_id?: number
  url: string
  domain: string
  timestamp?: string
  risk_score?: number | null
  risk_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | 'UNKNOWN' | string
  security_verdict?: string
  confidence?: 'HIGH' | 'MODERATE' | 'LIMITED' | number | string
  explanation?: string
  status?: string
  findings?: WebsiteFinding[]
  score_components?: ScoreComponent[]
  positive_signals?: string[]
  analysis_limitations?: string[]
  recommendations?: string[]
  local_analysis_coverage?: {
    status: string
    percent: number
    modules_completed?: number
    total_modules?: number
  }
  threat_intelligence_coverage?: {
    status: string
    percent: number
    sources_configured?: number
    sources_total?: number
  }
  threat_intelligence_sources?: ThreatIntelSourceRecord[]
  threat_intelligence?: any
  security_headers?: Record<string, { status: string; value?: string }>
  technologies?: Array<{ name: string; category: string; version?: string }>
  external_resources?: {
    scripts?: number
    css?: number
    images?: number
    iframes?: number
    unique_domains?: number
    domains_list?: string[]
  }
  technical_details?: {
    dns?: {
      resolved?: boolean
      resolved_ips?: string[]
      is_private?: boolean
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
      hostname_mismatch?: boolean
      error?: string | null
    }
    http?: {
      reachable?: boolean
      status_code?: number
      server?: string
      content_type?: string
      final_url?: string
    }
    redirects?: {
      count?: number
      chain?: Array<{ hop: number; from: string; to: string; status_code: number }>
    }
    content?: {
      title?: string
      meta_description?: string
      canonical?: string
      language?: string
      forms_count?: number
      has_password_input?: boolean
      has_credit_card_input?: boolean
      has_login_button?: boolean
      obfuscated_js_flags?: number
    }
    forms?: any[]
    scripts?: any[]
    iframes?: any[]
  }
}

// Legacy Component Interfaces
export interface SubScoreItem {
  id: string
  label: string
  score: number
  maxScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  trend?: string
}

export interface WebsiteInfoItem {
  label: string
  value: string
}

export interface AICheckItem {
  id: string
  name: string
  finding: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
}

export interface RadarDataPoint {
  subject: string
  currentScore: number
  baselineScore: number
}

export interface ThreatIntelMatch {
  id: string
  source: string
  matchValue: string
  type: string
  confidence: number
}

export interface TechnologyItem {
  name: string
  category: string
  version?: string
}

export interface SecurityHeaderItem {
  name: string
  status: 'Present' | 'Missing'
}
