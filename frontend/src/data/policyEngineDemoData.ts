import type { PolicyEngineResult } from '../types/policyEngine'

export const policyEngineDemoData: PolicyEngineResult = {
  kpis: [
    { id: 'pol-kpi-1', label: 'Total Policies', value: '24', subtext: 'Active policies', iconName: 'FileText' },
    { id: 'pol-kpi-2', label: 'Enforced Policies', value: '21', subtext: '87.5% of total', iconName: 'ShieldCheck' },
    { id: 'pol-kpi-3', label: 'Blocked Actions', value: '1,284', subtext: 'In last 7 days', iconName: 'ShieldOff' },
    { id: 'pol-kpi-4', label: 'Policy Violations', value: '342', subtext: 'In last 7 days', iconName: 'AlertTriangle' },
    { id: 'pol-kpi-5', label: 'Exceptions', value: '18', subtext: 'Active exceptions', iconName: 'FileWarning' },
    { id: 'pol-kpi-6', label: 'Compliance Score', value: '92%', subtext: 'Excellent score', iconName: 'Percent', severity: 'SAFE' }
  ],
  policies: [
    {
      id: 'pol-item-1',
      name: 'Block High Risk Websites',
      description: 'Enforces DNS blocking and path filtering on domains identified as malware hosts, typosquatting vectors, or credential harvesting nodes.',
      priority: 1,
      type: 'Web Protection',
      status: 'Active',
      createdBy: 'SecOps Admin',
      createdOn: 'May 10, 2025',
      lastModified: 'May 15, 2025',
      rules: [
        { name: 'Block Malicious Domains', condition: 'Domain Reputation is Malicious', action: 'Block', severity: 'CRITICAL' },
        { name: 'Block High Risk Domains', condition: 'Domain Reputation is High Risk', action: 'Block', severity: 'HIGH' },
        { name: 'Block Phishing URLs', condition: 'URL Category is Phishing', action: 'Block', severity: 'CRITICAL' },
        { name: 'Block C2 Domains', condition: 'Domain Category is C2/Botnet', action: 'Block', severity: 'HIGH' },
        { name: 'Block Newly Registered Domains', condition: 'Domain Age < 7 days AND Reputation is Unknown', action: 'Warn', severity: 'MEDIUM' }
      ],
      scope: {
        usersIncluded: 'All Users',
        usersExcluded: '1 user (QA Test)',
        groupsIncluded: 'Marketing, Finance, HR',
        groupsExcluded: 'Guests',
        devices: 'All Managed Devices',
        locations: 'All Locations'
      }
    },
    {
      id: 'pol-item-2',
      name: 'Restrict Dangerous Extensions',
      description: 'Restricts browser extension installations based on request permission scope, Store reputation scores, and remote script checks.',
      priority: 2,
      type: 'Extension Control',
      status: 'Active',
      createdBy: 'SecOps Admin',
      createdOn: 'May 08, 2025',
      lastModified: 'May 12, 2025',
      rules: [
        { name: 'Block manifest v2', condition: 'Manifest Version is 2', action: 'Warn', severity: 'MEDIUM' },
        { name: 'Block all_urls access', condition: 'Permission Requests <all_urls>', action: 'Block', severity: 'HIGH' },
        { name: 'Obfuscated payloads', condition: 'Obfuscated Code patterns found', action: 'Block', severity: 'CRITICAL' }
      ],
      scope: {
        usersIncluded: 'All Users',
        usersExcluded: 'None',
        groupsIncluded: 'All Groups',
        groupsExcluded: 'None',
        devices: 'Chrome Browsers',
        locations: 'All Locations'
      }
    },
    {
      id: 'pol-item-3',
      name: 'Phishing Protection Policy',
      description: 'Enforces warning and blocking pages on URLs targeting credential capture fields.',
      priority: 3,
      type: 'Web Protection',
      status: 'Active',
      createdBy: 'SecOps Admin',
      createdOn: 'May 07, 2025',
      lastModified: 'May 11, 2025',
      rules: [
        { name: 'Warn phishing targets', condition: 'Keywords contain login/secure', action: 'Warn', severity: 'MEDIUM' },
        { name: 'Block verified links', condition: 'PhishTank indicators match URL', action: 'Block', severity: 'CRITICAL' }
      ],
      scope: {
        usersIncluded: 'All Users',
        usersExcluded: '3 users',
        groupsIncluded: 'All Groups',
        groupsExcluded: 'QA Tester',
        devices: 'All Workstations',
        locations: 'External Networks'
      }
    },
    {
      id: 'pol-item-4',
      name: 'Data Exfiltration Prevention',
      description: 'Prevents browser scripts from uploading cookie states or storage blobs to external tracker domains.',
      priority: 4,
      type: 'Data Protection',
      status: 'Active',
      createdBy: 'SecOps Admin',
      createdOn: 'May 05, 2025',
      lastModified: 'May 10, 2025',
      rules: [
        { name: 'Block tracker cookies', condition: 'Target endpoint is trackers', action: 'Block', severity: 'CRITICAL' },
        { name: 'Audit storage logs', condition: 'Local storage transfer', action: 'Monitor', severity: 'LOW' }
      ],
      scope: {
        usersIncluded: 'Core Operators',
        usersExcluded: 'None',
        groupsIncluded: 'Finance, Engineering',
        groupsExcluded: 'None',
        devices: 'Secured Workstations',
        locations: 'HQ Network'
      }
    },
    {
      id: 'pol-item-5',
      name: 'Script Injection Prevention',
      description: 'Monitors and terminates explorer/powershell parent calls downloading script code.',
      priority: 5,
      type: 'Behavior Control',
      status: 'Active',
      createdBy: 'SecOps Admin',
      createdOn: 'May 04, 2025',
      lastModified: 'May 09, 2025',
      rules: [
        { name: 'Terminate shell injection', condition: 'Obfuscated command injected', action: 'Block', severity: 'CRITICAL' }
      ],
      scope: {
        usersIncluded: 'Workstation Users',
        usersExcluded: 'None',
        groupsIncluded: 'All Groups',
        groupsExcluded: 'None',
        devices: 'Active Computers',
        locations: 'All Locations'
      }
    },
    {
      id: 'pol-item-6',
      name: 'Malware Download Protection',
      description: 'Blocks browser threads from initiating downloads for high-risk executable types.',
      priority: 6,
      type: 'Web Protection',
      status: 'Active',
      createdBy: 'SecOps Admin',
      createdOn: 'May 03, 2025',
      lastModified: 'May 08, 2025',
      rules: [
        { name: 'Block PE Binaries', condition: 'File extension is EXE/MSI/SCR', action: 'Block', severity: 'CRITICAL' }
      ],
      scope: {
        usersIncluded: 'Standard Users',
        usersExcluded: 'None',
        groupsIncluded: 'Marketing, HR, Finance',
        groupsExcluded: 'Admin',
        devices: 'Desktop PCs',
        locations: 'Remote Locations'
      }
    },
    {
      id: 'pol-item-7',
      name: 'Safe Browsing Policy',
      description: 'Forces Google Safe Browsing verification on browser navigation.',
      priority: 7,
      type: 'Web Protection',
      status: 'Paused',
      createdBy: 'SecOps Admin',
      createdOn: 'May 01, 2025',
      lastModified: 'May 05, 2025',
      rules: [
        { name: 'Force lookup checks', condition: 'SafeBrowsing check is enabled', action: 'Block', severity: 'MEDIUM' }
      ],
      scope: {
        usersIncluded: 'All Users',
        usersExcluded: 'None',
        groupsIncluded: 'All Groups',
        groupsExcluded: 'None',
        devices: 'All Managed Devices',
        locations: 'All Locations'
      }
    },
    {
      id: 'pol-item-8',
      name: 'USB & File Upload Control',
      description: 'Restricts document transfers to external cloud file sharing portals.',
      priority: 8,
      type: 'Data Protection',
      status: 'Inactive',
      createdBy: 'SecOps Admin',
      createdOn: 'April 25, 2025',
      lastModified: 'April 30, 2025',
      rules: [
        { name: 'Block cloud transfer', condition: 'Target URL matches file hosts', action: 'Block', severity: 'HIGH' }
      ],
      scope: {
        usersIncluded: 'All Staff',
        usersExcluded: '5 users',
        groupsIncluded: 'All Groups',
        groupsExcluded: 'IT Staff',
        devices: 'All Laptops',
        locations: 'External Locations'
      }
    }
  ],
  actions: [
    { name: 'Block Access', desc: 'Immediately blocks remote connections and navigation.', iconName: 'Block' },
    { name: 'Show Warning', desc: 'Displays warning interception page to user.', iconName: 'Warn' },
    { name: 'Log Event', desc: 'Registers event triggers inside telemetry database.', iconName: 'Log' },
    { name: 'Notify Admin', desc: 'Dispatches instant alert message to dashboard alerts.', iconName: 'Notify' },
    { name: 'Quarantine Download', desc: 'Blocks downloaded executable and moves to local sandbox.', iconName: 'Quarantine' }
  ],
  exceptions: [
    { id: 'exc-1', name: 'Trusted Banking Sites', type: 'URL', expires: 'May 15, 2026', createdBy: 'SecOps Admin' },
    { id: 'exc-2', name: 'Partner Tools Access', type: 'Domain', expires: 'June 20, 2026', createdBy: 'SecOps Admin' }
  ],
  activityLog: [
    {
      id: 'log-p-1',
      time: '10:48:15 AM',
      policyName: 'Block High Risk Websites',
      event: 'Block Malicious Domains',
      target: 'secure-verify-account.com',
      user: 'john.doe@company.com',
      actionTaken: 'Blocked',
      result: 'Success'
    },
    {
      id: 'log-p-2',
      time: '10:46:21 AM',
      policyName: 'Script Injection Prevention',
      event: 'Terminate shell injection',
      target: 'powershell.exe',
      user: 'alice@company.com',
      actionTaken: 'Blocked',
      result: 'Success'
    },
    {
      id: 'log-p-3',
      time: '10:45:10 AM',
      policyName: 'Malware Download Protection',
      event: 'Block PE Binaries',
      target: 'bank-update-installer.msi',
      user: 'michael@company.com',
      actionTaken: 'Blocked',
      result: 'Success'
    },
    {
      id: 'log-p-4',
      time: '10:43:11 AM',
      policyName: 'Phishing Protection Policy',
      event: 'Warn phishing targets',
      target: 'login-portal-fake.com',
      user: 'david@company.com',
      actionTaken: 'Warned',
      result: 'Warning Ignored'
    },
    {
      id: 'log-p-5',
      time: '10:40:05 AM',
      policyName: 'Block High Risk Websites',
      event: 'Block High Risk Domains',
      target: 'trusted-partner-bank.com',
      user: 'sarah@company.com',
      actionTaken: 'Monitored',
      result: 'Exception Applied'
    }
  ]
}
