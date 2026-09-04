export interface KpiCardData {
  id: string
  label: string
  value: string
  trend: string
  trendType: 'up' | 'down'
  iconName: 'ScanLine' | 'Shield' | 'ShieldCheck' | 'AlertTriangle' | 'Puzzle' | 'Users'
}

export interface ActivityOverviewPoint {
  day: string
  urls: number
  websites: number
  extensions: number
  behavior: number
}

export interface ThreatsOverTimePoint {
  day: string
  critical: number
  high: number
  medium: number
  low: number
}

export interface ThreatByTypePoint {
  name: string
  value: number
  percentage: number
  color: string
}

export interface TopRiskyDomain {
  id: string
  domain: string
  score: number
  threats: number
}

export interface TopRiskyIp {
  id: string
  ip: string
  score: number
  threats: number
  country: string
}

export interface CategoryDataPoint {
  name: string
  value: number
  percentage: number
  color: string
}

export interface ScanSourceDataPoint {
  name: string
  value: number
  percentage: number
  color: string
}

export interface UserActivityItem {
  id: string
  user: string
  scans: number
  threats: number
  blocked: number
}

export interface GeoItem {
  id: string
  country: string
  scans: number
}

export interface InsightItem {
  id: string
  title: string
  desc: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface AnalyticsResult {
  kpis: KpiCardData[]
  activityOverview: ActivityOverviewPoint[]
  threatsOverTime: ThreatsOverTimePoint[]
  threatsByType: ThreatByTypePoint[]
  riskyDomains: TopRiskyDomain[]
  riskyIps: TopRiskyIp[]
  categories: CategoryDataPoint[]
  sources: ScanSourceDataPoint[]
  users: UserActivityItem[]
  geo: GeoItem[]
  insights: InsightItem[]
}
