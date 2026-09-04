import type { BehaviorMonitorResult } from '../types/behaviorMonitor'

export const behaviorMonitorDemoData: BehaviorMonitorResult = {
  kpis: [
    {
      id: 'kpi-risk',
      label: 'Behavior Risk Score',
      value: '68/100',
      subtext: 'MEDIUM RISK',
      severity: 'MEDIUM',
      iconName: 'Gauge'
    },
    {
      id: 'kpi-events',
      label: 'Events Captured',
      value: '1,284',
      trend: '+24.6%',
      trendType: 'up',
      iconName: 'Activity'
    },
    {
      id: 'kpi-suspicious',
      label: 'Suspicious Events',
      value: '245',
      trend: '+18.3%',
      trendType: 'up',
      severity: 'HIGH',
      iconName: 'AlertTriangle'
    },
    {
      id: 'kpi-blocked',
      label: 'Blocked Events',
      value: '31',
      trend: '+47.6%',
      trendType: 'up',
      severity: 'SAFE', // mapped as emerald
      iconName: 'ShieldCheck'
    },
    {
      id: 'kpi-ext',
      label: 'Monitored Extensions',
      value: '12',
      subtext: 'All active',
      iconName: 'Puzzle'
    },
    {
      id: 'kpi-tabs',
      label: 'Active Tabs',
      value: '18',
      subtext: 'Currently open',
      iconName: 'LayoutGrid'
    }
  ],
  timeline: [
    { time: '10:30', normal: 45, suspicious: 12, critical: 5, blocked: 2 },
    { time: '10:32', normal: 52, suspicious: 18, critical: 8, blocked: 2 },
    { time: '10:34', normal: 48, suspicious: 15, critical: 10, blocked: 5 },
    { time: '10:36', normal: 60, suspicious: 22, critical: 14, blocked: 4 },
    { time: '10:38', normal: 75, suspicious: 35, critical: 25, blocked: 8 },
    { time: '10:40', normal: 90, suspicious: 48, critical: 72, blocked: 10 }, // High peak
    { time: '10:42', normal: 82, suspicious: 30, critical: 18, blocked: 12 }
  ],
  topBehaviors: [
    { id: 'beh-1', name: 'Script Injection', count: 8, color: '#ef4444' }, // red
    { id: 'beh-2', name: 'Data Exfiltration', count: 5, color: '#a855f7' }, // purple
    { id: 'beh-3', name: 'Credential Harvesting', count: 4, color: '#f97316' }, // orange
    { id: 'beh-4', name: 'Malicious Redirects', count: 4, color: '#f59e0b' }, // amber
    { id: 'beh-5', name: 'Browser Hijacking', count: 3, color: '#ef4444' } // red
  ],
  sessionOverview: [
    { label: 'Monitored Browser', value: 'Google Chrome 125.0.6422.141' },
    { label: 'Operating System', value: 'Windows 11 Pro 23H2' },
    { label: 'User Context', value: 'SecOps Admin' },
    { label: 'IP Address', value: '103.21.244.56' },
    { label: 'Session Start Time', value: 'Today, 19:57:26' },
    { label: 'Total Events Captured', value: '1,284' },
    { label: 'Session Threat Status', value: 'MEDIUM RISK', isBadge: true, badgeType: 'MEDIUM' }
  ],
  recentEvents: [
    {
      id: 'event-1',
      time: '10:42:01',
      name: 'Script Injection Attempt',
      source: 'Extension: Free Video Downloader Pro',
      severity: 'CRITICAL',
      status: 'Blocked'
    },
    {
      id: 'event-2',
      time: '10:40:15',
      name: 'Data Exfiltration Detected',
      source: 'https://malicious-site.com',
      severity: 'HIGH',
      status: 'Blocked'
    },
    {
      id: 'event-3',
      time: '10:38:54',
      name: 'Credential Harvesting Detected',
      source: 'https://fake-login-page.com',
      severity: 'HIGH',
      status: 'Blocked'
    },
    {
      id: 'event-4',
      time: '10:35:22',
      name: 'Malicious Redirect',
      source: 'Extension: PDF Converter Ultimate',
      severity: 'MEDIUM',
      status: 'Detected'
    },
    {
      id: 'event-5',
      time: '10:31:08',
      name: 'Suspicious API Call',
      source: 'Extension: Ad Blocker Max',
      severity: 'MEDIUM',
      status: 'Detected'
    }
  ]
}
