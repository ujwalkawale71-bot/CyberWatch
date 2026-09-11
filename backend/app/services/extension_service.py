"""
Extension Scanner Service — CyberWatch Threat Detection Platform

Performs deterministic, evidence-based permission, structure, static code,
and obfuscation risk analysis of browser extensions from actual manifest data and store intelligence.
No random numbers. No fabricated results. No generic placeholders.
Score is strictly bounded 0–100 and calculated as the sum of bounded sub-components:
  score = permission_risk (0-40) + host_access_risk (0-20) + dangerous_combination_risk (0-15)
        + verified_static_code_risk (0-20) + obfuscation_risk (0-5)
"""
from typing import Any, Dict, List, Optional, Tuple
from app.services.extension_code_analyzer import analyze_javascript_files

# ─────────────────────────────────────────────
# Permission risk catalogue
# Each entry: (severity, points, reason, why_it_matters)
# Points: Critical=15, High=10, Medium=5, Low=2, Safe=0
# ─────────────────────────────────────────────
PERMISSION_CATALOGUE: Dict[str, Tuple[str, float, str, str]] = {
    # CRITICAL (15 pts)
    "debugger": (
        "CRITICAL",
        15.0,
        "Grants access to the Chrome DevTools Debugger Protocol.",
        "Allows the extension to inspect, modify, and inject JavaScript into any page, intercept network requests, and read all browser state."
    ),
    "nativeMessaging": (
        "CRITICAL",
        15.0,
        "Allows communication with native applications on the host OS.",
        "Bypasses the browser sandbox to execute commands or exchange data with local desktop binaries. If compromised, can lead to remote code execution."
    ),
    "<all_urls>": (
        "CRITICAL",
        15.0,
        "Grants read and write access to all websites the user visits.",
        "Enables injecting scripts, reading page content, intercepting form submissions, and capturing credentials on all websites."
    ),
    "http://*/*": (
        "CRITICAL",
        15.0,
        "Grants access to all unencrypted HTTP websites.",
        "Equivalent to <all_urls> for non-HTTPS traffic; enables content injection and traffic snooping."
    ),
    "https://*/*": (
        "CRITICAL",
        15.0,
        "Grants access to all encrypted HTTPS websites.",
        "Allows reading and modifying web data on all secure sites after TLS termination in the browser."
    ),
    "*://*/*": (
        "CRITICAL",
        15.0,
        "Universal host wildcard across all protocols.",
        "Grants full read and write access across all HTTP and HTTPS websites."
    ),

    # HIGH (10 pts)
    "webRequestBlocking": (
        "HIGH",
        10.0,
        "Allows blocking or modifying network requests before they complete.",
        "When combined with host access, enables full traffic manipulation and redirection. Deprecated in Manifest V3."
    ),
    "webRequest": (
        "HIGH",
        10.0,
        "Allows observing and inspecting all browser network requests.",
        "Enables inspecting request URLs, headers, and query parameters across sites."
    ),
    "management": (
        "HIGH",
        10.0,
        "Grants control over other installed browser extensions.",
        "Can disable, enable, or inspect permissions of other extensions, including security tools and ad blockers."
    ),
    "privacy": (
        "HIGH",
        10.0,
        "Provides access to browser privacy and security settings.",
        "Allows altering privacy controls such as WebRTC IP leak protection and safe browsing."
    ),
    "proxy": (
        "HIGH",
        10.0,
        "Allows configuring browser proxy settings.",
        "Can route browser traffic through remote proxy servers."
    ),
    "cookies": (
        "HIGH",
        10.0,
        "Allows reading and writing browser cookies within host permissions.",
        "Can be used to extract active session tokens and hijack authenticated sessions."
    ),
    "history": (
        "HIGH",
        10.0,
        "Provides access to the user full browser history.",
        "Allows reading visited URLs, visit timestamps, and search queries, presenting privacy exposure."
    ),
    "clipboardRead": (
        "HIGH",
        10.0,
        "Allows reading the operating system clipboard.",
        "Can capture passwords, cryptographic keys, or private text copied by the user."
    ),
    "clipboardWrite": (
        "HIGH",
        10.0,
        "Allows writing data to the operating system clipboard.",
        "Can replace clipboard content with attacker-controlled text or addresses."
    ),

    # MEDIUM (5 pts)
    "tabs": (
        "MEDIUM",
        5.0,
        "Allows accessing metadata of open browser tabs.",
        "Can read URLs, titles, and favicons of all open tabs across windows, enabling user browsing tracking."
    ),
    "bookmarks": (
        "MEDIUM",
        5.0,
        "Allows reading, creating, and deleting saved bookmarks.",
        "Enables inspecting and modifying personal bookmark hierarchies."
    ),
    "downloads": (
        "MEDIUM",
        5.0,
        "Allows initiating and managing file downloads.",
        "Can download files to the local filesystem without explicit per-file confirmation."
    ),
    "scripting": (
        "MEDIUM",
        5.0,
        "Allows dynamic JavaScript and CSS injection into web pages.",
        "Enables content modification and DOM manipulation on permitted origins."
    ),
    "geolocation": (
        "MEDIUM",
        5.0,
        "Allows querying the physical geographic location of the device.",
        "Can track user physical location using browser location APIs."
    ),

    # LOW (2 pts)
    "activeTab": (
        "LOW",
        2.0,
        "Grants temporary access to the active tab upon user interaction.",
        "Allows reading page content and injecting scripts into the current page when explicitly invoked."
    ),
    "unlimitedStorage": (
        "LOW",
        2.0,
        "Allows storing unlimited client-side data locally.",
        "Provides unrestricted local browser database and cache storage."
    ),
    "identity": (
        "LOW",
        2.0,
        "Provides OAuth token access for signed-in user profiles.",
        "Used for authenticating users with third-party OAuth providers."
    ),

    # SAFE / UTILITY (0 pts)
    "storage": (
        "LOW",
        0.0,
        "Allows storing extension preferences and cached data locally.",
        "Standard permission for saving extension settings in the browser profile."
    ),
    "notifications": (
        "LOW",
        0.0,
        "Allows displaying desktop notification banners.",
        "Standard UI capability for alerts."
    ),
    "contextMenus": (
        "LOW",
        0.0,
        "Allows adding items to the browser right-click context menu.",
        "Standard UI customization permission."
    ),
    "alarms": (
        "LOW",
        0.0,
        "Allows scheduling periodic background tasks.",
        "Standard scheduling utility for extension background tasks."
    ),
    "idle": (
        "LOW",
        0.0,
        "Allows detecting when the machine is idle or active.",
        "Used to pause or resume background tasks when the user is away."
    ),
    "offscreen": (
        "LOW",
        0.0,
        "Allows creating offscreen documents for DOM access in MV3.",
        "Used by Manifest V3 extensions for clipboard or audio playback."
    ),
}

DANGEROUS_COMBINATIONS = [
    (
        {"webRequest", "webRequestBlocking", "<all_urls>"},
        15.0,
        "Full traffic interception: webRequest + webRequestBlocking + <all_urls>.",
        "Enables the extension to silently intercept, read, and modify all browser traffic across all websites."
    ),
    (
        {"webRequest", "<all_urls>"},
        10.0,
        "Passive traffic surveillance: webRequest + <all_urls>.",
        "Allows reading all HTTP/S request headers and query parameters for every site the user visits."
    ),
    (
        {"cookies", "<all_urls>"},
        8.0,
        "Session hijacking risk: cookies + <all_urls>.",
        "Allows the extension to read session cookies across all websites, enabling account takeover."
    ),
    (
        {"scripting", "<all_urls>"},
        8.0,
        "Universal code injection: scripting + <all_urls>.",
        "Allows arbitrary JavaScript injection into every website the user visits."
    ),
    (
        {"tabs", "history"},
        5.0,
        "Behavioral profiling: tabs + history.",
        "Enables surveillance of the user open tabs and browsing history timeline."
    ),
]

BROAD_HOST_PATTERNS = ["<all_urls>", "http://*/*", "https://*/*", "*://*/*"]


def _is_host_pattern(perm: str) -> bool:
    """Determine if a permission string represents a host permission pattern."""
    p = (perm or "").strip().lower()
    return (
        p == "<all_urls>"
        or "://" in p
        or p.startswith("*://")
        or p.startswith("http://")
        or p.startswith("https://")
        or p.startswith("ftp://")
        or p.startswith("file://")
    )


def _classify_host_permissions(host_permissions: List[str]) -> Tuple[List[Dict[str, Any]], float]:
    """Classify host permission entries into structured findings with calibrated bounded scoring (0-20 max)."""
    findings = []
    has_universal = False
    scoped_domains_count = 0

    for hp in host_permissions:
        hp_clean = hp.strip().lower()
        if hp_clean in BROAD_HOST_PATTERNS or hp_clean == "<all_urls>":
            has_universal = True
            findings.append({
                "id": f"host-universal-{len(findings)+1}",
                "title": f"Universal Host Access: {hp}",
                "permission": hp,
                "severity": "HIGH",
                "confidence": 0.99,
                "category": "host_access",
                "source": "MANIFEST",
                "detected_value": hp,
                "evidence": f"Declared host pattern: '{hp}'",
                "scope_type": "universal",
                "reason": (
                    f"Host permission '{hp}' grants access to all websites. "
                    "Universal host permission should be restricted to specific domains unless strictly required."
                ),
                "explanation": "Universal host access permits reading and injecting content across all visited domains.",
                "why_it_matters": "Enables the extension to interact with page DOM and requests on every website you visit."
            })
        else:
            scoped_domains_count += 1
            findings.append({
                "id": f"host-scoped-{len(findings)+1}",
                "title": f"Scoped Domain Access: {hp}",
                "permission": hp,
                "severity": "LOW",
                "confidence": 0.99,
                "category": "host_access",
                "source": "MANIFEST",
                "detected_value": hp,
                "evidence": f"Declared host pattern: '{hp}'",
                "scope_type": "scoped",
                "reason": f"Restricted host permission limited to domain pattern: '{hp}'.",
                "explanation": "Scoped host access restricts data access strictly to the specified origin.",
                "why_it_matters": "Restricting host access prevents access to unrelated websites."
            })

    # Calibrate host score (0 - 20 max)
    if has_universal:
        host_score = 15.0
        if len([h for h in host_permissions if h.strip().lower() in BROAD_HOST_PATTERNS]) > 1:
            host_score = 20.0
    else:
        host_score = min(scoped_domains_count * 3.0, 10.0)

    return findings, host_score


def _analyze_web_accessible_resources(
    war_raw: Optional[Any],
    manifest_version: Optional[int]
) -> Tuple[Dict[str, Any], List[Dict[str, Any]], float]:
    """Analyze web_accessible_resources safely."""
    if not war_raw:
        return (
            {
                "status": "NOT_DECLARED",
                "manifest_version": manifest_version or 3,
                "exposure_level": "NONE",
                "entries": [],
                "summary": "No web accessible resources declared in the analyzed manifest."
            },
            [],
            0.0
        )

    entries: List[Dict[str, Any]] = []
    findings: List[Dict[str, Any]] = []
    has_broad = False
    has_limited = False
    broad_patterns = {"<all_urls>", "*://*/*", "https://*/*", "http://*/*"}

    if all(isinstance(item, str) for item in war_raw):
        clean_resources = [str(r).strip() for r in war_raw if str(r).strip()]
        if clean_resources:
            has_broad = True
            entries.append({
                "resources": clean_resources,
                "matches": ["<all_urls> (MV2 default)"],
                "exposure": "BROAD"
            })
            findings.append({
                "id": "war-mv2-unrestricted",
                "title": "Unrestricted Web Accessible Resources (Manifest V2)",
                "severity": "LOW",
                "confidence": 0.95,
                "category": "Resource Exposure",
                "source": "MANIFEST",
                "evidence": f"{len(clean_resources)} resource(s) declared",
                "detected_value": str(len(clean_resources)),
                "reason": "Manifest V2 exposes declared web accessible resources to all websites without domain scoping.",
                "explanation": "In Manifest V2, any website can request and load declared extension resources.",
                "why_it_matters": "Enables third-party websites to fingerprint installed extensions or probe extension assets."
            })
            return (
                {
                    "status": "DECLARED",
                    "manifest_version": 2,
                    "exposure_level": "BROAD",
                    "entries": entries,
                    "summary": f"{len(clean_resources)} web accessible resource(s) exposed under Manifest V2."
                },
                findings,
                2.0
            )

    all_extracted_resources: List[str] = []
    for item in war_raw:
        if isinstance(item, dict):
            res_list = [str(r).strip() for r in item.get("resources", []) if str(r).strip()]
            matches_list = [str(m).strip() for m in item.get("matches", []) if str(m).strip()]
            ext_ids = item.get("extension_ids")
            use_dyn = item.get("use_dynamic_url")

            all_extracted_resources.extend(res_list)

            entry_is_broad = False
            for m in matches_list:
                m_lower = m.lower()
                if m_lower in broad_patterns or m_lower == "<all_urls>":
                    entry_is_broad = True
                    break

            if not matches_list and not ext_ids:
                entry_is_broad = True

            entry_exposure = "BROAD" if entry_is_broad else "LIMITED"
            if entry_is_broad:
                has_broad = True
            else:
                has_limited = True

            entry_data: Dict[str, Any] = {
                "resources": res_list,
                "matches": matches_list,
                "exposure": entry_exposure
            }
            if ext_ids is not None:
                entry_data["extension_ids"] = ext_ids
            if use_dyn is not None:
                entry_data["use_dynamic_url"] = use_dyn

            entries.append(entry_data)
        elif isinstance(item, str) and item.strip():
            has_broad = True
            all_extracted_resources.append(item.strip())
            entries.append({
                "resources": [item.strip()],
                "matches": ["<all_urls> (unscoped)"],
                "exposure": "BROAD"
            })

    if has_broad:
        exposure_level = "BROAD"
        broad_matches = [m for e in entries if e.get("exposure") == "BROAD" for m in e.get("matches", [])]
        match_ev = ', '.join(broad_matches[:3]) if broad_matches else '<all_urls>'
        findings.append({
            "id": "war-mv3-broad",
            "title": "Broad Web Accessible Resource Exposure",
            "severity": "LOW",
            "confidence": 0.95,
            "category": "Resource Exposure",
            "source": "MANIFEST",
            "evidence": f"Unrestricted matches: {match_ev}",
            "detected_value": f"{len(all_extracted_resources)} resource(s)",
            "reason": "Extension declares web accessible resources reachable from websites.",
            "explanation": "Resources matched with broad origin wildcards (<all_urls> or *://*/*) can be loaded by web pages.",
            "why_it_matters": "Allows web pages to detect this extension or probe exposed resources."
        })
        score_addition = 2.0
    elif has_limited:
        exposure_level = "LIMITED"
        scoped_matches = [m for e in entries for m in e.get("matches", [])]
        findings.append({
            "id": "war-mv3-scoped",
            "title": "Scoped Web Accessible Resources",
            "severity": "LOW",
            "confidence": 0.95,
            "category": "Resource Exposure",
            "source": "MANIFEST",
            "evidence": f"Restricted matches: {', '.join(scoped_matches[:3])}",
            "detected_value": f"{len(all_extracted_resources)} resource(s)",
            "reason": "Web accessible resources are strictly restricted to designated target origins.",
            "explanation": "Only permitted origins defined in manifest matches can access these extension assets.",
            "why_it_matters": "Protects against unauthorized cross-origin resource access."
        })
        score_addition = 0.0
    else:
        exposure_level = "NONE"
        score_addition = 0.0

    war_summary = (
        f"{len(entries)} web accessible resource rule(s) declared with {exposure_level.lower()} exposure."
        if entries else "No web accessible resources declared in the analyzed manifest."
    )

    return (
        {
            "status": "DECLARED" if entries else "NOT_DECLARED",
            "manifest_version": manifest_version or 3,
            "exposure_level": exposure_level,
            "entries": entries,
            "summary": war_summary
        },
        findings,
        score_addition
    )


def analyze_extension(
    requested_extension_id: Optional[str] = None,
    extension_id: Optional[str] = None,
    name: Optional[str] = None,
    version: Optional[str] = None,
    description: Optional[str] = None,
    developer: Optional[str] = None,
    store_url: Optional[str] = None,
    rating: Optional[str] = None,
    rating_count: Optional[int] = None,
    users: Optional[str] = None,
    website: Optional[str] = None,
    privacy_policy: Optional[str] = None,
    icon_url: Optional[str] = None,
    manifest_version: Optional[int] = None,
    permissions: Optional[List[str]] = None,
    host_permissions: Optional[List[str]] = None,
    optional_permissions: Optional[List[str]] = None,
    optional_host_permissions: Optional[List[str]] = None,
    content_scripts: Optional[List[Dict[str, Any]]] = None,
    background: Optional[Dict[str, Any]] = None,
    web_accessible_resources: Optional[Any] = None,
    externally_connectable: Optional[Any] = None,
    content_security_policy: Optional[Any] = None,
    raw_manifest: Optional[Dict[str, Any]] = None,
    js_files: Optional[Dict[str, str]] = None,
    analysis_coverage: str = "FULL_ANALYSIS",
    metadata_status: str = "VERIFIED",
    package_status: str = "VERIFIED",
    manifest_status: str = "VERIFIED",
    package_format: str = "CRX3"
) -> Dict[str, Any]:
    """
    Perform deterministic, evidence-based permission, structure, static code,
    and obfuscation risk analysis of a browser extension.
    Score is bounded 0-100:
      permission_risk (0-40) + host_access_risk (0-20) + dangerous_combination_risk (0-15)
      + verified_static_code_risk (0-20) + obfuscation_risk (0-5)
    """
    # ── 1. Result Mismatch / Identity Integrity Check ────────────────────────
    resolved_id = extension_id or requested_extension_id
    if requested_extension_id and resolved_id and requested_extension_id.lower() != resolved_id.lower():
        return {
            "status": "RESULT_MISMATCH",
            "requested_extension_id": requested_extension_id,
            "resolved_extension_id": resolved_id,
            "reason": f"Requested Extension ID '{requested_extension_id}' does not match resolved ID '{resolved_id}'."
        }

    # ── 2. Field-level Provenance Tracking ────────────────────────────────────
    provenance: Dict[str, str] = {
        "extension_id": "CHROME_WEB_STORE" if extension_id else "USER_INPUT"
    }

    # Extract from raw_manifest if provided
    if raw_manifest and isinstance(raw_manifest, dict):
        manifest_raw_name = raw_manifest.get("name")
        if manifest_raw_name and not manifest_raw_name.startswith("__MSG_"):
            if name is None or name.startswith("__MSG_"):
                name = manifest_raw_name
                provenance["name"] = "MANIFEST"
        elif name is None:
            name = manifest_raw_name
            provenance["name"] = "MANIFEST"
        elif name:
            provenance["name"] = "CHROME_WEB_STORE"

        if version is None:
            version = raw_manifest.get("version")
            provenance["version"] = "MANIFEST"
        elif version:
            provenance["version"] = "MANIFEST"

        if manifest_version is None:
            manifest_version = raw_manifest.get("manifest_version")

        if description is None:
            manifest_raw_desc = raw_manifest.get("description")
            if manifest_raw_desc and not manifest_raw_desc.startswith("__MSG_"):
                description = manifest_raw_desc
                provenance["description"] = "MANIFEST"
            elif not description:
                description = manifest_raw_desc
                provenance["description"] = "MANIFEST"
        elif description:
            provenance["description"] = "CHROME_WEB_STORE"

        if not permissions and "permissions" in raw_manifest:
            permissions = raw_manifest.get("permissions") or []
        if not host_permissions and "host_permissions" in raw_manifest:
            host_permissions = raw_manifest.get("host_permissions") or []
        if not optional_permissions and "optional_permissions" in raw_manifest:
            optional_permissions = raw_manifest.get("optional_permissions") or []
        if not optional_host_permissions and "optional_host_permissions" in raw_manifest:
            optional_host_permissions = raw_manifest.get("optional_host_permissions") or []
        if content_scripts is None and "content_scripts" in raw_manifest:
            content_scripts = raw_manifest.get("content_scripts")
        if background is None and "background" in raw_manifest:
            background = raw_manifest.get("background")
        if web_accessible_resources is None and "web_accessible_resources" in raw_manifest:
            web_accessible_resources = raw_manifest.get("web_accessible_resources")
        if externally_connectable is None and "externally_connectable" in raw_manifest:
            externally_connectable = raw_manifest.get("externally_connectable")
        if content_security_policy is None and "content_security_policy" in raw_manifest:
            content_security_policy = raw_manifest.get("content_security_policy")
    else:
        if name:
            provenance["name"] = "CHROME_WEB_STORE"
        if version:
            provenance["version"] = "CHROME_WEB_STORE"
        if description:
            provenance["description"] = "CHROME_WEB_STORE"

    if developer:
        provenance["developer"] = "CHROME_WEB_STORE"
    if store_url:
        provenance["store_url"] = "CHROME_WEB_STORE"
    if icon_url:
        provenance["icon_url"] = "CHROME_WEB_STORE"

    display_name = name or resolved_id or "Extension"
    total_js_found = len(js_files) if js_files else 0

    # ── 3. Handle LIMITED_ANALYSIS Mode (FIX 8) ──────────────────────────────
    if analysis_coverage == "LIMITED_ANALYSIS" or manifest_status == "UNAVAILABLE":
        # Calculate limited coverage percentage
        coverage_pct = 20 if metadata_status == "VERIFIED" else 0

        summary = (
            f"Chrome Web Store intelligence retrieved for '{display_name}'. "
            "Direct package and manifest code inspection was unavailable from the package server. "
            "Security risk scoring is withheld to ensure correctness."
        )
        webstore_findings = [
            {
                "id": "store-meta-unavail",
                "title": "Manifest Code Inspection Unavailable",
                "severity": "INFO",
                "confidence": 1.0,
                "category": "webstore",
                "source": "STORE_METADATA",
                "evidence": f"Extension ID: {resolved_id or 'N/A'}",
                "detected_value": resolved_id or "N/A",
                "reason": "Direct CRX package manifest extraction was unavailable for this extension.",
                "explanation": "Security evaluation is limited to verified Chrome Web Store metadata.",
                "why_it_matters": "Without manifest inspection, permission scopes, background scripts, and host origin access cannot be deterministically verified."
            }
        ]

        if developer or rating or store_url:
            webstore_findings.append({
                "id": "store-listing-verified",
                "title": f"Store Listing Verified: {display_name}",
                "severity": "INFO",
                "confidence": 1.0,
                "category": "metadata",
                "source": "STORE_METADATA",
                "evidence": f"Publisher: {developer or 'Unknown'} | Version: {version or 'N/A'}",
                "detected_value": developer or "Verified",
                "reason": "Verified public Chrome Web Store catalog listing.",
                "explanation": "Public store listing confirms active distribution on the Chrome Web Store.",
                "why_it_matters": "Confirms publisher identity and store distribution channel."
            })

        return {
            "requested_extension_id": requested_extension_id or resolved_id,
            "resolved_extension_id": resolved_id,
            "extension_id": resolved_id,
            "name": name,
            "version": version,
            "description": description,
            "developer": developer,
            "store_url": store_url,
            "rating": rating,
            "rating_count": rating_count,
            "users": users,
            "website": website,
            "privacy_policy": privacy_policy,
            "icon_url": icon_url,
            "provenance": provenance,
            "manifest_version": manifest_version,
            "score": None,
            "risk_score": None,
            "risk_level": "LIMITED",
            "verdict": "ANALYSIS LIMITED",
            "data_verification": {
                "metadata_status": metadata_status,
                "package_status": package_status,
                "manifest_status": "UNAVAILABLE",
                "code_analysis_status": "NOT_AVAILABLE",
                "package_format": package_format if package_status == "VERIFIED" else "NONE",
                "files_scanned_count": 0,
                "total_js_files_found": 0,
                "total_js_files_scanned": 0,
                "analysis_coverage_percent": coverage_pct
            },
            "sub_scores": {
                "permission_risk": 0.0,
                "host_access_risk": 0.0,
                "dangerous_combination_risk": 0.0,
                "verified_static_code_risk": 0.0,
                "obfuscation_risk": 0.0
            },
            "permissions_analyzed": [],
            "host_permissions_analyzed": [],
            "optional_permissions_analyzed": [],
            "optional_host_permissions_analyzed": [],
            "content_scripts": [],
            "background": None,
            "web_accessible_resources": {
                "status": "UNKNOWN",
                "manifest_version": manifest_version or 3,
                "exposure_level": "NONE",
                "entries": [],
                "summary": "Manifest inspection was unavailable; web accessible resources could not be evaluated."
            },
            "permission_findings": [],
            "host_findings": [],
            "combination_findings": [],
            "code_findings": [],
            "structure_findings": [],
            "manifest_finding": None,
            "metadata_issues": [],
            "webstore_findings": webstore_findings,
            "obfuscation_status": "UNKNOWN",
            "obfuscation_details": {
                "status": "UNKNOWN",
                "max_entropy": 0.0,
                "entropy_score": 0.0,
                "highest_entropy_file": "None",
                "high_entropy_strings_count": 0,
                "packed_js_detected": False,
                "packer_detected": False,
                "hex_escapes_count": 0,
                "hex_identifiers_count": 0,
                "long_strings_count": 0
            },
            "analysis_coverage": {
                "level": "LIMITED_ANALYSIS",
                "manifest_status": "UNAVAILABLE",
                "manifest_inspected": False,
                "permissions_inspected": False,
                "host_access_inspected": False,
                "structure_inspected": False,
                "store_metadata_inspected": bool(metadata_status == "VERIFIED"),
                "static_code_inspected": False,
                "network_traffic_inspected": False
            },
            "summary": summary,
            "engine": "CyberWatch Extension Analyzer 2.0",
        }

    # ── 4. FULL_ANALYSIS MODE ────────────────────────────────────────────────
    raw_permissions = [str(p).strip() for p in (permissions or []) if str(p).strip()]
    raw_host_permissions = [str(h).strip() for h in (host_permissions or []) if str(h).strip()]

    actual_api_permissions: List[str] = []
    actual_host_permissions: List[str] = list(raw_host_permissions)

    for p in raw_permissions:
        if _is_host_pattern(p):
            if p not in actual_host_permissions:
                actual_host_permissions.append(p)
        else:
            actual_api_permissions.append(p)

    permission_findings: List[Dict[str, Any]] = []

    perm_set_lower = {p.lower() for p in actual_api_permissions}
    all_perms_lower = perm_set_lower | {h.lower() for h in actual_host_permissions}

    # 4.1 Score individual API permissions (FIX 7 & 10: 0 - 40 max)
    raw_perm_score = 0.0
    for perm in actual_api_permissions:
        perm_key = perm.strip()
        match = None
        for cat_key in PERMISSION_CATALOGUE:
            if perm_key.lower() == cat_key.lower():
                match = PERMISSION_CATALOGUE[cat_key]
                break

        if match:
            severity, points, reason, why_it_matters = match
        else:
            severity = "LOW"
            points = 2.0
            reason = f"Permission '{perm_key}' provides access to specific browser functionality."
            why_it_matters = f"Allows extension to interact with browser API: {perm_key}."

        raw_perm_score += points
        permission_findings.append({
            "id": f"perm-{len(permission_findings)+1}",
            "title": f"Permission: {perm_key}",
            "permission": perm_key,
            "severity": severity,
            "confidence": 1.0,
            "category": "permissions",
            "source": "MANIFEST",
            "detected_value": perm_key,
            "evidence": f"Declared in permissions: '{perm_key}'",
            "reason": reason,
            "explanation": reason,
            "why_it_matters": why_it_matters
        })

    perm_risk_score = min(round(raw_perm_score, 1), 40.0)

    # 4.2 Score host permissions (FIX 7: 0 - 20 max)
    host_findings, host_risk_score = _classify_host_permissions(actual_host_permissions)

    # 4.3 Dangerous combinations (FIX 7: 0 - 15 max)
    raw_combo_score = 0.0
    combination_findings: List[Dict[str, Any]] = []
    for combo_set, bonus, combo_reason, combo_why in DANGEROUS_COMBINATIONS:
        combo_set_lower = {x.lower() for x in combo_set}
        if combo_set_lower.issubset(all_perms_lower):
            raw_combo_score += bonus
            combination_findings.append({
                "id": f"combo-{len(combination_findings)+1}",
                "title": f"Dangerous Synergy: {' + '.join(sorted(combo_set))}",
                "combination": sorted(combo_set),
                "detected_value": sorted(combo_set),
                "evidence": f"Combined privileges: {', '.join(sorted(combo_set))}",
                "category": "combinations",
                "source": "MANIFEST",
                "extra_score": bonus,
                "confidence": 0.95,
                "severity": "HIGH" if bonus < 15 else "CRITICAL",
                "reason": combo_reason,
                "explanation": combo_reason,
                "why_it_matters": combo_why
            })

    combo_score = min(round(raw_combo_score, 1), 15.0)

    # 4.4 Web Accessible Resources Analysis
    war_info, war_findings, war_score = _analyze_web_accessible_resources(
        web_accessible_resources,
        manifest_version
    )

    # 4.5 Static Code Analysis & Obfuscation Detection (FIX 1, 2, 7: 0-20 & 0-5 max)
    if js_files and total_js_found > 0:
        code_analysis_result = analyze_javascript_files(js_files, actual_api_permissions)
        code_findings = code_analysis_result.get("findings", [])
        verified_static_code_risk = code_analysis_result.get("code_pattern_risk_score", 0.0)
        obfuscation_risk = code_analysis_result.get("obfuscation_risk_score", 0.0)
        obfuscation_status = code_analysis_result.get("obfuscation_status", "NONE")
        obfuscation_details = code_analysis_result.get("obfuscation_details", {})
        total_js_scanned = code_analysis_result.get("total_js_files_scanned", 0)
        code_analysis_status = "COMPLETED" if total_js_scanned > 0 else "NOT_AVAILABLE"
    else:
        # Rule (FIX 1 & 8): If 0 files scanned, no code findings and 0 risk
        code_findings = []
        verified_static_code_risk = 0.0
        obfuscation_risk = 0.0
        obfuscation_status = "UNKNOWN"
        total_js_scanned = 0
        code_analysis_status = "NOT_AVAILABLE"
        obfuscation_details = {
            "status": "UNKNOWN",
            "max_entropy": 0.0,
            "entropy_score": 0.0,
            "highest_entropy_file": "None",
            "high_entropy_strings_count": 0,
            "packed_js_detected": False,
            "packer_detected": False,
            "hex_escapes_count": 0,
            "hex_identifiers_count": 0,
            "long_strings_count": 0
        }

    # 4.6 Compute Total Risk Score (FIX 7: Strictly bounded sum)
    total_raw_score = (
        perm_risk_score +
        host_risk_score +
        combo_score +
        verified_static_code_risk +
        obfuscation_risk
    )
    score = min(round(total_raw_score, 1), 100.0)

    # 4.7 Compute Analysis Coverage (FIX 14)
    # Metadata: 20%, Manifest: 30%, Permissions: 20%, Structure: 10%, Code analysis: 20% (only if files scanned > 0)
    coverage_points = 0
    if metadata_status == "VERIFIED":
        coverage_points += 20
    if manifest_status == "VERIFIED":
        coverage_points += 30
        coverage_points += 20  # Permissions analyzed from verified manifest
        coverage_points += 10  # Structure analyzed from verified manifest
    if total_js_scanned > 0:
        coverage_points += 20

    coverage_percent = min(coverage_points, 100)

    # 4.8 Verdict Calculation (FIX 11: CRITICAL allowed ONLY on confirmed malicious evidence)
    # Check for confirmed active malicious code findings
    confirmed_malicious_code = any(
        f.get("severity") == "CRITICAL" and f.get("confidence") == "HIGH"
        for f in code_findings
    )

    has_high_code_threat = any(
        f.get("severity") == "HIGH" and f.get("confidence") == "HIGH"
        for f in code_findings
    )

    if confirmed_malicious_code:
        risk_level = "CRITICAL"
        verdict = "CRITICAL RISK"
    elif has_high_code_threat or score >= 50.0:
        risk_level = "HIGH"
        verdict = "HIGH RISK"
    elif score >= 20.0:
        risk_level = "MEDIUM"
        verdict = "MEDIUM RISK"
    elif score >= 5.0:
        risk_level = "LOW"
        verdict = "LOW RISK"
    else:
        if coverage_percent >= 70:
            risk_level = "SAFE"
            verdict = "SAFE / MINIMAL RISK"
        else:
            risk_level = "LOW"
            verdict = "LOW RISK"

    # 4.9 Structure & Findings Aggregation
    content_scripts_info = []
    if content_scripts and isinstance(content_scripts, list):
        for cs in content_scripts:
            if isinstance(cs, dict):
                content_scripts_info.append({
                    "matches": cs.get("matches", []),
                    "js": cs.get("js", []),
                    "css": cs.get("css", []),
                    "run_at": cs.get("run_at", "document_idle")
                })

    background_info = None
    if background and isinstance(background, dict):
        scripts_val = background.get("scripts")
        scripts_list = [scripts_val] if isinstance(scripts_val, str) else (scripts_val if isinstance(scripts_val, list) else [])
        background_info = {
            "service_worker": background.get("service_worker"),
            "scripts": scripts_list,
            "persistent": background.get("persistent"),
            "type": background.get("type")
        }

    structure_findings = list(war_findings)
    if content_scripts_info:
        all_matches = [m for cs in content_scripts_info for m in cs.get("matches", [])]
        structure_findings.append({
            "id": f"struct-cs-{len(structure_findings)+1}",
            "title": f"Content Script Injections ({len(content_scripts_info)} Rule{'s' if len(content_scripts_info) > 1 else ''})",
            "severity": "LOW",
            "confidence": 1.0,
            "category": "structure",
            "source": "MANIFEST",
            "evidence": f"{len(content_scripts_info)} script definition(s) targeting: {', '.join(all_matches[:3])}{'...' if len(all_matches) > 3 else ''}",
            "detected_value": str(len(content_scripts_info)),
            "reason": "Extension declares content scripts injected directly into matching web pages.",
            "explanation": "Content scripts execute within the context of matching web pages and can manipulate the DOM.",
            "why_it_matters": "Content scripts can read web page content, alter UI elements, and listen to DOM events."
        })

    if background_info:
        bg_desc = "Manifest V3 Service Worker" if background_info.get("service_worker") else "Manifest V2 Background Script"
        structure_findings.append({
            "id": f"struct-bg-{len(structure_findings)+1}",
            "title": f"Background Component: {bg_desc}",
            "severity": "LOW",
            "confidence": 1.0,
            "category": "structure",
            "source": "MANIFEST",
            "evidence": background_info.get("service_worker") or str(background_info.get("scripts", [])),
            "detected_value": bg_desc,
            "reason": f"Extension utilizes background execution: {bg_desc}.",
            "explanation": "Background components handle extension events and API requests.",
            "why_it_matters": "Coordinates extension background tasks, alarms, and cross-tab communication."
        })

    mv_finding = None
    if manifest_version == 2:
        mv_finding = {
            "id": "manifest-v2-legacy",
            "title": "Legacy Manifest V2",
            "check": "Manifest Version",
            "value": "Manifest V2",
            "detected_value": "2",
            "evidence": "manifest_version: 2",
            "category": "structure",
            "source": "MANIFEST",
            "confidence": 1.0,
            "severity": "LOW",
            "reason": "This extension uses Manifest V2. MV2 extensions are being phased out by Chrome.",
            "explanation": "Manifest V2 supports persistent background pages and synchronous blocking APIs.",
            "why_it_matters": "Manifest V2 allows broader attack surfaces than modern Manifest V3."
        }

    webstore_findings = []
    if developer or store_url:
        webstore_findings.append({
            "id": "store-listing-verified",
            "title": f"Store Listing: {display_name}",
            "severity": "INFO",
            "confidence": 1.0,
            "category": "metadata",
            "source": "STORE_METADATA",
            "evidence": f"Publisher: {developer or 'Unknown'} | Version: {version or 'N/A'}",
            "detected_value": developer or "Verified",
            "reason": "Verified Chrome Web Store public catalog metadata.",
            "explanation": "Confirmed listing in the official Chrome Web Store catalog.",
            "why_it_matters": "Validates official distribution channel."
        })

    summary = (
        f"Extension analysis complete for '{display_name}'. "
        f"Overall threat risk evaluated as {risk_level} (score: {score}/100). "
        f"{len(permission_findings)} permission(s) analyzed, "
        f"{len(host_findings)} host origin pattern(s) inspected, "
        f"{len(combination_findings)} dangerous combination(s) detected, "
        f"{len(code_findings)} static code finding(s) from {total_js_scanned} scanned file(s)."
    )

    return {
        "requested_extension_id": requested_extension_id or resolved_id,
        "resolved_extension_id": resolved_id,
        "extension_id": resolved_id,
        "name": name,
        "version": version,
        "description": description,
        "developer": developer,
        "store_url": store_url,
        "rating": rating,
        "rating_count": rating_count,
        "users": users,
        "website": website,
        "privacy_policy": privacy_policy,
        "icon_url": icon_url,
        "provenance": provenance,
        "manifest_version": manifest_version,
        "score": score,
        "risk_score": score,
        "risk_level": risk_level,
        "verdict": verdict,
        "data_verification": {
            "metadata_status": metadata_status,
            "package_status": package_status,
            "manifest_status": manifest_status,
            "code_analysis_status": code_analysis_status,
            "package_format": package_format if package_status == "VERIFIED" else "NONE",
            "files_scanned_count": total_js_scanned,
            "total_js_files_found": total_js_found,
            "total_js_files_scanned": total_js_scanned,
            "analysis_coverage_percent": coverage_percent
        },
        "sub_scores": {
            "permission_risk": perm_risk_score,
            "host_access_risk": host_risk_score,
            "dangerous_combination_risk": combo_score,
            "verified_static_code_risk": verified_static_code_risk,
            "obfuscation_risk": obfuscation_risk
        },
        "permissions_analyzed": actual_api_permissions,
        "host_permissions_analyzed": actual_host_permissions,
        "optional_permissions_analyzed": optional_permissions or [],
        "optional_host_permissions_analyzed": optional_host_permissions or [],
        "content_scripts": content_scripts_info,
        "background": background_info,
        "web_accessible_resources": war_info,
        "externally_connectable": externally_connectable,
        "content_security_policy": content_security_policy,
        "permission_findings": permission_findings,
        "host_findings": host_findings,
        "combination_findings": combination_findings,
        "code_findings": code_findings,
        "structure_findings": structure_findings,
        "manifest_finding": mv_finding,
        "metadata_issues": [],
        "webstore_findings": webstore_findings,
        "obfuscation_status": obfuscation_status,
        "obfuscation_details": obfuscation_details,
        "analysis_coverage": {
            "level": "FULL_ANALYSIS",
            "manifest_status": "AVAILABLE",
            "manifest_inspected": True,
            "permissions_inspected": True,
            "host_access_inspected": True,
            "structure_inspected": bool(content_scripts_info or background_info or war_info.get("status") == "DECLARED"),
            "store_metadata_inspected": bool(developer or store_url or rating),
            "static_code_inspected": bool(total_js_scanned > 0),
            "network_traffic_inspected": False
        },
        "summary": summary,
        "engine": "CyberWatch Extension Analyzer 2.0",
    }
