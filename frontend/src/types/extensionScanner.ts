export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | 'LIMITED'

export interface SubScoreItem {
  id: string
  label: string
  score: number
  maxScore: number
  severity: RiskSeverity
}

export interface ExtensionInfoItem {
  label: string
  value: string
}

export interface PermissionAnalysisItem {
  name: string
  description: string
  severity: RiskSeverity
  whyItMatters?: string
  source?: string
  evidence?: string
}

export interface HostPermissionItem {
  permission: string
  severity: RiskSeverity
  reason: string
  isWildcard: boolean
  scopeType: 'universal' | 'scoped' | 'unknown'
  scopeDescription: string
  whyItMatters: string
  evidence?: string
}

export interface CombinationFindingItem {
  combination: string[]
  extraScore: number
  severity: RiskSeverity
  reason: string
  whyItMatters: string
  evidence?: string
}

export interface SecurityHighlightItem {
  id: string
  title: string
  description: string
  whyItMatters: string
  category: 'safe' | 'attention' | 'serious' | 'metadata'
  severity: RiskSeverity
  evidence?: string
  source?: string
}

export interface ExtensionStructureInfo {
  manifestVersion: number | null
  manifestVersionLabel: string
  manifestVersionExplanation: string
  backgroundStatus: string
  backgroundDetails: string
  contentScriptsStatus: string
  contentScriptsDetails: string
  serviceWorkerStatus: string
  serviceWorkerDetails: string
  permissionsCount: number
  hostPermissionsCount: number
}

export interface WebAccessibleResourceEntry {
  resources: string[]
  matches?: string[]
  extension_ids?: string[]
  use_dynamic_url?: boolean
  exposure: 'BROAD' | 'LIMITED'
}

export interface WebAccessibleResourcesInfo {
  status: 'DECLARED' | 'NOT_DECLARED'
  manifest_version: number
  exposure_level: 'BROAD' | 'LIMITED' | 'NONE'
  entries: WebAccessibleResourceEntry[]
  summary: string
}

export interface ModuleStatusItem {
  moduleName: string
  status: 'Available' | 'Not Available' | 'Not Configured'
  statusType: 'available' | 'unavailable' | 'not_configured'
  headline: string
  description: string
}

export interface RecommendedActionPlan {
  verdictTitle: string
  badgeSeverity: RiskSeverity
  headline: string
  rationale: string
  actionChecklist: string[]
}

export interface AICheckItem {
  id: string
  name: string
  finding: string
  severity: RiskSeverity
  whyItMatters?: string
  evidence?: string
}

export interface RadarDataPoint {
  subject: string
  currentScore: number
  baselineScore: number
}

export interface DataVerificationStatus {
  metadata_status: 'VERIFIED' | 'UNAVAILABLE'
  package_status: 'VERIFIED' | 'UNAVAILABLE'
  manifest_status: 'VERIFIED' | 'UNAVAILABLE'
  code_analysis_status: 'COMPLETED' | 'NOT_AVAILABLE' | 'SKIPPED' | 'NOT ANALYZED'
  analysis_coverage_percent: number
  package_format?: 'CRX3' | 'CRX2' | 'ZIP' | 'NONE'
  files_scanned_count?: number
  total_js_files_found?: number
  total_js_files_scanned?: number
  provenance?: Record<string, string>
}

export interface ObfuscationDetails {
  status?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  max_entropy?: number
  entropy_score?: number
  highest_entropy_file?: string
  high_entropy_strings_count?: number
  packed_js_detected?: boolean
  packer_detected?: boolean
  hex_escapes_count?: number
  hex_identifiers_count?: number
  long_strings_count?: number
}

export interface CodeFindingItem {
  id: string
  title?: string
  pattern_name?: string
  severity: RiskSeverity
  confidence?: number
  category?: string
  source?: string
  affected_file?: string
  file?: string
  line_or_pattern?: string
  line_preview?: string
  evidence?: string
  description?: string
  why_it_matters?: string
}

export interface SubScoresBreakdown {
  permission_risk: number
  host_access_risk: number
  content_script_risk: number
  background_risk: number
  web_accessible_resource_risk: number
  code_pattern_risk: number
  obfuscation_risk: number
}

export interface AnalysisCoverageInfo {
  level: 'FULL_ANALYSIS' | 'LIMITED_ANALYSIS' | 'INPUT_ONLY'
  manifest_status?: 'AVAILABLE' | 'UNAVAILABLE'
  manifest_inspected: boolean
  permissions_inspected: boolean
  host_access_inspected: boolean
  structure_inspected: boolean
  store_metadata_inspected: boolean
  static_code_inspected: boolean
  network_traffic_inspected: boolean
}

export interface ExtensionScanPayload {
  input_value?: string
  input_type?: string
  extension_id?: string
  name?: string
  version?: string
  description?: string
  developer?: string
  store_url?: string
  manifest_version?: number
  permissions?: string[]
  host_permissions?: string[]
  optional_permissions?: string[]
  optional_host_permissions?: string[]
  content_scripts?: any[]
  background?: any
  web_accessible_resources?: any
  raw_manifest?: any
  package_base64?: string
  _clientParsedManifest?: any
}

export interface ExtensionScanResult {
  scanId?: number | string
  requestedExtensionId?: string
  resolvedExtensionId?: string
  extensionId: string
  name: string
  version: string
  developer?: string
  storeUrl?: string
  rating?: string
  ratingCount?: number
  users?: string
  website?: string
  privacyPolicy?: string
  iconUrl?: string
  provenance?: Record<string, string>
  manifestVersion: number | null
  overallScore: number | null
  severity: RiskSeverity
  verdict?: string
  dataVerification?: DataVerificationStatus
  subScoresBreakdown?: SubScoresBreakdown
  analysisCoverage?: AnalysisCoverageInfo
  confidence: number
  scanTime: string
  engine: string
  warningMessage: string
  summary: string
  subScores: SubScoreItem[]
  info: ExtensionInfoItem[]
  permissions: PermissionAnalysisItem[]
  hostPermissions: HostPermissionItem[]
  combinations: CombinationFindingItem[]
  codeFindings?: CodeFindingItem[]
  obfuscationStatus?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  obfuscationDetails?: ObfuscationDetails
  externallyConnectable?: any
  contentSecurityPolicy?: any
  highlights: {
    safe: SecurityHighlightItem[]
    attention: SecurityHighlightItem[]
    serious: SecurityHighlightItem[]
  }
  structure: ExtensionStructureInfo
  webAccessibleResources?: WebAccessibleResourcesInfo
  unavailableModules: ModuleStatusItem[]
  whatThisMeans: string
  recommendedAction: RecommendedActionPlan
  aiChecks: AICheckItem[]
  radarData: RadarDataPoint[]
}
