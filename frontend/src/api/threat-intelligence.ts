import type {
  ThreatIntelOverviewData,
  IOCInvestigationResult,
  ProviderStatus
} from '../types/threatIntelligence'

const BASE_URL = 'http://127.0.0.1:8000/api/threat-intelligence'
const JWT_KEY = 'cyberwatch_jwt_token'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(JWT_KEY)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const threatIntelApi = {
  getOverview: async (): Promise<ThreatIntelOverviewData> => {
    let res: Response
    try {
      res = await fetch(`${BASE_URL}/overview`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
    } catch (err) {
      throw new Error('Network error: Unable to reach CyberWatch Threat Intelligence API on port 8000.')
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson?.detail || `Threat intel overview failed (HTTP ${res.status})`)
    }

    const json = await res.json()
    return json.data as ThreatIntelOverviewData
  },

  getProviders: async (): Promise<ProviderStatus[]> => {
    let res: Response
    try {
      res = await fetch(`${BASE_URL}/providers`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
    } catch (err) {
      throw new Error('Network error: Unable to reach Threat Intelligence providers endpoint.')
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson?.detail || `Failed to fetch provider status (HTTP ${res.status})`)
    }

    const json = await res.json()
    return json.data as ProviderStatus[]
  },

  investigate: async (ioc: string): Promise<IOCInvestigationResult> => {
    let res: Response
    try {
      res = await fetch(`${BASE_URL}/investigate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ioc: ioc.trim() })
      })
    } catch (err) {
      throw new Error('Network error: Unable to contact Threat Intelligence investigation engine.')
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson?.detail || `Investigation failed (HTTP ${res.status})`)
    }

    const json = await res.json()
    return json.data as IOCInvestigationResult
  }
}
