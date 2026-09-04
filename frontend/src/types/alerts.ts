export interface KpiCardData {
  id: string
  label: string
  value: string
  trend: string
  trendType: 'up' | 'down'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
}

export interface AlertDetailInfo {
  description: string
  keyValues: {
    label: string
    value: string
    isColored?: boolean
    severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  }[]
  matchedIndicators: string[]
  recommendedActions: string[]
  relatedIocs: {
    label: string
    value: string
  }[]
}

export interface AlertItem {
  id: string
  time: string
  name: string
  source: string
  type: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'Blocked' | 'Monitored' | 'Logged' | 'Warning'
  details: AlertDetailInfo
}

export interface DistributionDataPoint {
  day: string
  critical: number
  high: number
  medium: number
  low: number
}

export interface SourceDataPoint {
  name: string
  value: number
  percentage: number
  color: string
}

export interface AlertsResult {
  kpis: KpiCardData[]
  alerts: AlertItem[]
  distribution: DistributionDataPoint[]
  sources: SourceDataPoint[]
}
