export interface KpiCardData {
  id: string
  label: string
  value: string
  subtext?: string
  trend?: string
  trendType?: 'up' | 'down'
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  iconName: 'Gauge' | 'Activity' | 'AlertTriangle' | 'ShieldCheck' | 'Puzzle' | 'LayoutGrid'
}

export interface TimelineDataPoint {
  time: string
  normal: number
  suspicious: number
  critical: number
  blocked: number
}

export interface SuspiciousBehaviorItem {
  id: string
  name: string
  count: number
  color: string
}

export interface SessionOverviewItem {
  label: string
  value: string
  isBadge?: boolean
  badgeType?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
}

export interface RecentEventItem {
  id: string
  time: string
  name: string
  source: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'Blocked' | 'Detected'
}

export interface BehaviorMonitorResult {
  kpis: KpiCardData[]
  timeline: TimelineDataPoint[]
  topBehaviors: SuspiciousBehaviorItem[]
  sessionOverview: SessionOverviewItem[]
  recentEvents: RecentEventItem[]
}
