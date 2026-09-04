import type { ThreatIntelligenceResult } from '../types/threatIntelligence'

export const threatIntelligenceDemoData: ThreatIntelligenceResult = {
  kpis: [
    { id: 'intel-kpi-1', label: 'Global Threats Today', value: '256,847', trend: '+12.4%', trendType: 'up', iconName: 'Globe' },
    { id: 'intel-kpi-2', label: 'Malicious Domains', value: '45,672', trend: '+18.7%', trendType: 'up', iconName: 'ShieldCheck' },
    { id: 'intel-kpi-3', label: 'Phishing URLs', value: '83,941', trend: '+22.3%', trendType: 'up', iconName: 'Link2' },
    { id: 'intel-kpi-4', label: 'Malicious Extensions', value: '8,247', trend: '+15.6%', trendType: 'up', iconName: 'Puzzle' },
    { id: 'intel-kpi-5', label: 'Compromised IPs', value: '119,563', trend: '+9.8%', trendType: 'up', iconName: 'Server' },
    { id: 'intel-kpi-6', label: 'Active Campaigns', value: '1,284', trend: '+6.4%', trendType: 'up', iconName: 'Radar' }
  ],
  topAttackingRegions: [
    { id: 'reg-1', country: 'Russia', flag: '🇷🇺', percentage: 24.6 },
    { id: 'reg-2', country: 'China', flag: '🇨🇳', percentage: 21.4 },
    { id: 'reg-3', country: 'United States', flag: '🇺🇸', percentage: 12.8 },
    { id: 'reg-4', country: 'Brazil', flag: '🇧🇷', percentage: 6.7 },
    { id: 'reg-5', country: 'India', flag: '🇮🇳', percentage: 6.2 },
    { id: 'reg-6', country: 'Others', flag: '🌐', percentage: 28.3 }
  ],
  latestFeeds: [
    {
      id: 'feed-item-1',
      time: '12:04:15',
      indicator: 'secure-verify-account.com',
      type: 'Phishing URL',
      category: 'phishing',
      severity: 'CRITICAL',
      source: 'PhishTank'
    },
    {
      id: 'feed-item-2',
      time: '12:02:40',
      indicator: 'abcdn1234bgfhdfjhkijmop',
      type: 'Malicious Ext.',
      category: 'extension',
      severity: 'HIGH',
      source: 'VirusTotal'
    },
    {
      id: 'feed-item-3',
      time: '11:59:12',
      indicator: '185.199.108.153',
      type: 'Malicious IP',
      category: 'ip',
      severity: 'HIGH',
      source: 'AlienVault'
    },
    {
      id: 'feed-item-4',
      time: '11:58:05',
      indicator: 'bank-update.net',
      type: 'Malicious Domain',
      category: 'domain',
      severity: 'CRITICAL',
      source: 'URLHaus'
    },
    {
      id: 'feed-item-5',
      time: '11:55:45',
      indicator: 'login-security-verify.site',
      type: 'Phishing URL',
      category: 'phishing',
      severity: 'CRITICAL',
      source: 'OpenPhish'
    },
    {
      id: 'feed-item-6',
      time: '11:51:30',
      indicator: 'pdf-converter-ultimate',
      type: 'Malicious Ext.',
      category: 'extension',
      severity: 'HIGH',
      source: 'Internal AI'
    }
  ],
  categories: [
    { name: 'Phishing', value: 84190, percentage: 32.7, color: '#3b82f6' },
    { name: 'Malware', value: 54992, percentage: 21.4, color: '#a855f7' },
    { name: 'Malicious Domains', value: 46785, percentage: 18.2, color: '#10b981' },
    { name: 'Malicious Extensions', value: 24672, percentage: 9.6, color: '#f97316' },
    { name: 'Compromised IPs', value: 21298, percentage: 8.3, color: '#06b6d4' },
    { name: 'C2 Infrastructure', value: 13884, percentage: 5.4, color: '#ec4899' },
    { name: 'Others', value: 11026, percentage: 4.4, color: '#64748b' }
  ],
  activeCampaigns: [
    {
      id: 'camp-1',
      name: 'Fake PayPal Login Campaign',
      type: 'PHISHING',
      severity: 'CRITICAL',
      details: 'Large scale phishing targeting financial accounts - Active since 10 May 2025 - Targets: 120+ countries'
    },
    {
      id: 'camp-2',
      name: 'Browser Extension Data Miner',
      type: 'MALWARE',
      severity: 'HIGH',
      details: 'Malicious Chrome extensions stealing sensitive data - Active since 8 May 2025 - Variants: 47'
    },
    {
      id: 'camp-3',
      name: 'PDF Converter Lure',
      type: 'EXTENSION',
      severity: 'HIGH',
      details: 'Malicious extensions disguised as PDF tools - Active since 5 May 2025 - Installs: 250K+'
    },
    {
      id: 'camp-4',
      name: 'Fake Bank Update Sites',
      type: 'DOMAIN',
      severity: 'CRITICAL',
      details: 'Domain typosquatting campaign - Active since 12 May 2025 - Domains: 3,400+'
    }
  ],
  trendingThreats: [
    { rank: 1, indicator: 'paypal-security-verify.com', type: 'Domain', growth: '+342%', severity: 'CRITICAL' },
    { rank: 2, indicator: 'abcdn78 (extension)', type: 'Extension', growth: '+276%', severity: 'HIGH' },
    { rank: 3, indicator: 'bank-update.net', type: 'Domain', growth: '+198%', severity: 'CRITICAL' },
    { rank: 4, indicator: 'login-verify.online', type: 'URL', growth: '+165%', severity: 'HIGH' },
    { rank: 5, indicator: 'chrome-data-saver', type: 'Extension', growth: '+142%', severity: 'HIGH' }
  ],
  dataSources: [
    { name: 'VirusTotal', status: 'Active' },
    { name: 'PhishTank', status: 'Active' },
    { name: 'URLHaus', status: 'Active' },
    { name: 'AlienVault', status: 'Active' },
    { name: 'AbuseIPDB', status: 'Active' },
    { name: 'OpenPhish', status: 'Active' },
    { name: 'Internal AI', status: 'Active' }
  ]
}
