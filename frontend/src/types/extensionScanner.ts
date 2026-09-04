export interface SubScoreItem {
  id: string
  label: string
  score: number
  maxScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
}

export interface ExtensionInfoItem {
  label: string
  value: string
}

export interface PermissionAnalysisItem {
  name: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
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

export interface ExtensionScanResult {
  extensionId: string
  name: string
  version: string
  manifestVersion: number | null
  overallScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
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

