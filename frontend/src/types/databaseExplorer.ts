export interface KpiCardData {
  id: string
  label: string
  value: string
  subtext: string
  iconName: 'Database' | 'Link2' | 'Server' | 'Puzzle' | 'FileText' | 'Activity'
}

export type RecordType = 'URL' | 'Domain' | 'IP' | 'Extension' | 'File' | 'Hash' | 'Behavior'

export interface DbRecord {
  id: string
  type: RecordType
  value: string
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  source: string
  firstSeen: string
  lastSeen: string
  reputationScore: number
  category: string
  indicators: string[]
  contentMatchPercent?: number
  location?: string
  ipRange?: string
  tags: string[]
  related: {
    ips: number
    domains: number
    files: number
    behaviors: number
    alerts: number
  }
}

export interface FilterOptions {
  query: string
  collection: string
  threatLevel: string
  type: string
  source: string
}
