import type { AlertsResult } from '../types/alerts'

export const alertsDemoData: AlertsResult = {
  kpis: [
    { id: 'alert-kpi-1', label: 'Total Alerts', value: '1,284', trend: '+24.6%', trendType: 'up', severity: 'LOW' },
    { id: 'alert-kpi-2', label: 'Critical Alerts', value: '156', trend: '+18.3%', trendType: 'up', severity: 'CRITICAL' },
    { id: 'alert-kpi-3', label: 'High Alerts', value: '478', trend: '+22.7%', trendType: 'up', severity: 'HIGH' },
    { id: 'alert-kpi-4', label: 'Medium Alerts', value: '512', trend: '-8.5%', trendType: 'down', severity: 'MEDIUM' },
    { id: 'alert-kpi-5', label: 'Low Alerts', value: '138', trend: '-12.2%', trendType: 'down', severity: 'LOW' }
  ],
  alerts: [
    {
      id: 'alert-item-1',
      time: '10:48:15 AM',
      name: 'Phishing URL Detected',
      source: 'URL Scanner',
      type: 'Phishing',
      severity: 'CRITICAL',
      status: 'Blocked',
      details: {
        description: 'This URL is identified as a phishing page designed to steal user credentials. It mimics PayPal login page and is hosted on a suspicious domain.',
        keyValues: [
          { label: 'Source', value: 'URL Scanner' },
          { label: 'Type', value: 'Phishing' },
          { label: 'Severity', value: 'Critical', isColored: true, severity: 'CRITICAL' },
          { label: 'Confidence Score', value: '95%' },
          { label: 'URL', value: 'https://secure-verify-account.com/verify' },
          { label: 'IP Address', value: '185.199.108.153' },
          { label: 'Country', value: 'United States' },
          { label: 'First Seen', value: '15 May 2025, 10:47 AM' }
        ],
        matchedIndicators: [
          'Domain is newly registered (2 days ago)',
          "Similar to known phishing kit: 'login-page-phish-kit'",
          'Contains suspicious form action to external domain',
          'Detected in multiple threat intelligence feeds'
        ],
        recommendedActions: [
          'Block this URL',
          'Warn user if visited',
          'Scan related domains',
          'Add to blacklist'
        ],
        relatedIocs: [
          { label: 'Domain', value: 'secure-verify-account.com' },
          { label: 'IP Address', value: '185.199.108.153' },
          { label: 'SHA256', value: 'd7cf8za9b8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3e4b1c2' },
          { label: 'SSL Issuer', value: "Let's Encrypt" },
          { label: 'ASN', value: 'AS13335 Cloudflare Inc.' }
        ]
      }
    },
    {
      id: 'alert-item-2',
      time: '10:47:02 AM',
      name: 'Malicious Extension Detected',
      source: 'Extension Scanner',
      type: 'Malicious Ext.',
      severity: 'HIGH',
      status: 'Blocked',
      details: {
        description: "The extension 'Free Video Downloader Pro' requested high-risk permissions and background scripts contain patterns matching credential theft logs.",
        keyValues: [
          { label: 'Source', value: 'Extension Scanner' },
          { label: 'Type', value: 'Malicious Ext.' },
          { label: 'Severity', value: 'High', isColored: true, severity: 'HIGH' },
          { label: 'Extension ID', value: 'aabcbjklmmebngbpkgaldbf...' },
          { label: 'Publisher', value: 'Unknown Developer' },
          { label: 'Manifest Version', value: '2' },
          { label: 'Active Users', value: '2,400,000+' },
          { label: 'Store Rating', value: '3.1 / 5 (12,450 reviews)' }
        ],
        matchedIndicators: [
          'Requests access to all URLs (<all_urls>)',
          'Implements webRequestBlocking API to intercept network calls',
          'Code contains obfuscated and minified JS patterns',
          'Connects to remote unverified tracking domains'
        ],
        recommendedActions: [
          'Disable extension in browser',
          'Sandbox local run session',
          'File abuse report to web store',
          'Block publisher C2 domain'
        ],
        relatedIocs: [
          { label: 'Extension ID', value: 'aabcbjklmmebngbpkgaldbf...' },
          { label: 'C2 Domain', value: 'api.ads-tracking.net' },
          { label: 'SHA256', value: 'e8c7d3ba519be40a6b7dcf0b15cf48e1a6c117b8f9e61dbf8d424b9015c9a01cf' },
          { label: 'Manifest Version', value: '2' },
          { label: 'Publisher Status', value: 'Unverified' }
        ]
      }
    },
    {
      id: 'alert-item-3',
      time: '10:46:21 AM',
      name: 'Suspicious PowerShell Activity',
      source: 'Behavior Monitor',
      type: 'Code Injection',
      severity: 'HIGH',
      status: 'Blocked',
      details: {
        description: 'Process powershell.exe executed an obfuscated base64 payload designed to download and execute code from an external staging server.',
        keyValues: [
          { label: 'Source', value: 'Behavior Monitor' },
          { label: 'Type', value: 'Code Injection' },
          { label: 'Severity', value: 'High', isColored: true, severity: 'HIGH' },
          { label: 'PID', value: '3412' },
          { label: 'Parent Process', value: 'explorer.exe' },
          { label: 'Host Name', value: 'SEC-DESKTOP-4' },
          { label: 'Active User', value: 'SecOps Admin' },
          { label: 'System OS', value: 'Windows 11 Pro 23H2' }
        ],
        matchedIndicators: [
          'Obfuscated base64 script parameters detected',
          'Attempts network connections to external IP on Port 8080',
          'Spawns sub-process cmd.exe command line prompt',
          'Modifies local registry startup key registry records'
        ],
        recommendedActions: [
          'Terminate process PID 3412',
          'Quarantine host workstation',
          'Trigger EDR full scan',
          'Revoke active user session'
        ],
        relatedIocs: [
          { label: 'Executable', value: 'powershell.exe' },
          { label: 'Staging URL', value: 'http://staging-server.net/payload.bin' },
          { label: 'Host IP Address', value: '185.199.108.201' },
          { label: 'User Context', value: 'SecOps Admin' },
          { label: 'Host Identifier', value: 'SEC-DESKTOP-4' }
        ]
      }
    },
    {
      id: 'alert-item-4',
      time: '10:45:10 AM',
      name: 'Malicious Website Blocked',
      source: 'Website Scanner',
      type: 'Drive-by Download',
      severity: 'MEDIUM',
      status: 'Blocked',
      details: {
        description: 'The website fake-bank-update.net hosts a drive-by-download payload designed to inject Trojan-horse binaries into target browsers.',
        keyValues: [
          { label: 'Source', value: 'Website Scanner' },
          { label: 'Type', value: 'Drive-by Download' },
          { label: 'Severity', value: 'Medium', isColored: true, severity: 'MEDIUM' },
          { label: 'Domain', value: 'fake-bank-update.net' },
          { label: 'Risk Rating', value: '74 / 100' },
          { label: 'Detected Engines', value: '42 / 90 matches' },
          { label: 'Host IP Address', value: '104.22.44.156' }
        ],
        matchedIndicators: [
          'Drive-by payload script tags detected in iframe sources',
          'Typosquatting domain targeting institutional banks',
          'SSL certificate expires in under 3 days',
          'Loads scripts from blacklisted remote IP nodes'
        ],
        recommendedActions: [
          'Update DNS block list',
          'Quarantine downloaded files',
          'Alert corporate users',
          'Verify browser versions'
        ],
        relatedIocs: [
          { label: 'Domain Name', value: 'fake-bank-update.net' },
          { label: 'Host IP', value: '104.22.44.156' },
          { label: 'Payload file', value: 'bank-update-installer.msi' },
          { label: 'SSL Issuer', value: "Let's Encrypt" },
          { label: 'Country location', value: 'Romania' }
        ]
      }
    },
    {
      id: 'alert-item-5',
      time: '10:44:05 AM',
      name: 'Unusual Network Connection',
      source: 'Behavior Monitor',
      type: 'Crypto Mining',
      severity: 'MEDIUM',
      status: 'Monitored',
      details: {
        description: 'A browser tab established a secure WebSockets session to a known crypto-mining pool IP address, utilizing system CPUs for background hashing.',
        keyValues: [
          { label: 'Source', value: 'Behavior Monitor' },
          { label: 'Type', value: 'Crypto Mining' },
          { label: 'Severity', value: 'Medium', isColored: true, severity: 'MEDIUM' },
          { label: 'Remote IP Address', value: '185.199.108.133' },
          { label: 'Port', value: '443 (HTTPS)' },
          { label: 'Open Tab ID', value: '12' },
          { label: 'Browser Process', value: 'chrome.exe' },
          { label: 'Active Threads', value: '4' }
        ],
        matchedIndicators: [
          'Established network connection to known mining pool',
          'Sustained CPU usage peaks above 95%',
          'WebSockets connections established inside background scripts',
          'No user-initiated click events recorded'
        ],
        recommendedActions: [
          'Close active browser tab',
          'Block IP 185.199.108.133',
          'Limit process CPU quota',
          'Update web-miner definitions'
        ],
        relatedIocs: [
          { label: 'IP Address', value: '185.199.108.133' },
          { label: 'Target Pool Domain', value: 'pool.coinhive-miner.org' },
          { label: 'Network Port', value: '443 (WebSockets)' },
          { label: 'Process Name', value: 'chrome.exe' },
          { label: 'CPU Usage rate', value: '98%' }
        ]
      }
    },
    {
      id: 'alert-item-6',
      time: '10:43:11 AM',
      name: 'New IOC Match Found',
      source: 'Threat Intelligence',
      type: 'Threat Feed Match',
      severity: 'LOW',
      status: 'Logged',
      details: {
        description: 'The threat intelligence feed reported matches for malicious-site.com on several phishing watchlists. Domain is active.',
        keyValues: [
          { label: 'Source', value: 'Threat Intelligence' },
          { label: 'Type', value: 'Threat Feed Match' },
          { label: 'Severity', value: 'Low', isColored: true, severity: 'LOW' },
          { label: 'Indicator Name', value: 'malicious-site.com' },
          { label: 'Feed Source Name', value: 'AbuseIPDB' },
          { label: 'Total Reports', value: '124 matches' },
          { label: 'Match Date Time', value: 'May 15, 2025' }
        ],
        matchedIndicators: [
          'Reported as malicious domain inside blacklists',
          'Typosquatting of domain: malicious-site.com',
          'IP associated with adware distribution networks',
          'Unverified registrar records for domain name'
        ],
        recommendedActions: [
          'Flag threat logs',
          'Add to telemetry watchlist',
          'Run passive DNS queries',
          'Check internal email gateway'
        ],
        relatedIocs: [
          { label: 'Domain Indicator', value: 'malicious-site.com' },
          { label: 'Registrar name', value: 'NameSilo LLC' },
          { label: 'IP Range block', value: '192.168.10.1' },
          { label: 'Feed Name', value: 'abuse_feed_db' },
          { label: 'Severity Score', value: '28 / 100' }
        ]
      }
    },
    {
      id: 'alert-item-7',
      time: '10:42:33 AM',
      name: 'Data Exfiltration Attempt',
      source: 'Behavior Monitor',
      type: 'Data Leak',
      severity: 'HIGH',
      status: 'Blocked',
      details: {
        description: 'A browser extension attempted to send local cookie data to an external, unverified tracking API endpoint without user consent.',
        keyValues: [
          { label: 'Source', value: 'Behavior Monitor' },
          { label: 'Type', value: 'Data Leak' },
          { label: 'Severity', value: 'High', isColored: true, severity: 'HIGH' },
          { label: 'Extension ID', value: 'extension_id:abc123' },
          { label: 'Target URL Link', value: 'api.tracking-endpoint.com' },
          { label: 'Data Payload Type', value: 'session_cookies' },
          { label: 'Action Status Key', value: 'Blocked' }
        ],
        matchedIndicators: [
          'Exfiltrates browser session cookies',
          'Remote network payload transfer detected',
          'Extension publisher is unverified',
          'Background script triggers without click events'
        ],
        recommendedActions: [
          'Quarantine extension',
          'Revoke active session tokens',
          'Update C2 network blocklist',
          'Audit host browser configurations'
        ],
        relatedIocs: [
          { label: 'Extension ID', value: 'extension_id:abc123' },
          { label: 'API Endpoint Domain', value: 'api.tracking-endpoint.com' },
          { label: 'Payload data size', value: '4.2 KB' },
          { label: 'Target session key', value: 'OAuth session cookie' }
        ]
      }
    },
    {
      id: 'alert-item-8',
      time: '10:41:50 AM',
      name: 'Suspicious Redirect Chain',
      source: 'URL Scanner',
      type: 'Malicious Redirect',
      severity: 'MEDIUM',
      status: 'Warning',
      details: {
        description: 'User navigation triggered a series of 5 rapid redirects, concluding at a fake anti-virus landing page prompting a download.',
        keyValues: [
          { label: 'Source', value: 'URL Scanner' },
          { label: 'Type', value: 'Malicious Redirect' },
          { label: 'Severity', value: 'Medium', isColored: true, severity: 'MEDIUM' },
          { label: 'Start URL Link', value: 'suspicious-redirect.com' },
          { label: 'Redirect count', value: '5 hops' },
          { label: 'Final URL Link', value: 'fake-av-download.info' },
          { label: 'Referrer context', value: 'search-portal.com' }
        ],
        matchedIndicators: [
          'Rapid redirect loops detected',
          'Typosquatting domains mapped in redirect loop',
          'Final landing page contains scareware script alert',
          'User interaction block is bypass attempt'
        ],
        recommendedActions: [
          'Block starting domain',
          'Warn navigation attempts',
          'Scan cache directories',
          'Update browser security headers'
        ],
        relatedIocs: [
          { label: 'Start Domain', value: 'suspicious-redirect.com' },
          { label: 'Final Domain', value: 'fake-av-download.info' },
          { label: 'Redirect hops', value: '5 redirects' },
          { label: 'Referrer URL', value: 'search-portal.com' },
          { label: 'Country location', value: 'Panama' }
        ]
      }
    }
  ],
  distribution: [
    { day: 'May 09', critical: 10, high: 32, medium: 45, low: 12 },
    { day: 'May 10', critical: 12, high: 38, medium: 52, low: 15 },
    { day: 'May 11', critical: 8, high: 42, medium: 48, low: 10 },
    { day: 'May 12', critical: 15, high: 35, medium: 50, low: 18 },
    { day: 'May 13', critical: 22, high: 48, medium: 58, low: 22 },
    { day: 'May 14', critical: 30, high: 54, medium: 62, low: 25 },
    { day: 'May 15', critical: 25, high: 45, medium: 56, low: 20 }
  ],
  sources: [
    { name: 'URL Scanner', value: 364, percentage: 28.4, color: '#3b82f6' },
    { name: 'Website Scanner', value: 286, percentage: 22.3, color: '#10b981' },
    { name: 'Extension Scanner', value: 240, percentage: 18.7, color: '#a855f7' },
    { name: 'Behavior Monitor', value: 258, percentage: 20.1, color: '#f59e0b' },
    { name: 'Threat Intelligence', value: 136, percentage: 10.5, color: '#06b6d4' }
  ]
}
