import type { DocChapter } from '../types/docsHelp'

export const docsChapters: DocChapter[] = [
  {
    id: 'ch-overview',
    title: 'CyberWatch Overview',
    status: 'Available',
    description: 'Welcome to the CyberWatch unified browser security operations reference. This dashboard integrates multiple scanner heuristics (URL reputation, website Crawls, extension script audits) and behavior monitors to defend organizational endpoints against phishing, credential harvesting, and malware C2 download beacons.'
  },
  {
    id: 'ch-url-api',
    title: 'URL Scanner API',
    status: 'Available',
    description: 'Performs reputation validation on target URLs using ML structural classifiers and real-time community feed checks.',
    requestPayload: JSON.stringify({
      url: 'https://secure-verify-paypal.com/login',
      deep_scan: true
    }, null, 2),
    responsePayload: JSON.stringify({
      scan_id: 'scan-902a4e',
      url: 'https://secure-verify-paypal.com/login',
      threat_score: 93,
      threat_level: 'CRITICAL',
      category: 'Phishing Portal',
      indicators: [
        'Recent domain creation (< 7 days)',
        'Matches paypal logo signature assets'
      ]
    }, null, 2)
  },
  {
    id: 'ch-web-api',
    title: 'Website Scanner API',
    status: 'Available',
    description: 'Crawl target domains to extract technology stacks, identify security headers, analyze server details, and create screenshots.',
    requestPayload: JSON.stringify({
      domain: 'malicious-site.com',
      crawl_subpages: false
    }, null, 2),
    responsePayload: JSON.stringify({
      domain: 'malicious-site.com',
      risk_score: 88,
      status_code: 200,
      server: 'nginx/1.24.0',
      technologies: ['PHP', 'WordPress', 'MySQL'],
      missing_headers: [
        'Content-Security-Policy',
        'X-Frame-Options',
        'Strict-Transport-Security'
      ]
    }, null, 2)
  },
  {
    id: 'ch-ext-api',
    title: 'Extension Scanner API',
    status: 'Available',
    description: 'Audits uploaded browser extension directories or Chrome Store IDs, analyzing manifest permissions and scanning scripts.',
    requestPayload: JSON.stringify({
      extension_id: 'nmmhkkccbnegglndmbeenhphdgihacne',
      inspect_manifest: true
    }, null, 2),
    responsePayload: JSON.stringify({
      extension_id: 'nmmhkkccbnegglndmbeenhphdgihacne',
      name: 'Chrome AdBlocker Pro',
      manifest_version: 2,
      risk_score: 92,
      dangerous_permissions: [
        '<all_urls>',
        'webRequestBlocking'
      ],
      obfuscation_detected: true
    }, null, 2)
  },
  {
    id: 'ch-beh-api',
    title: 'Behavior Monitor API',
    status: 'Development',
    description: 'Ingests stream telemetry of browser thread executions, cmd parent threads, and local system DLL hooks.',
    requestPayload: JSON.stringify({
      session_id: 'sess-4881',
      event_type: 'process_spawn',
      process_name: 'powershell.exe',
      arguments: '-enc ZQBjAGgAbwAgACIASABhAGMAawBlAGQAIgA='
    }, null, 2),
    responsePayload: JSON.stringify({
      event_id: 'evt-7721',
      action_taken: 'Blocked',
      rule_matched: 'Block PowerShell Obfuscated Command',
      severity: 'CRITICAL'
    }, null, 2)
  },
  {
    id: 'ch-intel-api',
    title: 'Threat Intelligence API',
    status: 'Development',
    description: 'Polls attacking regions, global campaigns indexes, and custom IOC lists.',
    requestPayload: JSON.stringify({
      ioc_type: 'IP',
      value: '185.199.108.153'
    }, null, 2),
    responsePayload: JSON.stringify({
      query: '185.199.108.153',
      reputation: 8,
      classification: 'Ransomware C2 Host',
      country: 'Russia',
      first_seen: '2025-05-09'
    }, null, 2)
  },
  {
    id: 'ch-alerts-api',
    title: 'Alerts API',
    status: 'Available',
    description: 'Query, acknowledge, snooze, or quarantine active security incident logs.',
    requestPayload: JSON.stringify({
      alert_id: 'alt-512',
      resolution: 'acknowledged',
      comment: 'Confirmed malicious update agent exe'
    }, null, 2),
    responsePayload: JSON.stringify({
      alert_id: 'alt-512',
      status: 'Acknowledged',
      updated_by: 'SecOps Admin',
      updated_at: '2025-05-15T11:48:00Z'
    }, null, 2)
  },
  {
    id: 'ch-policy-api',
    title: 'Policy Engine API',
    status: 'Available',
    description: 'API endpoints to check active policies, rule settings, user scopes, and whitelisting overrides.',
    requestPayload: JSON.stringify({
      policy_id: 'pol-item-1',
      status: 'Paused'
    }, null, 2),
    responsePayload: JSON.stringify({
      policy_id: 'pol-item-1',
      updated_status: 'Paused',
      priority: 1,
      rules_count: 5
    }, null, 2)
  },
  {
    id: 'ch-risk-weights',
    title: 'Risk Engine & Weights',
    status: 'Available',
    description: 'Explains risk scoring heuristics calculation inside the CyberWatch core. Scopes are calculated as weighted summation values.',
    requestPayload: JSON.stringify({
      url_weight: 30,
      website_weight: 20,
      extension_weight: 30,
      intel_weight: 20
    }, null, 2),
    responsePayload: JSON.stringify({
      status: 'Weights Updated',
      total_sum: 100,
      engine_reload: 'Success'
    }, null, 2)
  },
  {
    id: 'ch-auth-planned',
    title: 'Authentication (Planned)',
    status: 'Planned',
    description: 'Exchanges client secrets or OAuth session cookies for JWT keys. This API is currently planned for future system releases.'
  }
]
