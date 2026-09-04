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

// KPI datasets
export const kpiCardsData: KpiData[] = [
  {
    id: 'total-scans',
    label: 'Total Scans',
    value: '15,742',
    iconName: 'ScanLine',
    color: 'blue',
    trend: '+21.4%',
    trendType: 'up'
  },
  {
    id: 'threats-detected',
    label: 'Threats Detected',
    value: '1,617',
    iconName: 'Shield',
    color: 'red',
    trend: '+18.7%',
    trendType: 'up'
  },
  {
    id: 'blocked-threats',
    label: 'Blocked Threats',
    value: '412',
    iconName: 'ShieldCheck',
    color: 'amber',
    trend: '+24.2%',
    trendType: 'up'
  },
  {
    id: 'critical-threats',
    label: 'Critical Threats',
    value: '96',
    iconName: 'AlertTriangle',
    color: 'fuchsia',
    trend: '+33.3%',
    trendType: 'up'
  },
  {
    id: 'active-extensions',
    label: 'Active Extensions',
    value: '63',
    iconName: 'Puzzle',
    color: 'emerald',
    trend: '-5.1%',
    trendType: 'down'
  }
]

// Threat Activity over past 7 days
export const threatActivityData: ActivityDataPoint[] = [
  { date: 'May 09', urls: 120, websites: 80, extensions: 40, behavior: 25 },
  { date: 'May 10', urls: 150, websites: 95, extensions: 42, behavior: 28 },
  { date: 'May 11', urls: 135, websites: 78, extensions: 38, behavior: 20 },
  { date: 'May 12', urls: 180, websites: 110, extensions: 55, behavior: 35 },
  { date: 'May 13', urls: 190, websites: 115, extensions: 58, behavior: 40 },
  { date: 'May 14', urls: 210, websites: 130, extensions: 65, behavior: 45 },
  { date: 'May 15', urls: 220, websites: 140, extensions: 70, behavior: 48 }
]

// Threat Distribution Pie Chart data
export const threatDistributionData: DistributionCategory[] = [
  { name: 'Phishing URLs', value: 706, percentage: 43.7, color: '#2A9D8F' }, // Primary Teal
  { name: 'Malicious Websites', value: 432, percentage: 26.7, color: '#4FAF78' }, // Safe / Success
  { name: 'Malicious Extensions', value: 263, percentage: 16.3, color: '#E07A3F' }, // High Risk
  { name: 'Behavior Anomalies', value: 139, percentage: 8.6, color: '#D9534F' }, // Critical
  { name: 'Others', value: 77, percentage: 4.7, color: '#747B82' } // Muted Text
]

// Real-time alerts
export const realtimeAlertsData: RealtimeAlert[] = [
  {
    id: 'alert-1',
    title: 'Phishing URL Detected',
    detail: 'secure-verify-account.com/login',
    severity: 'CRITICAL',
    timestamp: '1 min ago'
  },
  {
    id: 'alert-2',
    title: 'Malicious Extension Detected',
    detail: 'Free Video Downloader Pro',
    severity: 'HIGH',
    timestamp: '4 min ago'
  },
  {
    id: 'alert-3',
    title: 'Suspicious Behavior Detected',
    detail: 'Extension accessed sensitive APIs',
    severity: 'HIGH',
    timestamp: '6 min ago'
  },
  {
    id: 'alert-4',
    title: 'Malicious Website Blocked',
    detail: 'fake-bank-update.net',
    severity: 'MEDIUM',
    timestamp: '9 min ago'
  },
  {
    id: 'alert-5',
    title: 'Unusual Network Request',
    detail: 'Extension: Weather Plus',
    severity: 'LOW',
    timestamp: '15 min ago'
  }
]

// Top risky extensions
export const riskyExtensionsData: RiskyExtension[] = [
  { id: 'ext-1', name: 'Free Video Downloader Pro', score: 93, severity: 'CRITICAL' },
  { id: 'ext-2', name: 'PDF Converter Ultimate', score: 81, severity: 'HIGH' },
  { id: 'ext-3', name: 'Dark Theme for Chrome', score: 72, severity: 'HIGH' },
  { id: 'ext-4', name: 'Weather Plus', score: 46, severity: 'MEDIUM' },
  { id: 'ext-5', name: 'Ad Blocker Max', score: 23, severity: 'LOW' }
]

// Threat Intel Feed
export const intelSourcesData: IntelSource[] = [
  { id: 'feed-1', name: 'URLhaus Database', count: '18,742 malicious URLs', updatedMinutesAgo: 2 },
  { id: 'feed-2', name: 'PhishTank Database', count: '10,532 phishing URLs', updatedMinutesAgo: 5 },
  { id: 'feed-3', name: 'VirusTotal Feed', count: '7,231 malicious domains', updatedMinutesAgo: 12 },
  { id: 'feed-4', name: 'AbuseIPDB Feed', count: '4,128 bad IPs', updatedMinutesAgo: 15 }
]

// System statuses
export const systemStatusData: SystemServiceStatus[] = [
  { name: 'Real-time Protection', status: 'Active', type: 'green' },
  { name: 'ML Models', status: 'Not Loaded', type: 'gray' },
  { name: 'Threat Intelligence', status: 'Demo Mode', type: 'gray' },
  { name: 'Database', status: 'Ready', type: 'green' },
  { name: 'API Services', status: 'Ready', type: 'green' },
  { name: 'Browser Extension', status: 'Not Connected', type: 'gray' }
]
