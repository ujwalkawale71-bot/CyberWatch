import type { URLScanResult } from '../types/urlScanner'

export const urlScannerDemoData: URLScanResult = {
  url: 'https://secure-verify-account.com/login',
  overallScore: 91,
  severity: 'CRITICAL',
  confidence: 95.4,
  scanTime: 'Just now', // Can be updated in component
  engine: 'Heuristic Engine (ML not connected yet)',
  warningMessage: 'This URL is highly likely to be a phishing site. It may steal your credentials or financial data.',
  subScores: [
    { id: 'sub-phish', label: 'Phishing Score', score: 94, maxScore: 100, severity: 'CRITICAL' },
    { id: 'sub-mal', label: 'Malware Score', score: 72, maxScore: 100, severity: 'HIGH' },
    { id: 'sub-rep', label: 'Reputation Score', score: 28, maxScore: 100, severity: 'LOW' },
    { id: 'sub-ssl', label: 'SSL Score', score: 45, maxScore: 100, severity: 'MEDIUM' },
    { id: 'sub-brand', label: 'Brand Similarity', score: 87, maxScore: 100, severity: 'HIGH' },
    { id: 'sub-trend', label: 'Risk Trend', score: 28, maxScore: 100, severity: 'HIGH', trend: 'Increasing +28%' }
  ],
  aiChecks: [
    { id: 'check-1', name: 'Domain Age', finding: '2 days', severity: 'HIGH' },
    { id: 'check-2', name: 'URL Structure', finding: 'Suspicious pattern detected', severity: 'HIGH' },
    { id: 'check-3', name: 'IP/Domain', finding: 'Newly registered domain', severity: 'HIGH' },
    { id: 'check-4', name: 'SSL Certificate', finding: 'Self-signed/Invalid', severity: 'MEDIUM' },
    { id: 'check-5', name: 'Redirections', finding: '2 suspicious redirects', severity: 'HIGH' },
    { id: 'check-6', name: 'Form Analysis', finding: 'Credential form detected', severity: 'HIGH' },
    { id: 'check-7', name: 'External Links', finding: 'Multiple external domains', severity: 'MEDIUM' },
    { id: 'check-8', name: 'Brand Similarity', finding: "Similar to 'PayPal'", severity: 'HIGH' },
    { id: 'check-9', name: 'Threat Intelligence', finding: 'Found in phishing database', severity: 'CRITICAL' },
    { id: 'check-10', name: 'Blacklist Status', finding: 'Listed in 3 blacklists', severity: 'CRITICAL' }
  ],
  radarData: [
    { subject: 'URL Structure', currentScore: 92, baselineScore: 15 },
    { subject: 'Domain Reputation', currentScore: 88, baselineScore: 10 },
    { subject: 'SSL Security', currentScore: 55, baselineScore: 95 },
    { subject: 'Content Analysis', currentScore: 90, baselineScore: 20 },
    { subject: 'Threat Intelligence', currentScore: 95, baselineScore: 5 },
    { subject: 'Behavior Analysis', currentScore: 82, baselineScore: 12 }
  ],
  intelMatches: [
    { id: 'match-1', source: 'PhishTank', matchValue: 'secure-verify-account.com', type: 'PHISHING', confidence: 100 },
    { id: 'match-2', source: 'URLHaus', matchValue: 'secure-verify-account.com/login', type: 'MALWARE', confidence: 85 },
    { id: 'match-3', source: 'Google Safe Browsing', matchValue: 'Warning: Deceptive Site', type: 'DECEPTIVE', confidence: 90 },
    { id: 'match-4', source: 'ThreatFox', matchValue: 'Known malicious activity', type: 'MALICIOUS', confidence: 80 },
    { id: 'match-5', source: 'OpenPhish', matchValue: 'Phishing target detected', type: 'PHISHING', confidence: 95 }
  ],
  preview: {
    title: 'PayPal - Secure Login',
    description: 'Log in to your PayPal account',
    ipAddress: '185.199.108.153',
    hostingProvider: 'Cloudflare, Inc.',
    country: 'United States'
  }
}
