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

export interface WebsiteScanResult {
  url: string
  overallScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  confidence: number
  scanTime: string
  engine: string
  warningMessage: string
  subScores: SubScoreItem[]
  info: WebsiteInfoItem[]
  aiChecks: AICheckItem[]
  radarData: RadarDataPoint[]
  intelMatches: ThreatIntelMatch[]
  technologies: TechnologyItem[]
  securityHeaders: SecurityHeaderItem[]
}
