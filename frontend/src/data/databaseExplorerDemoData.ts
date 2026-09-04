import type { KpiCardData, DbRecord } from '../types/databaseExplorer'

export const dbKpiData: KpiCardData[] = [
  { id: 'db-kpi-1', label: 'Total Records', value: '1,248,573', subtext: 'Across all collections', iconName: 'Database' },
  { id: 'db-kpi-2', label: 'URL/Domains', value: '512,324', subtext: '41.1% of total', iconName: 'Link2' },
  { id: 'db-kpi-3', label: 'IP Addresses', value: '214,892', subtext: '17.2% of total', iconName: 'Server' },
  { id: 'db-kpi-4', label: 'Browser Extensions', value: '98,431', subtext: '7.9% of total', iconName: 'Puzzle' },
  { id: 'db-kpi-5', label: 'Files/Hashes', value: '156,773', subtext: '12.6% of total', iconName: 'FileText' },
  { id: 'db-kpi-6', label: 'Behavior Events', value: '265,153', subtext: '21.3% of total', iconName: 'Activity' }
]

export const dbDemoRecords: DbRecord[] = [
  {
    id: 'REC-091A4',
    type: 'URL',
    value: 'secure-paypal-login.com/verify',
    threatLevel: 'CRITICAL',
    source: 'Web Scanner',
    firstSeen: '2025-05-10',
    lastSeen: '2025-05-15',
    reputationScore: 12,
    category: 'Phishing Page',
    indicators: [
      'Credential harvesting form detected',
      'Fake secure seal graphic matches',
      'Recent domain creation (< 7 days)'
    ],
    contentMatchPercent: 94,
    location: 'United States',
    ipRange: '185.199.108.0/24',
    tags: ['phishing', 'credential-theft', 'paypal', 'fake-login'],
    related: { ips: 1, domains: 1, files: 0, behaviors: 3, alerts: 4 }
  },
  {
    id: 'REC-119D2',
    type: 'IP',
    value: '185.199.108.153',
    threatLevel: 'CRITICAL',
    source: 'Threat Intel Feed',
    firstSeen: '2025-05-09',
    lastSeen: '2025-05-15',
    reputationScore: 8,
    category: 'Malware C2 Server',
    indicators: [
      'Host resolved to known ransomware campaign',
      'High volume of outgoing connections',
      'IP listed in community blocklists'
    ],
    contentMatchPercent: 100,
    location: 'Russia',
    ipRange: '185.199.108.153/32',
    tags: ['c2-botnet', 'malware', 'ransomware'],
    related: { ips: 1, domains: 12, files: 4, behaviors: 12, alerts: 18 }
  },
  {
    id: 'REC-054C1',
    type: 'Domain',
    value: 'malicious-site.com',
    threatLevel: 'HIGH',
    source: 'Threat Intel Feed',
    firstSeen: '2025-05-08',
    lastSeen: '2025-05-14',
    reputationScore: 22,
    category: 'Typosquatting',
    indicators: [
      'Domain name mimics famous bank portals',
      'Hosting server matches rogue provider',
      'No valid DNS security tokens (DNSSEC)'
    ],
    contentMatchPercent: 88,
    location: 'Germany',
    ipRange: '103.224.182.0/24',
    tags: ['phishing', 'banking-theft'],
    related: { ips: 2, domains: 1, files: 0, behaviors: 5, alerts: 8 }
  },
  {
    id: 'REC-098F3',
    type: 'Extension',
    value: 'Chrome AdBlocker Pro',
    threatLevel: 'CRITICAL',
    source: 'Extension Scanner',
    firstSeen: '2025-05-07',
    lastSeen: '2025-05-13',
    reputationScore: 15,
    category: 'Malicious Extension',
    indicators: [
      'Requesting all_urls and cookies permission',
      'Includes obfuscated remote payloads',
      'Unrecognized publisher credentials'
    ],
    contentMatchPercent: 92,
    location: 'United States',
    ipRange: 'N/A',
    tags: ['malicious-extension', 'spyware'],
    related: { ips: 4, domains: 8, files: 1, behaviors: 16, alerts: 12 }
  },
  {
    id: 'REC-041B2',
    type: 'File',
    value: 'win-update-agent.exe',
    threatLevel: 'CRITICAL',
    source: 'Download Scanner',
    firstSeen: '2025-05-06',
    lastSeen: '2025-05-12',
    reputationScore: 5,
    category: 'Ransomware Loader',
    indicators: [
      'SHA-256 matches known LockBit signature',
      'Attempts explorer injection behaviors',
      'Undocumented compiler indicators'
    ],
    contentMatchPercent: 98,
    location: 'France',
    ipRange: 'N/A',
    tags: ['malware', 'executable', 'lockbit'],
    related: { ips: 12, domains: 6, files: 2, behaviors: 28, alerts: 22 }
  },
  {
    id: 'REC-077H1',
    type: 'Hash',
    value: 'd67a84ff10be8b556f8cd53ba2132e4d',
    threatLevel: 'HIGH',
    source: 'Threat Intel Feed',
    firstSeen: '2025-05-05',
    lastSeen: '2025-05-11',
    reputationScore: 28,
    category: 'Trojan Signature',
    indicators: [
      'Signature match for Emotet downloader',
      'Attempts automatic system startup triggers'
    ],
    contentMatchPercent: 85,
    location: 'N/A',
    ipRange: 'N/A',
    tags: ['emotet', 'trojan', 'hash'],
    related: { ips: 8, domains: 3, files: 1, behaviors: 9, alerts: 11 }
  },
  {
    id: 'REC-121S2',
    type: 'Behavior',
    value: 'Script Injection Attempt',
    threatLevel: 'MEDIUM',
    source: 'Behavior Monitor',
    firstSeen: '2025-05-04',
    lastSeen: '2025-05-10',
    reputationScore: 45,
    category: 'Code Injection',
    indicators: [
      'Browser script attempted loading unsigned dll',
      'Powershell command string containing base64'
    ],
    contentMatchPercent: 68,
    location: 'United Kingdom',
    ipRange: 'N/A',
    tags: ['behavior', 'powershell', 'injection'],
    related: { ips: 1, domains: 1, files: 1, behaviors: 1, alerts: 5 }
  },
  {
    id: 'REC-034P1',
    type: 'URL',
    value: 'secure-bank-login-online.com/verify',
    threatLevel: 'HIGH',
    source: 'Web Scanner',
    firstSeen: '2025-05-03',
    lastSeen: '2025-05-09',
    reputationScore: 24,
    category: 'Banking Phishing',
    indicators: [
      'PhishTank reports confirmed domain matches',
      'Includes replica layout templates'
    ],
    contentMatchPercent: 78,
    location: 'Netherlands',
    ipRange: '103.224.182.55/24',
    tags: ['phishing', 'banking'],
    related: { ips: 1, domains: 1, files: 0, behaviors: 2, alerts: 3 }
  },
  {
    id: 'REC-105S5',
    type: 'IP',
    value: '103.224.182.55',
    threatLevel: 'HIGH',
    source: 'Threat Intel Feed',
    firstSeen: '2025-05-02',
    lastSeen: '2025-05-08',
    reputationScore: 19,
    category: 'Exploit Host',
    indicators: [
      'Scans corporate network endpoints daily',
      'Unrecognized service banners returned'
    ],
    contentMatchPercent: 82,
    location: 'Russia',
    ipRange: '103.224.182.55/32',
    tags: ['exploit-scanners', 'botnet'],
    related: { ips: 1, domains: 8, files: 0, behaviors: 4, alerts: 7 }
  },
  {
    id: 'REC-062V1',
    type: 'Domain',
    value: 'secure-verify-billing.net',
    threatLevel: 'MEDIUM',
    source: 'Web Scanner',
    firstSeen: '2025-05-01',
    lastSeen: '2025-05-07',
    reputationScore: 42,
    category: 'Suspicious Portal',
    indicators: [
      'Matches template files of phishing layouts',
      'Domain score is flagged as suspicious'
    ],
    contentMatchPercent: 62,
    location: 'United States',
    ipRange: '45.148.10.0/24',
    tags: ['suspicious', 'billing-fake'],
    related: { ips: 1, domains: 1, files: 0, behaviors: 2, alerts: 2 }
  },
  {
    id: 'REC-055E2',
    type: 'Extension',
    value: 'Custom PDF Editor',
    threatLevel: 'MEDIUM',
    source: 'Extension Scanner',
    firstSeen: '2025-04-30',
    lastSeen: '2025-05-06',
    reputationScore: 55,
    category: 'Adware Extension',
    indicators: [
      'Modifies search query redirects',
      'Publisher has low security rating'
    ],
    contentMatchPercent: 58,
    location: 'Netherlands',
    ipRange: 'N/A',
    tags: ['adware', 'extension'],
    related: { ips: 2, domains: 4, files: 0, behaviors: 6, alerts: 4 }
  },
  {
    id: 'REC-048F1',
    type: 'File',
    value: 'secure-document-scan.pdf',
    threatLevel: 'LOW',
    source: 'Email Scanner',
    firstSeen: '2025-04-28',
    lastSeen: '2025-05-05',
    reputationScore: 74,
    category: 'Suspicious PDF',
    indicators: [
      'Contains redirection scripts',
      'Incorrect metadata fields matched'
    ],
    contentMatchPercent: 48,
    location: 'Germany',
    ipRange: 'N/A',
    tags: ['pdf', 'document'],
    related: { ips: 1, domains: 1, files: 1, behaviors: 1, alerts: 2 }
  },
  {
    id: 'REC-098K4',
    type: 'Hash',
    value: 'e3b0c44298fc1c149afbf4c8996fb924',
    threatLevel: 'SAFE',
    source: 'Download Scanner',
    firstSeen: '2025-04-27',
    lastSeen: '2025-05-04',
    reputationScore: 98,
    category: 'Clean Executable',
    indicators: [
      'Verified global whitelisted agent signature',
      'Signed by trusted corporation'
    ],
    contentMatchPercent: 12,
    location: 'United States',
    ipRange: 'N/A',
    tags: ['safe', 'verified'],
    related: { ips: 0, domains: 0, files: 1, behaviors: 0, alerts: 0 }
  },
  {
    id: 'REC-068B1',
    type: 'Behavior',
    value: 'High Volume Local Reads',
    threatLevel: 'LOW',
    source: 'Behavior Monitor',
    firstSeen: '2025-04-26',
    lastSeen: '2025-05-03',
    reputationScore: 68,
    category: 'Data Audit',
    indicators: [
      'Read 250 local files in under 3 seconds'
    ],
    contentMatchPercent: 32,
    location: 'HQ Network',
    ipRange: 'N/A',
    tags: ['read-activity', 'audit'],
    related: { ips: 0, domains: 0, files: 250, behaviors: 1, alerts: 1 }
  },
  {
    id: 'REC-100W1',
    type: 'URL',
    value: 'google.com',
    threatLevel: 'SAFE',
    source: 'Whitelist',
    firstSeen: '2025-04-25',
    lastSeen: '2025-05-02',
    reputationScore: 100,
    category: 'Trusted Portal',
    indicators: [
      'Globally recognized safe search domain',
      'Includes valid TLS certification'
    ],
    contentMatchPercent: 0,
    location: 'United States',
    ipRange: '142.250.0.0/16',
    tags: ['safe', 'google', 'whitelist'],
    related: { ips: 24, domains: 1, files: 0, behaviors: 0, alerts: 0 }
  }
]
