import type { WebsiteScanResult } from '../types/websiteScanner'

export const websiteScannerDemoData: WebsiteScanResult = {
  url: 'https://example.com',
  overallScore: 78,
  severity: 'HIGH',
  confidence: 89.6,
  scanTime: 'Just now',
  engine: 'Heuristic Engine (ML not connected yet)',
  warningMessage: 'This website poses a potential security risk. It may contain malicious content or engage in harmful activities.',
  subScores: [
    { id: 'web-mal', label: 'Malware Score', score: 72, maxScore: 100, severity: 'HIGH' },
    { id: 'web-phish', label: 'Phishing Score', score: 85, maxScore: 100, severity: 'CRITICAL' },
    { id: 'web-rep', label: 'Reputation Score', score: 40, maxScore: 100, severity: 'MEDIUM' },
    { id: 'web-content', label: 'Content Score', score: 65, maxScore: 100, severity: 'HIGH' },
    { id: 'web-ssl', label: 'SSL Score', score: 90, maxScore: 100, severity: 'SAFE' },
    { id: 'web-trend', label: 'Risk Trend', score: 32, maxScore: 100, severity: 'HIGH', trend: 'Increasing +32%' }
  ],
  info: [
    { label: 'Domain', value: 'example.com' },
    { label: 'IP Address', value: '93.184.216.34' },
    { label: 'Hosting Provider', value: 'Cloudflare Inc.' },
    { label: 'Server Location', value: 'United States' },
    { label: 'Domain Age', value: '2 years 6 months' },
    { label: 'Last Updated', value: 'May 12, 2026' },
    { label: 'Content Type', value: 'text/html' },
    { label: 'Status Code', value: '200 OK' },
    { label: 'Protocol', value: 'HTTPS' },
    { label: 'WHOIS Privacy', value: 'Enabled' }
  ],
  aiChecks: [
    { id: 'check-1', name: 'Malicious Scripts', finding: '3 suspicious scripts detected', severity: 'HIGH' },
    { id: 'check-2', name: 'Iframes', finding: '5 potentially malicious iframes', severity: 'HIGH' },
    { id: 'check-3', name: 'Redirections', finding: '2 suspicious redirects found', severity: 'MEDIUM' },
    { id: 'check-4', name: 'Suspicious Forms', finding: '1 credential form detected', severity: 'HIGH' },
    { id: 'check-5', name: 'External Links', finding: '8 links to suspicious domains', severity: 'MEDIUM' },
    { id: 'check-6', name: 'Content Analysis', finding: 'Potentially harmful content', severity: 'HIGH' },
    { id: 'check-7', name: 'Blacklist Status', finding: 'Listed in 2 blacklists', severity: 'CRITICAL' },
    { id: 'check-8', name: 'Behavior Analysis', finding: 'Suspicious behavior patterns', severity: 'HIGH' }
  ],
  radarData: [
    { subject: 'Malware', currentScore: 72, baselineScore: 10 },
    { subject: 'Phishing', currentScore: 85, baselineScore: 5 },
    { subject: 'Reputation', currentScore: 60, baselineScore: 90 },
    { subject: 'Content', currentScore: 65, baselineScore: 15 },
    { subject: 'SSL Security', currentScore: 10, baselineScore: 95 }, // Safe is score 90 (risk is 10)
    { subject: 'Behavior', currentScore: 80, baselineScore: 12 }
  ],
  intelMatches: [
    { id: 'match-1', source: 'example.com', matchValue: 'Known phishing campaign', type: 'PHISHING', confidence: 95 },
    { id: 'match-2', source: 'example.com/scripts/evil.js', matchValue: 'Malicious JavaScript file', type: 'MALWARE', confidence: 90 },
    { id: 'match-3', source: 'cdn.badcontent.com', matchValue: 'Malicious content delivery network', type: 'MALICIOUS', confidence: 85 },
    { id: 'match-4', source: 'example.com/redirect', matchValue: 'Suspicious redirect chain', type: 'SUSPICIOUS', confidence: 80 },
    { id: 'match-5', source: 'example.com/login', matchValue: 'Credential harvesting form', type: 'PHISHING', confidence: 94 }
  ],
  technologies: [
    { name: 'Cloudflare', category: 'CDN' },
    { name: 'WordPress', category: 'CMS', version: 'v6.4.2' },
    { name: 'jQuery', category: 'JavaScript Library', version: 'v3.7.1' },
    { name: 'Google Analytics', category: 'Analytics' },
    { name: 'reCAPTCHA', category: 'Security', version: 'v2' }
  ],
  securityHeaders: [
    { name: 'Content-Security-Policy', status: 'Present' },
    { name: 'Strict-Transport-Security', status: 'Present' },
    { name: 'X-Content-Type-Options', status: 'Present' },
    { name: 'X-Frame-Options', status: 'Missing' },
    { name: 'Referrer-Policy', status: 'Present' },
    { name: 'Permissions-Policy', status: 'Missing' }
  ]
}
