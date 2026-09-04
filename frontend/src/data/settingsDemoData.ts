import type { SettingsUser, IntegrationItem, SystemMaintenanceInfo } from '../types/settings'

export const settingsUsers: SettingsUser[] = [
  {
    id: 'set-u-1',
    name: 'SecOps Admin',
    email: 'admin@company.com',
    role: 'Administrator',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'set-u-2',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Security Analyst',
    status: 'Active',
    lastActive: '10m ago'
  },
  {
    id: 'set-u-3',
    name: 'Alice Smith',
    email: 'alice@company.com',
    role: 'Security Analyst',
    status: 'Active',
    lastActive: '2h ago'
  },
  {
    id: 'set-u-4',
    name: 'Pending Analyst',
    email: 'new-hire@company.com',
    role: 'Viewer',
    status: 'Pending',
    lastActive: 'Never'
  }
]

export const settingsIntegrations: IntegrationItem[] = [
  {
    id: 'int-1',
    name: 'VirusTotal',
    status: 'Configured',
    type: 'Threat Intelligence Lookup',
    iconName: 'Shield',
    lastSync: '5 min ago'
  },
  {
    id: 'int-2',
    name: 'URLhaus',
    status: 'Configured',
    type: 'Malicious URL Database',
    iconName: 'Globe',
    lastSync: '2 min ago'
  },
  {
    id: 'int-3',
    name: 'PhishTank',
    status: 'Configured',
    type: 'Phishing Feed Database',
    iconName: 'Database',
    lastSync: '12 min ago'
  },
  {
    id: 'int-4',
    name: 'AbuseIPDB',
    status: 'Configured',
    type: 'IP Reputation Registry',
    iconName: 'Radio',
    lastSync: '15 min ago'
  },
  {
    id: 'int-5',
    name: 'AlienVault OTX',
    status: 'Not Connected',
    type: 'Open Threat Exchange',
    iconName: 'Network',
    lastSync: 'Never'
  },
  {
    id: 'int-6',
    name: 'OpenPhish',
    status: 'Not Connected',
    type: 'Live Phishing Feeds',
    iconName: 'FileCheck',
    lastSync: 'Never'
  }
]

export const settingsMaintenance: SystemMaintenanceInfo = {
  lastBackup: 'May 15, 2025, 11:30 PM',
  dbVersion: 'v4.2.1',
  licenseType: 'Enterprise Edition Demo',
  expiryDate: 'June 30, 2026'
}
