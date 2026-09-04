export interface SubScoreItem {
  id: string
  label: string
  score: number
  maxScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  trend?: string
}

export interface AICheckItem {
  id: string
  name: string
  finding: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
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

export interface URLPreviewDetails {
  title: string
  description: string
  ipAddress: string
  hostingProvider: string
  country: string
}

export interface URLScanResult {
  url: string
  overallScore: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number
  scanTime: string
  engine: string
  warningMessage: string
  subScores: SubScoreItem[]
  aiChecks: AICheckItem[]
  radarData: RadarDataPoint[]
  intelMatches: ThreatIntelMatch[]
  preview: URLPreviewDetails
}
