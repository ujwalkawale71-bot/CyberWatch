import type { AnalyticsResult } from '../types/analytics'

export const analyticsDemoData: AnalyticsResult = {
  kpis: [
    { id: 'an-kpi-1', label: 'Total Scans', value: '128,547', trend: '+18.7%', trendType: 'up', iconName: 'ScanLine' },
    { id: 'an-kpi-2', label: 'Threats Detected', value: '12,845', trend: '+22.4%', trendType: 'up', iconName: 'Shield' },
    { id: 'an-kpi-3', label: 'Blocked Threats', value: '3,278', trend: '+16.2%', trendType: 'up', iconName: 'ShieldCheck' },
    { id: 'an-kpi-4', label: 'Critical Threats', value: '842', trend: '+24.9%', trendType: 'up', iconName: 'AlertTriangle' },
    { id: 'an-kpi-5', label: 'Active Extensions', value: '564', trend: '-3.4%', trendType: 'down', iconName: 'Puzzle' },
    { id: 'an-kpi-6', label: 'Unique Users', value: '1,248', trend: '+11.3%', trendType: 'up', iconName: 'Users' }
  ],
  activityOverview: [
    { day: 'Day 1', urls: 2200, websites: 1400, extensions: 800, behavior: 500 },
    { day: 'Day 5', urls: 2500, websites: 1600, extensions: 850, behavior: 550 },
    { day: 'Day 10', urls: 2800, websites: 1500, extensions: 900, behavior: 620 },
    { day: 'Day 15', urls: 3200, websites: 1800, extensions: 950, behavior: 700 },
    { day: 'Day 20', urls: 3800, websites: 2100, extensions: 1100, behavior: 820 },
    { day: 'Day 25', urls: 4500, websites: 2400, extensions: 1050, behavior: 750 },
    { day: 'Day 30', urls: 4200, websites: 2200, extensions: 1000, behavior: 780 }
  ],
  threatsOverTime: [
    { day: 'Day 1', critical: 12, high: 32, medium: 56, low: 88 },
    { day: 'Day 5', critical: 15, high: 38, medium: 62, low: 94 },
    { day: 'Day 10', critical: 10, high: 45, medium: 50, low: 80 },
    { day: 'Day 15', critical: 18, high: 42, medium: 58, low: 110 },
    { day: 'Day 20', critical: 25, high: 58, medium: 72, low: 124 },
    { day: 'Day 25', critical: 32, high: 64, medium: 88, low: 145 },
    { day: 'Day 30', critical: 22, high: 50, medium: 76, low: 118 }
  ],
  threatsByType: [
    { name: 'Phishing', value: 4441, percentage: 34.6, color: '#3b82f6' },
    { name: 'Malware', value: 3094, percentage: 24.1, color: '#a855f7' },
    { name: 'Malicious Extensions', value: 2210, percentage: 17.2, color: '#ec4899' },
    { name: 'Suspicious Behavior', value: 1489, percentage: 11.6, color: '#f97316' },
    { name: 'Malicious Websites', value: 1003, percentage: 7.8, color: '#10b981' },
    { name: 'Others', value: 608, percentage: 4.7, color: '#64748b' }
  ],
  riskyDomains: [
    { id: 'dom-r-1', domain: 'secure-paypal-login.com', score: 95, threats: 852 },
    { id: 'dom-r-2', domain: 'update-chrome[.]info', score: 92, threats: 734 },
    { id: 'dom-r-3', domain: 'account-validation.net', score: 90, threats: 612 },
    { id: 'dom-r-4', domain: 'free-gift-card.win', score: 87, threats: 498 },
    { id: 'dom-r-5', domain: 'verify-user-secure.com', score: 85, threats: 421 },
    { id: 'dom-r-6', domain: 'login-pwp-verification.org', score: 82, threats: 389 },
    { id: 'dom-r-7', domain: 'important-notice-mail.net', score: 78, threats: 338 },
    { id: 'dom-r-8', domain: 'trackid-sp-tracking.com', score: 75, threats: 301 }
  ],
  riskyIps: [
    { id: 'ip-r-1', ip: '185.199.108.153', score: 94, threats: 678, country: 'US' },
    { id: 'ip-r-2', ip: '194.5.207.20', score: 92, threats: 531, country: 'DE' },
    { id: 'ip-r-3', ip: '103.224.182.55', score: 89, threats: 473, country: 'RU' },
    { id: 'ip-r-4', ip: '45.148.10.66', score: 87, threats: 412, country: 'NL' },
    { id: 'ip-r-5', ip: '178.62.24.23', score: 85, threats: 368, country: 'NL' },
    { id: 'ip-r-6', ip: '94.156.12.9', score: 82, threats: 299, country: 'US' },
    { id: 'ip-r-7', ip: '185.220.101.45', score: 80, threats: 256, country: 'US' },
    { id: 'ip-r-8', ip: '37.120.177.201', score: 78, threats: 214, country: 'FR' }
  ],
  categories: [
    { name: 'Safe', value: 49531, percentage: 38.5, color: '#10b981' },
    { name: 'Suspicious', value: 35734, percentage: 27.8, color: '#f59e0b' },
    { name: 'Malicious', value: 27402, percentage: 21.3, color: '#ef4444' },
    { name: 'High Risk', value: 11180, percentage: 8.7, color: '#f97316' },
    { name: 'Unknown', value: 4700, percentage: 3.7, color: '#64748b' }
  ],
  sources: [
    { name: 'URL/Domain', value: 54761, percentage: 42.6, color: '#3b82f6' },
    { name: 'Website Scanner', value: 32271, percentage: 25.1, color: '#10b981' },
    { name: 'Extension Scanner', value: 22248, percentage: 17.2, color: '#a855f7' },
    { name: 'Behavior Monitor', value: 13633, percentage: 10.6, color: '#f59e0b' },
    { name: 'Others', value: 5634, percentage: 4.4, color: '#64748b' }
  ],
  users: [
    { id: 'usr-an-1', user: 'SecOps Admin', scans: 2847, threats: 842, blocked: 724 },
    { id: 'usr-an-2', user: 'john.doe@company.com', scans: 2103, threats: 621, blocked: 532 },
    { id: 'usr-an-3', user: 'alice@company.com', scans: 1748, threats: 412, blocked: 378 },
    { id: 'usr-an-4', user: 'michael@company.com', scans: 1256, threats: 311, blocked: 280 },
    { id: 'usr-an-5', user: 'david@company.com', scans: 984, threats: 211, blocked: 176 },
    { id: 'usr-an-6', user: 'sarah@company.com', scans: 865, threats: 184, blocked: 153 },
    { id: 'usr-an-7', user: 'others (18)', scans: 6234, threats: 1892, blocked: 1335 }
  ],
  geo: [
    { id: 'geo-1', country: 'United States', scans: 32547 },
    { id: 'geo-2', country: 'India', scans: 22814 },
    { id: 'geo-3', country: 'Germany', scans: 12456 },
    { id: 'geo-4', country: 'United Kingdom', scans: 8214 },
    { id: 'geo-5', country: 'Russia', scans: 7621 },
    { id: 'geo-6', country: 'Brazil', scans: 6148 },
    { id: 'geo-7', country: 'Others', scans: 38747 }
  ],
  insights: [
    {
      id: 'ins-1',
      title: 'Spike in Phishing URLs',
      desc: 'Phishing attempts increased by 32% in the last 24 hours',
      severity: 'HIGH'
    },
    {
      id: 'ins-2',
      title: 'Malicious Extension Increase',
      desc: 'Detected 18% more malicious extensions this week',
      severity: 'MEDIUM'
    },
    {
      id: 'ins-3',
      title: 'New Malware Campaign',
      desc: 'A new malware campaign targeting banking credentials',
      severity: 'HIGH'
    },
    {
      id: 'ins-4',
      title: 'Unusual Login Locations',
      desc: '12 users logged in from unusual locations',
      severity: 'MEDIUM'
    },
    {
      id: 'ins-5',
      title: 'Behavior Anomaly Detected',
      desc: 'Abnormal script injection attempts detected',
      severity: 'MEDIUM'
    }
  ]
}
