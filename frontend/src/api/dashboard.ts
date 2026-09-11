import type {
  KpiData,
  ActivityDataPoint,
  DistributionCategory,
  RealtimeAlert,
  RiskyExtension,
  IntelSource,
  SystemServiceStatus
} from '../data/overviewData'

export interface RiskGaugeData {
  score: number
  maxScore: number
  riskLevel: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string
  totalScanned: number
  ranges: Array<{
    label: string
    count: number
    color: string
  }>
}

export interface RecentSecurityActivity {
  id: string
  scan_id: number
  scan_type: string
  event_type: string
  target: string
  risk_score: number
  risk_level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string
  findings_count: number
  timestamp: string
  created_at?: string
}

export interface DashboardStatsResponse {
  range: string
  total_scans: number
  threats_detected: number
  blocked_threats: number
  critical_threats: number
  active_extensions: number
  kpis: KpiData[]
  threat_activity: ActivityDataPoint[]
  threat_distribution: DistributionCategory[]
  realtime_alerts: RealtimeAlert[]
  risky_extensions: RiskyExtension[]
  risk_gauge: RiskGaugeData
  recent_security_activity: RecentSecurityActivity[]
  threat_intel_feed: IntelSource[]
  system_status: SystemServiceStatus[]
}


const JWT_KEY = 'cyberwatch_jwt_token'

export const dashboardApi = {
  getStats: async (range: '7d' | '30d' | '24h' | 'all' = '7d'): Promise<DashboardStatsResponse> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch(`http://127.0.0.1:8000/api/dashboard/stats?range=${range}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch dashboard API on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.detail || `Dashboard stats failed with status ${res.status}`)
    }

    const json = await res.json()
    return json.data as DashboardStatsResponse
  }
}
