import type { WebsiteScanResult } from '../types/websiteScanner'

export const websiteScannerDemoData: WebsiteScanResult = {
  url: 'https://example.com',
  domain: 'example.com',
  risk_score: 0,
  risk_level: 'LOW',
  security_verdict: 'LOW RISK',
  confidence: 'HIGH',
  explanation: 'Baseline technical inspection completed.',
  status: 'completed',
  findings: [],
  score_components: [],
  positive_signals: ['DNS resolution successful', 'Valid TLS certificate', 'Website responded successfully'],
  analysis_limitations: [],
  recommendations: ['Follow standard safe browsing practices.'],
  local_analysis_coverage: {
    status: 'FULL',
    percent: 100,
    modules_completed: 9,
    total_modules: 9
  },
  threat_intelligence_coverage: {
    status: 'PARTIAL',
    percent: 25,
    sources_configured: 1,
    sources_total: 4
  },
  threat_intelligence_sources: [],
  security_headers: {
    'Strict-Transport-Security': { status: 'Present' },
    'Content-Security-Policy': { status: 'Present' },
    'X-Content-Type-Options': { status: 'Present' }
  },
  technologies: [
    { name: 'Cloudflare', category: 'CDN & Security' }
  ],
  external_resources: {
    scripts: 1,
    css: 1,
    images: 1,
    iframes: 0,
    unique_domains: 1,
    domains_list: ['example.com']
  }
}
