import type {
  KpiCardData,
  TimelineDataPoint,
  SuspiciousBehaviorItem,
  SessionOverviewItem,
  RecentEventItem
} from '../types/behaviorMonitor'

export interface BehaviorStatsResponse {
  range: string
  behaviour_risk_index: number
  behaviour_risk_level: string
  security_evaluations: number
  confirmed_anomalies: number
  blocked_actions: number
  extension_evaluations: number
  correlated_patterns_count: number
  kpis: KpiCardData[]
  timeline: TimelineDataPoint[]
  top_behaviors: SuspiciousBehaviorItem[]
  session_overview: SessionOverviewItem[]
  recent_events: RecentEventItem[]
  patterns?: any[]
}

const JWT_KEY = 'cyberwatch_jwt_token'

export const behaviorApi = {
  getStats: async (range: '24h' | '7d' | '30d' | 'all' = '7d'): Promise<BehaviorStatsResponse> => {
    const token = localStorage.getItem(JWT_KEY)
    let res: Response
    try {
      res = await fetch(`http://127.0.0.1:8000/api/behavior/stats?range=${range}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
    } catch (err: any) {
      throw new Error('Network error: Unable to connect to CyberWatch behavior monitor API on port 8000.')
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.detail || `Behavior monitor stats failed with status ${res.status}`)
    }

    const json = await res.json()
    return json.data as BehaviorStatsResponse
  }
}
