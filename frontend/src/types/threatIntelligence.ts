export interface KpiCardData {
  id: string
  label: string
  value: string
  trend: string
  trendType: 'up' | 'down'
  iconName: 'Globe' | 'ShieldCheck' | 'Link2' | 'Puzzle' | 'Server' | 'Radar'
}

export interface RegionAttackingItem {
  id: string
  country: string
  flag: string
  percentage: number
}

export interface LatestFeedItem {
  id: string
  time: string
  indicator: string
  type: string
  category: 'phishing' | 'malware' | 'domain' | 'ip' | 'extension' | 'cve'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  source: string
}

export interface CategoryDataPoint {
  name: string
  value: number
  percentage: number
  color: string
}

export interface ActiveCampaignItem {
  id: string
  name: string
  type: 'PHISHING' | 'MALWARE' | 'EXTENSION' | 'DOMAIN'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  details: string
}

export interface TrendingThreatItem {
  rank: number
  indicator: string
  type: string
  growth: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface DataSourceItem {
  name: string
  status: 'Active' | 'Inactive'
}

export interface ThreatIntelligenceResult {
  kpis: KpiCardData[]
  topAttackingRegions: RegionAttackingItem[]
  latestFeeds: LatestFeedItem[]
  categories: CategoryDataPoint[]
  activeCampaigns: ActiveCampaignItem[]
  trendingThreats: TrendingThreatItem[]
  dataSources: DataSourceItem[]
}
