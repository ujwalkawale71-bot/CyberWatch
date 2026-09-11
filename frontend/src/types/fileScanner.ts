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
  category?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string
  evidence_type?: string
  score_contribution?: number
  confidence?: string
  reason?: string
}

export interface FileFinding {
  id?: string
  category?: string
  title?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string
  evidence_type?: string
  score_contribution?: number
  score_impact?: number
  confidence?: string | number
  reason?: string
  evidence?: string
}

export interface FileScanResult {
  id?: number
  scan_id?: number | string
  file_name: string
  file_size: number
  file_type: string
  mime_type: string
  sha256: string
  sha1: string
  md5: string
  risk_score: number | null
  heuristic_score?: number
  verified_threat_score?: number
  overall_risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ANALYSIS LIMITED' | 'ANALYSIS FAILED' | string
  security_verdict?: string
  timestamp?: string
  scan_date?: string
  findings: FileFinding[]
  score_components: ScoreComponent[]
  positive_signals: string[]
  analysis_limitations: string[]
  recommendations: string[]
  analysis_coverage: {
    local_analysis: {
      status: string
      percent: number
      modules_completed?: number
      total_modules?: number
    }
    threat_intelligence: {
      status: string
      percent: number
      configured_sources?: number
      total_sources?: number
    }
  }
  threat_intelligence: {
    configured_sources_count?: number
    total_sources?: number
    verified_malware_detected?: boolean
    sources_queried?: ThreatIntelSourceRecord[]
  }
  threat_intelligence_sources?: ThreatIntelSourceRecord[]
  technical_details?: {
    hashes: {
      sha256: string
      sha1: string
      md5: string
    }
    entropy: {
      value: number
      scale: string
      classification: string
    }
    identity: {
      file_type: string
      mime_type: string
      category: string
      is_executable: boolean
      declared_extension: string
      file_size: number
    }
    pe?: {
      machine?: string
      subsystem?: string
      compile_timestamp?: string | null
      sections?: Array<{
        name: string
        virtual_size: number
        raw_size: number
        entropy: number
      }>
      suspicious_imports?: string[]
    } | null
    pdf?: {
      has_javascript?: boolean
      has_launch_action?: boolean
      has_embedded_files?: boolean
      has_open_action?: boolean
      uri_links_count?: number
    } | null
    office?: {
      has_vba_macros?: boolean
      has_external_relationships?: boolean
      embedded_executables?: string[]
    } | null
    archive?: {
      file_count?: number
      contains_executable?: boolean
      contains_nested_archive?: boolean
      has_path_traversal?: boolean
      files_sample?: string[]
    } | null
    script?: {
      matched_patterns?: string[]
      has_encoded_payload?: boolean
      has_network_download?: boolean
      has_hidden_execution?: boolean
    } | null
  }
}
