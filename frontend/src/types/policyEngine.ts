export interface KpiCardData {
  id: string
  label: string
  value: string
  subtext: string
  iconName: 'FileText' | 'ShieldCheck' | 'ShieldOff' | 'AlertTriangle' | 'FileWarning' | 'Percent'
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
}

export interface PolicyRule {
  name: string
  condition: string
  action: 'Allow' | 'Monitor' | 'Warn' | 'Block' | 'Quarantine'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface PolicyScope {
  usersIncluded: string
  usersExcluded: string
  groupsIncluded: string
  groupsExcluded: string
  devices: string
  locations: string
}

export interface PolicyItem {
  id: string
  name: string
  description: string
  priority: number
  type: 'Web Protection' | 'Extension Control' | 'Behavior Control' | 'Data Protection'
  status: 'Active' | 'Paused' | 'Inactive'
  createdBy: string
  createdOn: string
  lastModified: string
  rules: PolicyRule[]
  scope: PolicyScope
}

export interface ActionResponseItem {
  name: string
  desc: string
  iconName: 'Block' | 'Warn' | 'Log' | 'Notify' | 'Quarantine'
}

export interface PolicyExceptionItem {
  id: string
  name: string
  type: 'URL' | 'Domain' | 'Extension' | 'IP'
  expires: string
  createdBy: string
}

export interface PolicyActivityLogItem {
  id: string
  time: string
  policyName: string
  event: string
  target: string
  user: string
  actionTaken: 'Blocked' | 'Warned' | 'Monitored' | 'Quarantined'
  result: 'Success' | 'Warning Ignored' | 'Exception Applied'
}

export interface PolicyEngineResult {
  kpis: KpiCardData[]
  policies: PolicyItem[]
  actions: ActionResponseItem[]
  exceptions: PolicyExceptionItem[]
  activityLog: PolicyActivityLogItem[]
}
