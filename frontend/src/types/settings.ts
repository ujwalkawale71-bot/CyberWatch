export interface SettingsUser {
  id: string
  name: string
  email: string
  role: 'Administrator' | 'Security Analyst' | 'Viewer'
  status: 'Active' | 'Inactive' | 'Pending'
  lastActive: string
}

export interface IntegrationItem {
  id: string
  name: string
  status: 'Configured' | 'Not Connected'
  type: string
  iconName: 'Slack' | 'MessageSquare' | 'Server' | 'Cpu' | 'Shield' | 'Globe' | 'Database' | 'Radio' | 'Network' | 'FileCheck'
  lastSync: string
}

export interface SystemMaintenanceInfo {
  lastBackup: string
  dbVersion: string
  licenseType: string
  expiryDate: string
}

export type SettingsSection =
  | 'general'
  | 'scan-engine'
  | 'realtime'
  | 'notifications'
  | 'integrations'
  | 'user-mgmt'
  | 'maintenance'
  | 'privacy'
  | 'appearance'
  | 'advanced'
