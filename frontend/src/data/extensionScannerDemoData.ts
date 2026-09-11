import type { ExtensionScanResult } from '../types/extensionScanner'
import { mapExtensionScanData } from '../utils/extensionReportMapper'

export const extensionScannerDemoData: ExtensionScanResult = mapExtensionScanData({
  scan_id: 1,
  extension_id: 'aabcbjklmmebngbpkgaldbf...',
  name: 'Free Video Downloader Pro',
  version: '3.2.1',
  manifest_version: 2,
  risk_score: 93,
  risk_level: 'CRITICAL',
  permissions_analyzed: [
    'webRequest',
    'webRequestBlocking',
    'tabs',
    'cookies',
    'storage',
    'downloads',
    'management'
  ],
  host_permissions_analyzed: ['<all_urls>'],
  permission_findings: [
    {
      permission: 'webRequest',
      severity: 'HIGH',
      reason: 'Allows the extension to observe and inspect all network requests made by the browser.'
    },
    {
      permission: 'webRequestBlocking',
      severity: 'HIGH',
      reason: 'Allows the extension to block, redirect, or modify HTTP requests and responses.'
    },
    {
      permission: 'tabs',
      severity: 'MEDIUM',
      reason: 'Allows the extension to access metadata of open browser tabs.'
    },
    {
      permission: 'cookies',
      severity: 'MEDIUM',
      reason: 'Allows reading and writing cookies for websites within host permissions.'
    },
    {
      permission: 'storage',
      severity: 'LOW',
      reason: 'Allows local storage access for extension preferences.'
    },
    {
      permission: 'downloads',
      severity: 'MEDIUM',
      reason: 'Allows the extension to initiate and manage file downloads.'
    },
    {
      permission: 'management',
      severity: 'HIGH',
      reason: 'Grants control over other installed browser extensions.'
    }
  ],
  host_findings: [
    {
      permission: '<all_urls>',
      severity: 'CRITICAL',
      reason: 'Host permission grants access to all websites.'
    }
  ],
  combination_findings: [
    {
      combination: ['webRequest', 'webRequestBlocking', '<all_urls>'],
      extra_score: 20,
      severity: 'CRITICAL',
      reason: 'Full traffic interception: Enables extension to silently intercept, read, and modify all traffic.'
    }
  ],
  manifest_finding: {
    check: 'Manifest Version',
    value: 'Manifest V2',
    severity: 'LOW',
    reason: 'Uses Manifest V2 which supports deprecated webRequestBlocking.'
  },
  metadata_issues: [],
  summary: 'Critical threat risk detected: Extension combines high-risk privileges that warrant immediate removal.',
  engine: 'CyberWatch Extension Analyzer 1.0',
  status: 'completed'
})
