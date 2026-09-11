export interface KpiData {
  id: string
  label: string
  value: string
  iconName: 'ScanLine' | 'Shield' | 'ShieldCheck' | 'AlertTriangle' | 'Puzzle'
  color: 'blue' | 'red' | 'amber' | 'fuchsia' | 'emerald'
  trend: string
  trendType: 'up' | 'down'
}

export interface ActivityDataPoint {
  date: string
  urls: number
  websites: number
  extensions: number
  behavior: number
}

export interface DistributionCategory {
  name: string
  value: number
  percentage: number
  color: string
}

export interface RealtimeAlert {
  id: string
  title: string
  detail: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  timestamp: string
}

export interface RiskyExtension {
  id: string
  name: string
  score: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface IntelSource {
  id: string
  name: string
  count: string
  updatedMinutesAgo: number
}

export interface SystemServiceStatus {
  name: string
  status: 'Active' | 'Not Loaded' | 'Demo Mode' | 'Ready' | 'Not Connected'
  type: 'green' | 'gray'
}

// Baseline clean initial data structures (live data loaded from /api/dashboard/stats)
export const kpiCardsData: KpiData[] = [
  {
    id: 'total-scans',
    label: 'Total Scans',
    value: '0',
    iconName: 'ScanLine',
    color: 'blue',
    trend: '+0.0%',
    trendType: 'up'
  },
  {
    id: 'threats-detected',
    label: 'Threats Detected',
    value: '0',
    iconName: 'Shield',
    color: 'red',
    trend: '+0.0%',
    trendType: 'up'
  },
  {
    id: 'blocked-threats',
    label: 'Blocked Threats',
    value: '0',
    iconName: 'ShieldCheck',
    color: 'amber',
    trend: '+0.0%',
    trendType: 'up'
  },
  {
    id: 'critical-threats',
    label: 'Critical Threats',
    value: '0',
    iconName: 'AlertTriangle',
    color: 'fuchsia',
    trend: '+0.0%',
    trendType: 'up'
  },
  {
    id: 'active-extensions',
    label: 'Active Extensions',
    value: '0',
    iconName: 'Puzzle',
    color: 'emerald',
    trend: '+0.0%',
    trendType: 'up'
  }
]

// Threat Activity baseline
export const threatActivityData: ActivityDataPoint[] = []

// Threat Distribution baseline
export const threatDistributionData: DistributionCategory[] = [
  { name: 'Phishing URLs', value: 0, percentage: 0, color: '#2A9D8F' },
  { name: 'Malicious Websites', value: 0, percentage: 0, color: '#4FAF78' },
  { name: 'Malicious Extensions', value: 0, percentage: 0, color: '#E07A3F' },
  { name: 'Behavior Anomalies', value: 0, percentage: 0, color: '#D9534F' },
  { name: 'Others', value: 0, percentage: 0, color: '#747B82' }
]

// Real-time alerts baseline
export const realtimeAlertsData: RealtimeAlert[] = []

// Top risky extensions baseline
export const riskyExtensionsData: RiskyExtension[] = []

// Threat Intel Feed baseline
export const intelSourcesData: IntelSource[] = []

// System statuses baseline
export const systemStatusData: SystemServiceStatus[] = [
  { name: 'Real-time Protection', status: 'Active', type: 'green' },
  { name: 'ML Models', status: 'Ready', type: 'green' },
  { name: 'Threat Intelligence', status: 'Active', type: 'green' },
  { name: 'Database', status: 'Ready', type: 'green' },
  { name: 'API Services', status: 'Ready', type: 'green' },
  { name: 'Browser Extension', status: 'Active', type: 'green' }
]

