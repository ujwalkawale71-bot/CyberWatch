import type {
  ExtensionScanResult,
  RiskSeverity,
  PermissionAnalysisItem,
  HostPermissionItem,
  CombinationFindingItem,
  SecurityHighlightItem,
  ExtensionStructureInfo,
  ModuleStatusItem,
  RecommendedActionPlan,
  SubScoreItem,
  ExtensionInfoItem,
  AICheckItem,
  RadarDataPoint,
  AnalysisCoverageInfo
} from '../types/extensionScanner'

const PERMISSION_WHY_IT_MATTERS: Record<string, string> = {
  debugger:
    'Grants Chrome DevTools Protocol access. Allows programmatic control of any web page, including inspecting memory, reading form inputs, injecting scripts, and modifying live DOM state.',
  nativeMessaging:
    'Allows the extension to communicate with binary applications installed on the host operating system, effectively bypassing the browser security sandbox. If compromised, this can lead to local command execution.',
  '<all_urls>':
    'Universal access: The extension can read and modify content on every website you visit, including confidential accounts, enterprise dashboards, webmail, and banking portals.',
  'http://*/*':
    'Universal non-HTTPS access: Allows reading and modifying data on all unencrypted HTTP websites, exposing traffic to interception and script injection.',
  'https://*/*':
    'Universal HTTPS access: Allows reading and modifying data on all secure HTTPS websites after TLS decryption in the browser.',
  '*://*/*':
    'Universal host wildcard: Equivalent to <all_urls>. Grants full read and write access to all web origins.',
  webRequestBlocking:
    'Allows synchronously intercepting, modifying, redirecting, or blocking network requests before they reach the browser engine. Deprecated in Manifest V3 due to severe security risks.',
  webRequest:
    'Allows observing and inspecting all HTTP/S network traffic. When paired with host permissions, can monitor request URLs, headers, and query parameters across sites.',
  management:
    'Allows managing other extensions, including inspecting their permissions or silently disabling security, ad-blocking, or password manager extensions.',
  privacy:
    'Grants access to browser privacy settings. Allows modifying security features such as WebRTC IP handling, third-party cookie blocking, and safe browsing.',
  proxy:
    'Allows reconfiguring browser proxy settings, which can route all network requests through an unauthorized remote proxy server.',
  tabs:
    'Allows reading metadata (URLs, page titles, and favicons) for all open tabs across windows, enabling continuous user behavioral tracking.',
  activeTab:
    'Grants temporary, user-invoked access to the active page DOM and scripting APIs. Low risk because it requires explicit user interaction.',
  cookies:
    'Allows reading, writing, and deleting stored browser cookies. Can be used to extract active session tokens and hijack authenticated sessions.',
  history:
    'Grants full read and write access to the user browser history, visit timestamps, and search queries, posing high personal privacy risks.',
  bookmarks:
    'Allows reading, modifying, or deleting saved bookmarks and folder hierarchies.',
  downloads:
    'Allows initiating, pausing, and deleting file downloads without separate confirmation dialogs for each file.',
  scripting:
    'Allows injecting JavaScript and CSS into web pages. Enables modifying page content, extracting data, or adding interactive features.',
  clipboardRead:
    'Allows reading the contents of the operating system clipboard. Can capture passwords, private keys, or personal text copied by the user.',
  clipboardWrite:
    'Allows overwriting the system clipboard, potentially altering addresses or text the user intends to paste.',
  geolocation:
    'Allows reading the physical geographic location of the device using browser location APIs.',
  storage:
    'Allows storing extension preferences and cached data locally in the browser profile. Standard and safe for benign extensions.',
  identity:
    'Provides OAuth2 authentication support for signed-in user profiles. Limited risk unless excessive identity scopes are requested.',
  notifications:
    'Allows displaying desktop notification alerts. Low risk, though potentially abused for spam or phishing notifications.',
  contextMenus:
    'Allows adding custom items to the browser right-click menu. Standard UI capability.',
  alarms:
    'Allows scheduling periodic background tasks. Standard utility for background scheduling.',
  idle:
    'Allows detecting when the computer enters an idle or locked state.'
}

const BROAD_HOST_PATTERNS = ['<all_urls>', 'http://*/*', 'https://*/*', '*://*/*']

export function mapExtensionScanData(
  backendData: any,
  clientManifest?: any
): ExtensionScanResult {
  const isLimited = backendData.analysis_coverage?.level === 'LIMITED_ANALYSIS' || backendData.risk_level === 'LIMITED'
  const rawScore = backendData.risk_score ?? backendData.score
  const score: number | null = isLimited || rawScore == null ? null : Math.round(rawScore)
  const severity = (backendData.risk_level || (isLimited ? 'LIMITED' : 'SAFE')) as RiskSeverity
  const extensionId = backendData.extension_id || 'N/A'
  const name = backendData.name || clientManifest?.name || 'Unnamed Extension'
  const version = backendData.version || clientManifest?.version || 'N/A'
  const developer = backendData.developer || undefined
  const storeUrl = backendData.store_url || undefined
  const rating = backendData.rating || undefined
  const ratingCount = backendData.rating_count || undefined
  const users = backendData.users || undefined
  const website = backendData.website || undefined
  const privacyPolicy = backendData.privacy_policy || undefined
  const iconUrl = backendData.icon_url || undefined
  const manifestVersion = backendData.manifest_version ?? clientManifest?.manifest_version ?? null
  const engine = backendData.engine || 'CyberWatch Extension Analyzer 1.0'

  const analysisCoverage: AnalysisCoverageInfo = backendData.analysis_coverage || {
    level: isLimited ? 'LIMITED_ANALYSIS' : 'FULL_ANALYSIS',
    manifest_status: isLimited ? 'UNAVAILABLE' : 'AVAILABLE',
    manifest_inspected: !isLimited,
    permissions_inspected: !isLimited,
    host_access_inspected: !isLimited,
    structure_inspected: !isLimited,
    store_metadata_inspected: Boolean(developer || storeUrl || rating),
    static_code_inspected: false,
    network_traffic_inspected: false
  }

  // 1. Permission Analysis
  const permissionFindings: PermissionAnalysisItem[] = (
    backendData.permission_findings || []
  ).map((f: any) => {
    const permKey = (f.permission || '').trim()
    const whyItMatters =
      PERMISSION_WHY_IT_MATTERS[permKey] ||
      PERMISSION_WHY_IT_MATTERS[permKey.toLowerCase()] ||
      f.why_it_matters ||
      f.reason ||
      `Permission '${permKey}' provides access to specific browser functionality.`

    return {
      name: permKey,
      description: f.reason || 'Permission declared in manifest.',
      severity: (f.severity || 'LOW') as RiskSeverity,
      whyItMatters,
      source: f.source || 'permissions',
      evidence: f.evidence || `Declared permission: ${permKey}`
    }
  })

  // 2. Host Permissions
  const hostPermissions: HostPermissionItem[] = (
    backendData.host_findings || []
  ).map((f: any) => {
    const perm = (f.permission || '').trim()
    const isWildcard =
      BROAD_HOST_PATTERNS.includes(perm.toLowerCase()) ||
      perm.toLowerCase() === '<all_urls>'
    const isDomain = perm.startsWith('http://') || perm.startsWith('https://')

    let scopeType: 'universal' | 'scoped' | 'unknown' = 'unknown'
    let scopeDescription = ''
    let whyItMatters = ''

    if (isWildcard) {
      scopeType = 'universal'
      scopeDescription =
        'Universal wildcard access across all websites and domains visited by the user.'
      whyItMatters =
        f.why_it_matters ||
        'Universal host permission gives the extension carte blanche to read, modify, and intercept data on every website you visit, including banking, email, and authentication flows.'
    } else if (isDomain) {
      scopeType = 'scoped'
      scopeDescription = `Restricted host access limited to origin: ${perm}`
      whyItMatters =
        f.why_it_matters ||
        'Scoped host access restricts the extension to communicating only with the specified domain, preventing it from inspecting or altering unrelated web pages.'
    } else {
      scopeType = 'scoped'
      scopeDescription = `Declared host pattern: ${perm}`
      whyItMatters = f.why_it_matters || f.reason || 'Restricted host pattern declared in extension manifest.'
    }

    return {
      permission: perm,
      severity: (f.severity || (isWildcard ? 'CRITICAL' : 'LOW')) as RiskSeverity,
      reason: f.reason || 'Host permission declared in manifest.',
      isWildcard,
      scopeType,
      scopeDescription,
      whyItMatters,
      evidence: f.evidence || `Host origin: ${perm}`
    }
  })

  // 3. Dangerous Combinations
  const combinations: CombinationFindingItem[] = (
    backendData.combination_findings || []
  ).map((c: any) => {
    const comboList = (c.combination || []) as string[]
    const comboKey = comboList.join(' + ')

    let whyItMatters = c.why_it_matters || c.reason || ''
    if (comboList.includes('webrequest') && comboList.includes('<all_urls>')) {
      whyItMatters =
        'Full traffic surveillance: Observing network traffic combined with universal domain access enables intercepting passwords, cookies, and sensitive payload data across all websites.'
    } else if (comboList.includes('cookies') && comboList.includes('<all_urls>')) {
      whyItMatters =
        'Universal session hijacking: Cookie access combined with wildcard host access allows silent extraction of active session tokens from any website the user is logged into.'
    } else if (comboList.includes('scripting') && comboList.includes('<all_urls>')) {
      whyItMatters =
        'Universal script execution: The ability to execute arbitrary scripts across all domains allows injecting keyloggers, credential harvesters, or intrusive DOM modifications anywhere.'
    } else if (comboList.includes('tabs') && comboList.includes('history')) {
      whyItMatters =
        'Comprehensive user profiling: Access to active tabs alongside browsing history allows continuous tracking and behavioral timeline reconstruction.'
    }

    return {
      combination: comboList,
      extraScore: c.extra_score ?? 0,
      severity: (c.severity || (c.extra_score >= 15 ? 'CRITICAL' : 'HIGH')) as RiskSeverity,
      reason: c.reason || `Dangerous permission synergy: ${comboKey}`,
      whyItMatters,
      evidence: c.evidence || `Privileges: ${comboKey}`
    }
  })

  // 4. Security Highlights: Safe / Attention / Serious
  const safeHighlights: SecurityHighlightItem[] = []
  const attentionHighlights: SecurityHighlightItem[] = []
  const seriousHighlights: SecurityHighlightItem[] = []

  // Check manifest version
  if (manifestVersion === 3) {
    safeHighlights.push({
      id: 'hl-mv3',
      title: 'Modern Manifest V3 Architecture',
      description: 'Built on Manifest V3, adhering to modern extension security standards.',
      whyItMatters:
        'Manifest V3 eliminates synchronous blocking APIs (such as webRequestBlocking) and disallows remotely hosted code, significantly hardening browser extension boundaries.',
      category: 'safe',
      severity: 'SAFE',
      evidence: 'manifest_version: 3'
    })
  } else if (manifestVersion === 2) {
    attentionHighlights.push({
      id: 'hl-mv2',
      title: 'Legacy Manifest V2 Framework',
      description: 'Uses Manifest V2, a deprecated specification being phased out by Chrome.',
      whyItMatters:
        'Manifest V2 permits persistent background pages and synchronous request modification APIs which present broader attack vectors.',
      category: 'attention',
      severity: 'MEDIUM',
      evidence: 'manifest_version: 2'
    })
  }

  // Check host permissions
  const wildcardHosts = hostPermissions.filter((h) => h.isWildcard)
  const scopedHosts = hostPermissions.filter((h) => !h.isWildcard)

  if (wildcardHosts.length > 0) {
    seriousHighlights.push({
      id: 'hl-wildcard-host',
      title: `Universal Host Access (${wildcardHosts.map((w) => w.permission).join(', ')})`,
      description: 'The extension requests permission to read and alter data on all websites.',
      whyItMatters:
        'Universal host permissions are the single most dangerous capability in browser extensions because they expose all sensitive user sessions and credentials.',
      category: 'serious',
      severity: 'CRITICAL',
      evidence: wildcardHosts.map((w) => w.permission).join(', ')
    })
  } else if (scopedHosts.length > 0) {
    safeHighlights.push({
      id: 'hl-scoped-host',
      title: 'Origin-Scoped Host Access',
      description: `Host permissions are strictly limited to ${scopedHosts.length} specific domain(s).`,
      whyItMatters:
        'Restricting network access to specific domains prevents the extension from touching unrelated websites or intercepting sensitive browsing activity.',
      category: 'safe',
      severity: 'SAFE',
      evidence: scopedHosts.map((s) => s.permission).join(', ')
    })
  } else if (hostPermissions.length === 0 && !isLimited) {
    safeHighlights.push({
      id: 'hl-no-host',
      title: 'No Host Permissions Requested',
      description: 'The extension does not request access to read or inject content into any websites.',
      whyItMatters:
        'Without host permissions, the extension cannot inspect page content, read cookies, or inject malicious scripts into your browsing sessions.',
      category: 'safe',
      severity: 'SAFE'
    })
  }

  // Check combinations
  if (combinations.length > 0) {
    combinations.forEach((c, idx) => {
      seriousHighlights.push({
        id: `hl-combo-${idx}`,
        title: `Dangerous Combination: ${c.combination.join(' + ')}`,
        description: c.reason,
        whyItMatters: c.whyItMatters,
        category: 'serious',
        severity: c.severity,
        evidence: c.evidence
      })
    })
  } else if (permissionFindings.length > 0 && !isLimited) {
    safeHighlights.push({
      id: 'hl-no-combo',
      title: 'No Compounding Permission Synergies',
      description: 'No known high-risk permission combinations were detected.',
      whyItMatters:
        'Permissions operate independently without synergistic combinations that could allow full traffic hijacking or privilege escalation.',
      category: 'safe',
      severity: 'SAFE'
    })
  }

  // Categorize individual permissions
  permissionFindings.forEach((pf, idx) => {
    const why = pf.whyItMatters || pf.description || ''
    if (pf.severity === 'CRITICAL') {
      seriousHighlights.push({
        id: `hl-perm-${idx}`,
        title: `Critical Permission: ${pf.name}`,
        description: pf.description,
        whyItMatters: why,
        category: 'serious',
        severity: 'CRITICAL',
        evidence: pf.evidence
      })
    } else if (pf.severity === 'HIGH') {
      seriousHighlights.push({
        id: `hl-perm-${idx}`,
        title: `High-Risk Permission: ${pf.name}`,
        description: pf.description,
        whyItMatters: why,
        category: 'serious',
        severity: 'HIGH',
        evidence: pf.evidence
      })
    } else if (pf.severity === 'MEDIUM') {
      attentionHighlights.push({
        id: `hl-perm-${idx}`,
        title: `Elevated Permission: ${pf.name}`,
        description: pf.description,
        whyItMatters: why,
        category: 'attention',
        severity: 'MEDIUM',
        evidence: pf.evidence
      })
    } else if (pf.severity === 'LOW') {
      safeHighlights.push({
        id: `hl-perm-${idx}`,
        title: `Low-Risk Permission: ${pf.name}`,
        description: pf.description,
        whyItMatters: why,
        category: 'safe',
        severity: 'SAFE',
        evidence: pf.evidence
      })
    }
  })

  // WebStore metadata findings
  const webstoreFindings = backendData.webstore_findings || []
  webstoreFindings.forEach((wf: any, idx: number) => {
    if (wf.severity === 'INFO') {
      safeHighlights.push({
        id: `hl-store-${idx}`,
        title: wf.title,
        description: wf.reason || wf.explanation,
        whyItMatters: wf.why_it_matters || 'Chrome Web Store catalog verification.',
        category: 'safe',
        severity: 'SAFE',
        evidence: wf.evidence
      })
    }
  })

  // Structure findings
  const structureFindings = backendData.structure_findings || []
  structureFindings.forEach((sf: any, idx: number) => {
    if (sf.severity === 'LOW' || sf.severity === 'INFO') {
      safeHighlights.push({
        id: `hl-struct-${idx}`,
        title: sf.title,
        description: sf.reason || sf.explanation,
        whyItMatters: sf.why_it_matters,
        category: 'safe',
        severity: 'SAFE',
        evidence: sf.evidence
      })
    } else {
      attentionHighlights.push({
        id: `hl-struct-${idx}`,
        title: sf.title,
        description: sf.reason || sf.explanation,
        whyItMatters: sf.why_it_matters,
        category: 'attention',
        severity: sf.severity || 'MEDIUM',
        evidence: sf.evidence
      })
    }
  })

  // Code Analysis findings
  const codeFindingsList = backendData.code_findings || []
  codeFindingsList.forEach((cf: any, idx: number) => {
    const item: SecurityHighlightItem = {
      id: cf.id || `hl-code-${idx}`,
      title: cf.title || 'Code Pattern Detected',
      description: `${cf.affected_file ? `[${cf.affected_file}] ` : ''}${cf.evidence || cf.line_or_pattern || ''}`,
      whyItMatters: cf.why_it_matters || 'Static code pattern identified during JavaScript security inspection.',
      category: cf.severity === 'CRITICAL' || cf.severity === 'HIGH' ? 'serious' : 'attention',
      severity: (cf.severity || 'MEDIUM') as RiskSeverity,
      evidence: cf.evidence || cf.line_or_pattern,
      source: 'STATIC_CODE_ANALYSIS'
    }
    if (cf.severity === 'CRITICAL' || cf.severity === 'HIGH') {
      seriousHighlights.push(item)
    } else {
      attentionHighlights.push(item)
    }
  })

  // Metadata issues
  const metadataIssues = backendData.metadata_issues || []
  metadataIssues.forEach((issue: string, idx: number) => {
    attentionHighlights.push({
      id: `hl-meta-${idx}`,
      title: 'Metadata Omission',
      description: issue,
      whyItMatters:
        'Incomplete or missing extension metadata impedes publisher verification and provenance auditing.',
      category: 'attention',
      severity: 'LOW',
      evidence: issue
    })
  })

  // 5. Extension Structure Analysis
  const backgroundObj = backendData.background || clientManifest?.background
  const contentScriptsArr = backendData.content_scripts || clientManifest?.content_scripts

  let backgroundStatus = 'Not Declared in Manifest'
  let backgroundDetails = 'No background scripts or service workers declared in manifest.'
  let serviceWorkerStatus = 'Not Declared in Manifest'
  let serviceWorkerDetails = 'No service worker registered in manifest.'

  if (backgroundObj) {
    if (backgroundObj.service_worker) {
      backgroundStatus = 'Service Worker Declared'
      backgroundDetails = `Service Worker file: ${backgroundObj.service_worker}`
      serviceWorkerStatus = 'Active Service Worker (MV3)'
      serviceWorkerDetails = `Entry point: ${backgroundObj.service_worker}`
    } else if (backgroundObj.scripts && backgroundObj.scripts.length > 0) {
      const scriptNames = Array.isArray(backgroundObj.scripts)
        ? backgroundObj.scripts.join(', ')
        : String(backgroundObj.scripts)
      backgroundStatus = 'Background Scripts (MV2)'
      backgroundDetails = `Script file(s): ${scriptNames}`
      serviceWorkerStatus = 'Legacy Background Page'
      serviceWorkerDetails = 'Manifest V2 uses persistent/event background pages instead of service workers.'
    } else {
      backgroundStatus = 'Background Configuration Present'
      backgroundDetails = 'Custom background configuration declared in manifest.'
    }
  }

  let contentScriptsStatus = 'Not Declared in Manifest'
  let contentScriptsDetails = 'No content script injection rules declared in manifest.'

  if (contentScriptsArr && Array.isArray(contentScriptsArr) && contentScriptsArr.length > 0) {
    contentScriptsStatus = `${contentScriptsArr.length} Content Script Rule(s)`
    const matchPatterns = contentScriptsArr
      .flatMap((cs: any) => cs.matches || [])
      .filter(Boolean)
    const jsFiles = contentScriptsArr
      .flatMap((cs: any) => cs.js || [])
      .filter(Boolean)

    const matchStr = matchPatterns.length > 0 ? `Injected into: ${matchPatterns.join(', ')}` : ''
    const jsStr = jsFiles.length > 0 ? ` (Script: ${jsFiles.join(', ')})` : ''
    contentScriptsDetails = `${matchStr}${jsStr}` || 'Content script injection rules declared.'
  }

  const structure: ExtensionStructureInfo = {
    manifestVersion,
    manifestVersionLabel: manifestVersion ? `Manifest V${manifestVersion}` : 'Not Specified',
    manifestVersionExplanation:
      manifestVersion === 3
        ? 'Manifest V3 enforces non-persistent service workers and restricts dynamic remote code execution.'
        : manifestVersion === 2
        ? 'Manifest V2 is deprecated by Chrome and allows persistent background scripts with synchronous blocking APIs.'
        : 'Manifest specification version was not explicitly provided in the scan input.',
    backgroundStatus,
    backgroundDetails,
    contentScriptsStatus,
    contentScriptsDetails,
    serviceWorkerStatus,
    serviceWorkerDetails,
    permissionsCount: (backendData.permissions_analyzed || []).length,
    hostPermissionsCount: (backendData.host_permissions_analyzed || []).length
  }

  // 6. Unavailable Modules
  const unavailableModules: ModuleStatusItem[] = [
    {
      moduleName: 'Code Security Analysis',
      status: 'Not Available',
      statusType: 'unavailable',
      headline: 'JavaScript AST & Source Deobfuscation',
      description:
        'Code Security Analysis is not currently available. The current scanner analyzes extension manifest declarations and permissions. Source code scanning (JavaScript AST analysis, obfuscation detection, dangerous API usage) is planned for a future release.'
    },
    {
      moduleName: 'Runtime / Network Activity Analysis',
      status: 'Not Available',
      statusType: 'unavailable',
      headline: 'Dynamic Sandbox Traffic Capture',
      description:
        'Runtime activity monitoring is not currently available. Extension network requests, background socket calls, and runtime behaviors are not tracked in this scan mode.'
    },
    {
      moduleName: 'Threat Intelligence Feeds',
      status: 'Not Configured',
      statusType: 'not_configured',
      headline: 'Malicious Hash & Domain Reputation Feeds',
      description:
        'Threat Intelligence providers are not configured. Known malicious extension hashes, publisher blacklists, and C2 domain lookups are not available.'
    },
    {
      moduleName: 'Machine Learning Analysis',
      status: 'Not Available',
      statusType: 'unavailable',
      headline: 'Heuristic & Probabilistic AI Inference',
      description:
        'Machine Learning analysis is not currently available. Risk scores are calculated using deterministic permission-based rule evaluation.'
    },
    {
      moduleName: 'Vulnerable Libraries (SCA)',
      status: 'Not Available',
      statusType: 'unavailable',
      headline: 'Third-Party Dependency CVE Scanning',
      description:
        'Vulnerable library analysis is not currently available. Third-party dependency scanning and package CVE matching are not enabled for this extension.'
    }
  ]

  // 7. What This Means
  let whatThisMeans = ''
  if (isLimited) {
    whatThisMeans =
      `This report is based on verified public Chrome Web Store metadata for '${name}'. Direct manifest and package code analysis could not be retrieved from the CRX server. To ensure transparency, automated threat scoring is withheld until full manifest data is provided.`
  } else if (score !== null && score >= 80) {
    whatThisMeans =
      `This extension requests critical privileges (risk score ${score}/100) capable of universal website data access, network traffic manipulation, or direct host operating system communication. Installing this extension creates severe security exposure for all authenticated accounts, sensitive data, and enterprise systems accessed from this browser.`
  } else if (score !== null && score >= 60) {
    whatThisMeans =
      `This extension requests high-risk capabilities (risk score ${score}/100) such as network traffic observation or broad domain access. While these permissions may be required for specific complex utilities, a compromised or malicious version of this extension could monitor web activity and intercept private information.`
  } else if (score !== null && score >= 35) {
    whatThisMeans =
      `This extension requests elevated permissions (risk score ${score}/100) such as tab management, cookies, or clipboard access. These permissions are common among productivity and session tools, but they expand the attack surface. Ensure you verify the developer and publisher credentials before regular use.`
  } else if (score !== null && score >= 10) {
    whatThisMeans =
      `This extension declares low-privilege permissions (risk score ${score}/100) such as local storage or notifications. These permissions are standard for benign extensions and carry minimal operational security exposure under normal browsing conditions.`
  } else {
    whatThisMeans =
      `This extension declares minimal or benign permissions (risk score ${score ?? 0}/100). It operates in a standard restricted sandbox without broad access to web content, user credentials, or network traffic.`
  }

  // 8. Recommended Action Plan
  let recommendedAction: RecommendedActionPlan
  if (isLimited) {
    recommendedAction = {
      verdictTitle: 'ANALYSIS LIMITED',
      badgeSeverity: 'LIMITED',
      headline: 'Store Intelligence Verified — Manifest Inspection Unavailable',
      rationale:
        'Extension identity confirmed on Chrome Web Store. Code-level manifest inspection was unavailable.',
      actionChecklist: [
        'Review extension reviews, user counts, and publisher credentials on the official Chrome Web Store.',
        'Inspect declared permissions directly in browser extension settings (chrome://extensions) after installation.',
        'Upload the CRX or manifest.json directly into CyberWatch for a deep deterministic security audit.'
      ]
    }
  } else if (severity === 'CRITICAL') {
    recommendedAction = {
      verdictTitle: 'DO NOT INSTALL / REMOVE IMMEDIATELY',
      badgeSeverity: 'CRITICAL',
      headline: 'Severe Security Exposure Identified',
      rationale:
        'The extension requests dangerous permissions that allow universal website interception or native OS communication.',
      actionChecklist: [
        'Uninstall or disable this extension immediately from all browser profiles.',
        'If the extension was active while accessing sensitive web services, invalidate active sessions and rotate credentials.',
        'Verify browser network proxy and DNS settings to confirm traffic has not been redirected.',
        'Report unauthorized or suspicious extensions to the Chrome Web Store security team.'
      ]
    }
  } else if (severity === 'HIGH') {
    recommendedAction = {
      verdictTitle: 'PROCEED WITH ELEVATED CAUTION',
      badgeSeverity: 'HIGH',
      headline: 'High-Privilege Access Detected',
      rationale:
        'The extension requests network observation or broad host access which could be abused if the extension is compromised.',
      actionChecklist: [
        'In Chrome extension settings (chrome://extensions), restrict site access to "On click" or specific permitted domains.',
        'Do not use this extension while accessing online banking, corporate intranets, or private portals.',
        'Audit the publisher identity and verify user ratings on the official Chrome Web Store.',
        'Consider exploring alternative extensions that operate with narrower permission scopes.'
      ]
    }
  } else if (severity === 'MEDIUM') {
    recommendedAction = {
      verdictTitle: 'REVIEW PERMISSIONS & PROCEED WITH CAUTION',
      badgeSeverity: 'MEDIUM',
      headline: 'Elevated Capabilities Require Verification',
      rationale:
        'The extension requests access to sensitive browser features (such as tabs, cookies, or downloads).',
      actionChecklist: [
        'Verify that requested permissions directly correlate with the extension advertised features.',
        'Review extension permissions in browser settings and limit domain access where applicable.',
        'Monitor extension updates to ensure future releases do not silently request additional permissions.',
        'Check publisher reputation and community reviews before organizational deployment.'
      ]
    }
  } else if (severity === 'LOW') {
    recommendedAction = {
      verdictTitle: 'ACCEPTABLE RISK',
      badgeSeverity: 'LOW',
      headline: 'Low Security Impact Under Standard Use',
      rationale:
        'Requested permissions are low privilege and have minimal potential for privacy or security abuse.',
      actionChecklist: [
        'Review permissions against advertised extension features to ensure consistency.',
        'Ensure the extension is installed from the official Chrome Web Store.',
        'No urgent remediation or security intervention is required.'
      ]
    }
  } else {
    recommendedAction = {
      verdictTitle: 'SAFE TO USE',
      badgeSeverity: 'SAFE',
      headline: 'No Critical Permission Risks Detected',
      rationale:
        'The extension declares standard permissions appropriate for normal browser operations.',
      actionChecklist: [
        'Safe for standard browser installation and everyday usage.',
        'Verify that the developer profile matches the official vendor.',
        'Keep your browser and extensions updated to ensure manifest permission boundaries remain enforced.'
      ]
    }
  }

  // 9. Sub Scores
  const backendSub = backendData.sub_scores || {}
  const permScore = isLimited
    ? 0
    : (backendSub.permission_risk ??
        Math.min(
          40,
          permissionFindings.reduce((sum, f) => {
            const weights: Record<string, number> = { CRITICAL: 15, HIGH: 10, MEDIUM: 5, LOW: 2 }
            return sum + (weights[f.severity] || 2)
          }, 0)
        ))

  const hostScore = isLimited
    ? 0
    : (backendSub.host_access_risk ??
        Math.min(
          20,
          hostPermissions.reduce((sum, f) => {
            const weights: Record<string, number> = { CRITICAL: 15, HIGH: 10, MEDIUM: 5, LOW: 2 }
            return sum + (weights[f.severity] || 2)
          }, 0)
        ))

  const comboScore = isLimited
    ? 0
    : (backendSub.dangerous_combination_risk ??
        Math.min(
          15,
          combinations.reduce((sum, f) => sum + (f.extraScore || 0), 0)
        ))

  const codeScore = isLimited
    ? 0
    : (backendSub.verified_static_code_risk ??
        Math.min(
          20,
          codeFindingsList.reduce((sum: number, f: any) => {
            const weights: Record<string, number> = { CRITICAL: 10, HIGH: 6, MEDIUM: 3, LOW: 1 }
            return sum + (weights[f.severity] || 1)
          }, 0)
        ))

  const obfScore = isLimited
    ? 0
    : (backendSub.obfuscation_risk ?? 0)

  const subScores: SubScoreItem[] = [
    {
      id: 'ext-perm',
      label: 'Permission Risk',
      score: Math.round(permScore * 10) / 10,
      maxScore: 40,
      severity: isLimited ? 'LIMITED' : permScore >= 30 ? 'CRITICAL' : permScore >= 20 ? 'HIGH' : permScore >= 10 ? 'MEDIUM' : permScore > 0 ? 'LOW' : 'SAFE'
    },
    {
      id: 'ext-host',
      label: 'Host Access Risk',
      score: Math.round(hostScore * 10) / 10,
      maxScore: 20,
      severity: isLimited ? 'LIMITED' : hostScore >= 18 ? 'CRITICAL' : hostScore >= 12 ? 'HIGH' : hostScore >= 5 ? 'MEDIUM' : hostScore > 0 ? 'LOW' : 'SAFE'
    },
    {
      id: 'ext-combo',
      label: 'Combination Risk',
      score: Math.round(comboScore * 10) / 10,
      maxScore: 15,
      severity: isLimited ? 'LIMITED' : comboScore >= 12 ? 'CRITICAL' : comboScore >= 8 ? 'HIGH' : comboScore > 0 ? 'MEDIUM' : 'SAFE'
    },
    {
      id: 'ext-code',
      label: 'Static Code Risk',
      score: Math.round(codeScore * 10) / 10,
      maxScore: 20,
      severity: isLimited ? 'LIMITED' : codeScore >= 15 ? 'CRITICAL' : codeScore >= 10 ? 'HIGH' : codeScore >= 5 ? 'MEDIUM' : codeScore > 0 ? 'LOW' : 'SAFE'
    },
    {
      id: 'ext-obf',
      label: 'Obfuscation Risk',
      score: Math.round(obfScore * 10) / 10,
      maxScore: 5,
      severity: isLimited ? 'LIMITED' : obfScore >= 4 ? 'HIGH' : obfScore >= 2 ? 'MEDIUM' : obfScore > 0 ? 'LOW' : 'SAFE'
    },
    {
      id: 'ext-overall',
      label: 'Overall Score',
      score: score ?? 0,
      maxScore: 100,
      severity
    }
  ]

  // 10. Extension Info Items
  const info: ExtensionInfoItem[] = [
    { label: 'Extension Name', value: name },
    { label: 'Extension ID', value: extensionId },
    { label: 'Version', value: version },
    ...(developer ? [{ label: 'Publisher / Developer', value: developer }] : []),
    ...(rating ? [{ label: 'Store Rating', value: `${rating} ★${ratingCount ? ` (${ratingCount.toLocaleString()} reviews)` : ''}` }] : []),
    ...(users ? [{ label: 'Active Users', value: users }] : []),
    ...(website ? [{ label: 'Official Website', value: website }] : []),
    ...(privacyPolicy ? [{ label: 'Privacy Policy', value: privacyPolicy }] : []),
    { label: 'Manifest Version', value: manifestVersion != null ? `MV${manifestVersion}` : (isLimited ? 'Not Available in Limited Scan' : 'Not Specified') },
    { label: 'Permissions Declared', value: isLimited ? 'N/A (Manifest not inspected)' : String((backendData.permissions_analyzed || []).length) },
    { label: 'Host Permissions', value: isLimited ? 'N/A (Manifest not inspected)' : String((backendData.host_permissions_analyzed || []).length) },
    { label: 'Dangerous Combinations', value: isLimited ? 'N/A' : String(combinations.length) },
    { label: 'Scanner Engine', value: engine }
  ]

  // 11. AICheckItems
  const aiChecks: AICheckItem[] = [
    ...combinations.map((c, idx) => ({
      id: `combo-${idx}`,
      name: `Synergy: ${c.combination.join(' + ')}`,
      finding: c.reason,
      severity: c.severity,
      whyItMatters: c.whyItMatters,
      evidence: c.evidence
    })),
    ...codeFindingsList.map((cf: any, idx: number) => ({
      id: cf.id || `code-check-${idx}`,
      name: cf.title || 'Code Security Pattern',
      finding: `${cf.affected_file ? `[${cf.affected_file}] ` : ''}${cf.evidence || cf.line_or_pattern || ''}`,
      severity: (cf.severity || 'MEDIUM') as RiskSeverity,
      whyItMatters: cf.why_it_matters || 'Static code pattern identified during JavaScript security inspection.',
      evidence: cf.evidence
    })),
    ...metadataIssues.map((issue: string, idx: number) => ({
      id: `meta-${idx}`,
      name: 'Metadata Audit',
      finding: issue,
      severity: 'LOW' as RiskSeverity,
      whyItMatters: 'Missing metadata impedes publisher verification.',
      evidence: issue
    }))
  ]

  if (backendData.manifest_finding) {
    aiChecks.push({
      id: 'manifest-finding',
      name: backendData.manifest_finding.check || 'Manifest Specification',
      finding: backendData.manifest_finding.reason || '',
      severity: (backendData.manifest_finding.severity || 'LOW') as RiskSeverity,
      whyItMatters: 'Manifest version dictates available APIs and security sandbox boundaries.',
      evidence: backendData.manifest_finding.evidence
    })
  }

  if (aiChecks.length === 0) {
    aiChecks.push({
      id: 'clean-check',
      name: isLimited ? 'Store Catalog Check' : 'Permission Heuristics',
      finding: isLimited ? 'Verified listing in official Chrome Web Store.' : 'No dangerous permission combinations or code patterns detected.',
      severity: isLimited ? ('LIMITED' as RiskSeverity) : ('SAFE' as RiskSeverity),
      whyItMatters: isLimited ? 'Public metadata confirms official distribution.' : 'Extension adheres to isolated permission and code boundaries.'
    })
  }

  // 12. Radar Data Points
  const radarData: RadarDataPoint[] = [
    { subject: 'Permissions', currentScore: Math.round((permScore / 40) * 100), baselineScore: 10 },
    { subject: 'Host Access', currentScore: Math.round((hostScore / 20) * 100), baselineScore: 5 },
    { subject: 'Combinations', currentScore: Math.round((comboScore / 15) * 100), baselineScore: 0 },
    { subject: 'Static Code', currentScore: Math.round((codeScore / 20) * 100), baselineScore: 5 },
    { subject: 'Obfuscation', currentScore: Math.round((obfScore / 5) * 100), baselineScore: 0 },
    { subject: 'Overall Risk', currentScore: score ?? 0, baselineScore: 10 }
  ]

  const warningMessage =
    backendData.summary ||
    (isLimited
      ? 'Limited Analysis: Store metadata verified. Direct manifest and package code inspection was unavailable from the package server.'
      : score !== null && score >= 80
      ? 'Critical threat risk detected: Extension combines high-risk privileges that warrant immediate removal.'
      : score !== null && score >= 60
      ? 'High risk detected: Powerful permissions or sensitive code execution patterns detected.'
      : score !== null && score >= 35
      ? 'Medium risk detected: Elevated permissions expand the browser attack surface.'
      : score !== null && score >= 10
      ? 'Low risk detected: Standard permissions with minimal potential for abuse.'
      : 'Minimal risk: Extension operates with isolated permissions.')

  return {
    scanId: backendData.scan_id,
    requestedExtensionId: backendData.requested_extension_id || extensionId,
    resolvedExtensionId: backendData.resolved_extension_id || extensionId,
    extensionId,
    name,
    version,
    developer,
    storeUrl,
    rating,
    ratingCount,
    users,
    website,
    privacyPolicy,
    iconUrl,
    provenance: backendData.provenance || {},
    manifestVersion,
    overallScore: score,
    severity,
    verdict: backendData.verdict || recommendedAction.verdictTitle,
    dataVerification: backendData.data_verification || {
      metadata_status: developer || storeUrl || rating ? 'VERIFIED' : 'UNAVAILABLE',
      package_status: isLimited ? 'UNAVAILABLE' : 'VERIFIED',
      manifest_status: isLimited ? 'UNAVAILABLE' : 'VERIFIED',
      code_analysis_status: isLimited ? 'NOT_AVAILABLE' : 'COMPLETED',
      files_scanned_count: backendData.data_verification?.files_scanned_count ?? 0,
      total_js_files_found: backendData.data_verification?.total_js_files_found ?? 0,
      total_js_files_scanned: backendData.data_verification?.total_js_files_scanned ?? 0,
      analysis_coverage_percent: isLimited ? 25 : 100
    },
    subScoresBreakdown: backendData.sub_scores || undefined,
    analysisCoverage,
    confidence: isLimited ? 0.70 : 0.95,
    scanTime: new Date().toISOString(),
    engine,
    warningMessage,
    summary: backendData.summary || warningMessage,
    subScores,
    info,
    permissions:
      permissionFindings.length > 0
        ? permissionFindings
        : isLimited
        ? [
            {
              name: 'Manifest not inspected',
              description: 'Manifest permissions could not be extracted in limited scan mode.',
              severity: 'LIMITED',
              whyItMatters: 'Inspect permissions manually at chrome://extensions.'
            }
          ]
        : [
            {
              name: 'No permissions declared',
              description: 'This extension declares no permissions. It operates in an isolated sandbox.',
              severity: 'SAFE',
              whyItMatters:
                'Zero permissions ensure the extension cannot read page content, intercept requests, or access browser APIs.'
            }
          ],
    hostPermissions,
    combinations,
    codeFindings: codeFindingsList,
    obfuscationStatus: backendData.obfuscation_status || (isLimited ? 'UNKNOWN' : 'NONE'),
    obfuscationDetails: backendData.obfuscation_details || undefined,
    externallyConnectable: backendData.externally_connectable,
    contentSecurityPolicy: backendData.content_security_policy,
    highlights: {
      safe: safeHighlights,
      attention: attentionHighlights,
      serious: seriousHighlights
    },
    structure,
    webAccessibleResources: backendData.web_accessible_resources || {
      status: isLimited ? 'UNKNOWN' : 'NOT_DECLARED',
      manifest_version: manifestVersion || 3,
      exposure_level: 'NONE',
      entries: [],
      summary: isLimited ? 'Manifest was unavailable; web accessible resources could not be evaluated.' : 'No web accessible resources declared in the analyzed manifest.'
    },
    unavailableModules,
    whatThisMeans,
    recommendedAction,
    aiChecks,
    radarData
  }
}
