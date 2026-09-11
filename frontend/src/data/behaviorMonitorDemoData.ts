import type { BehaviorMonitorResult } from '../types/behaviorMonitor'

export const defaultBehaviorMonitorData: BehaviorMonitorResult = {
  kpis: [
    {
      id: 'kpi-risk',
      label: 'Behavior Risk Score',
      value: '0/100',
      subtext: 'SAFE RISK',
      severity: 'SAFE',
      iconName: 'Gauge'
    },
    {
      id: 'kpi-events',
      label: 'Security Evaluations',
      value: '0',
      subtext: 'Total Scans',
      iconName: 'Activity'
    },
    {
      id: 'kpi-suspicious',
      label: 'Confirmed Anomalies',
      value: '0',
      subtext: '0 Patterns Active',
      severity: 'SAFE',
      iconName: 'AlertTriangle'
    },
    {
      id: 'kpi-blocked',
      label: 'Blocked Events',
      value: '0',
      subtext: 'Containment Actions',
      severity: 'SAFE',
      iconName: 'ShieldCheck'
    },
    {
      id: 'kpi-ext',
      label: 'Monitored Extensions',
      value: '0',
      subtext: 'Extension Scans',
      iconName: 'Puzzle'
    },
    {
      id: 'kpi-patterns',
      label: 'Correlated Patterns',
      value: '0',
      subtext: 'Evidence Clusters',
      iconName: 'LayoutGrid'
    }
  ],
  timeline: [],
  topBehaviors: [],
  sessionOverview: [
    { label: 'Monitoring Status', value: 'Active & Ready', isBadge: true, badgeType: 'SAFE' },
    { label: 'Engine Architecture', value: 'Evidence-Based Anomaly Classifier' },
    { label: 'Operator Context', value: 'SecOps Operator' },
    { label: 'Database Backend', value: 'SQLite / SQLAlchemy Local Store' },
    { label: 'Evaluated Scans in Window', value: '0' },
    { label: 'Confirmed Pattern Anomalies', value: '0' },
    { label: 'Posture Risk Classification', value: 'SAFE RISK', isBadge: true, badgeType: 'SAFE' }
  ],
  recentEvents: []
}

export const behaviorMonitorDemoData = defaultBehaviorMonitorData
