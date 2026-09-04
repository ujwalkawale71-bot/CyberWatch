import type { ExtensionScanResult } from '../types/extensionScanner'

export const extensionScannerDemoData: ExtensionScanResult = {
  extensionId: 'aabcbjklmmebngbpkgaldbf...',
  name: 'Free Video Downloader Pro',
  version: '3.2.1',
  manifestVersion: 2,
  overallScore: 93,
  severity: 'CRITICAL',
  confidence: 92.1,
  scanTime: 'Just now',
  engine: 'Heuristic Engine (ML not connected yet)',
  warningMessage: 'This extension exhibits highly suspicious behavior and may compromise your browser security or steal personal data.',
  subScores: [
    { id: 'ext-perm', label: 'Permission Risk', score: 88, maxScore: 100, severity: 'CRITICAL' },
    { id: 'ext-host', label: 'Host Access Risk', score: 95, maxScore: 100, severity: 'CRITICAL' },
    { id: 'ext-code', label: 'Code Risk', score: 60, maxScore: 100, severity: 'HIGH' },
    { id: 'ext-rep', label: 'Reputation Score', score: 20, maxScore: 100, severity: 'LOW' }
  ],
  info: [
    { label: 'Name', value: 'Free Video Downloader Pro' },
    { label: 'Extension ID', value: 'aabcbjklmmebngbpkgaldbf...' },
    { label: 'Version', value: '3.2.1' },
    { label: 'Publisher', value: 'Unknown Developer' },
    { label: 'Manifest Version', value: '2' },
    { label: 'Users', value: '2,400,000+' },
    { label: 'Last Updated', value: 'April 18, 2026' },
    { label: 'Store Rating', value: '3.1 / 5 (12,450 reviews)' }
  ],
  permissions: [
    { name: '<all_urls>', description: 'Access to all websites you visit', severity: 'CRITICAL' },
    { name: 'webRequest', description: 'Intercepts and inspects browser network traffic', severity: 'HIGH' },
    { name: 'webRequestBlocking', description: 'Blocks or modifies browser network requests', severity: 'HIGH' },
    { name: 'tabs', description: 'Reads URLs and titles of all open browser tabs', severity: 'MEDIUM' },
    { name: 'cookies', description: 'Reads and writes website session cookies', severity: 'MEDIUM' },
    { name: 'storage', description: 'Saves extension settings and files locally', severity: 'LOW' },
    { name: 'downloads', description: 'Initiates and manages file downloads', severity: 'MEDIUM' },
    { name: 'management', description: 'Enables, disables or deletes other extensions', severity: 'HIGH' }
  ],
  aiChecks: [
    { id: 'check-1', name: 'Host Permissions', finding: 'Requests access to all websites', severity: 'CRITICAL' },
    { id: 'check-2', name: 'Background Scripts', finding: 'Persistent background process detected', severity: 'MEDIUM' },
    { id: 'check-3', name: 'Obfuscated Code', finding: 'Minified/obfuscated JS patterns found', severity: 'HIGH' },
    { id: 'check-4', name: 'Remote Code Loading', finding: 'Loads scripts from external domain', severity: 'CRITICAL' },
    { id: 'check-5', name: 'Data Exfiltration Pattern', finding: 'Sends data to api.ads-tracking.net', severity: 'CRITICAL' },
    { id: 'check-6', name: 'Publisher Verification', finding: 'Unverified publisher', severity: 'MEDIUM' }
  ],
  radarData: [
    { subject: 'Permissions', currentScore: 88, baselineScore: 10 },
    { subject: 'Host Access', currentScore: 95, baselineScore: 5 },
    { subject: 'Code Risk', currentScore: 60, baselineScore: 15 },
    { subject: 'Behavior', currentScore: 82, baselineScore: 12 },
    { subject: 'Reputation', currentScore: 80, baselineScore: 10 }, // low score -> high risk metric (20 rep = 80 risk)
    { subject: 'Privacy', currentScore: 90, baselineScore: 8 }
  ]
}
