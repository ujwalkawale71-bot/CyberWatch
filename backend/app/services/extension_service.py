"""
Extension Scanner Service — CyberWatch Threat Detection Platform

Performs deterministic permission-based risk analysis of browser extensions.
No random numbers. No fabricated results.
Score is bounded 0–100 and fully reproducible from the same input.
"""
from typing import Any, Dict, List, Optional, Tuple

# ─────────────────────────────────────────────
# Permission risk catalogue
# Each entry: (severity, reason)
# ─────────────────────────────────────────────
PERMISSION_CATALOGUE: Dict[str, Tuple[str, str]] = {
    # CRITICAL
    "debugger": (
        "CRITICAL",
        "Grants full access to the Chrome DevTools Debugger Protocol, allowing the extension to "
        "inspect, modify, and inject JavaScript into any page, intercept network requests, and "
        "read all browser state."
    ),
    "nativeMessaging": (
        "CRITICAL",
        "Allows the extension to communicate with native applications installed on the host "
        "operating system, bypassing the browser sandbox. A compromised extension with this "
        "permission can execute arbitrary system commands."
    ),
    "<all_urls>": (
        "CRITICAL",
        "Grants read and write access to all websites the user visits, including the ability to "
        "inject scripts, read page content, intercept form submissions, and capture credentials."
    ),
    "http://*/*": (
        "CRITICAL",
        "Grants access to all HTTP websites — equivalent to <all_urls> for non-HTTPS traffic. "
        "Enables content injection, data reading, and credential interception."
    ),
    "https://*/*": (
        "CRITICAL",
        "Grants access to all HTTPS websites — equivalent to <all_urls> for secure traffic. "
        "Can intercept encrypted traffic content after TLS termination in the browser."
    ),

    # HIGH
    "webRequestBlocking": (
        "HIGH",
        "Allows the extension to block, redirect, or modify HTTP requests and responses before "
        "they reach the browser. Combined with host permissions, this enables full traffic "
        "interception and manipulation."
    ),
    "webRequest": (
        "HIGH",
        "Allows the extension to observe and inspect all network requests made by the browser. "
        "When combined with broad host permissions, sensitive data in requests can be captured."
    ),
    "management": (
        "HIGH",
        "Grants control over other installed extensions — the extension can disable, enable, "
        "uninstall, or query the permissions of any other extension."
    ),
    "privacy": (
        "HIGH",
        "Provides access to Chrome's privacy settings, allowing the extension to alter privacy "
        "controls such as WebRTC IP leak protection."
    ),
    "proxy": (
        "HIGH",
        "Allows the extension to configure the browser's proxy settings, routing all traffic "
        "through an attacker-controlled server."
    ),

    # MEDIUM
    "tabs": (
        "MEDIUM",
        "Allows the extension to access metadata of open browser tabs including URLs, titles, "
        "and favicons of all tabs, even those in other windows."
    ),
    "activeTab": (
        "MEDIUM",
        "Grants temporary access to the currently active tab after user interaction. Allows "
        "reading page content and injecting scripts into the active page."
    ),
    "cookies": (
        "MEDIUM",
        "Allows the extension to read and write cookies for websites within its host permissions. "
        "Can be used to steal session tokens and hijack authenticated sessions."
    ),
    "history": (
        "MEDIUM",
        "Provides access to the user's full browser history — visited URLs, visit times, and "
        "visit counts. Significant privacy risk."
    ),
    "bookmarks": (
        "MEDIUM",
        "Allows the extension to read, create, and delete the user's bookmarks."
    ),
    "downloads": (
        "MEDIUM",
        "Allows the extension to initiate and manage file downloads, including downloading "
        "files to the user's filesystem without explicit per-download approval."
    ),
    "scripting": (
        "MEDIUM",
        "Allows the extension to inject JavaScript and CSS into web pages. Without broad host "
        "permissions the scope is limited, but still enables content modification."
    ),
    "clipboardRead": (
        "MEDIUM",
        "Allows the extension to read the contents of the clipboard. Can capture passwords "
        "and sensitive data copied by the user."
    ),
    "clipboardWrite": (
        "MEDIUM",
        "Allows the extension to write data to the clipboard, potentially replacing content "
        "the user intends to paste."
    ),
    "geolocation": (
        "MEDIUM",
        "Allows the extension to access the user's geographic location."
    ),

    # LOW
    "storage": (
        "LOW",
        "Allows the extension to store data locally using the Chrome storage API. Limited risk "
        "on its own; used legitimately for persisting settings."
    ),
    "identity": (
        "LOW",
        "Provides access to Google OAuth tokens for the signed-in user. May expose identity "
        "information depending on requested OAuth scopes."
    ),
    "notifications": (
        "LOW",
        "Allows the extension to display browser notifications to the user. Low risk but can "
        "be used for spam or social engineering."
    ),
    "contextMenus": (
        "LOW",
        "Allows the extension to add items to the browser's right-click context menu."
    ),
    "alarms": (
        "LOW",
        "Allows the extension to schedule periodic or timed callbacks."
    ),
    "idle": (
        "LOW",
        "Allows the extension to detect when the user's machine is idle or active."
    ),
}

# Severity → score weight
SEVERITY_WEIGHTS: Dict[str, float] = {
    "CRITICAL": 30.0,
    "HIGH": 20.0,
    "MEDIUM": 12.0,
    "LOW": 5.0,
}

# Dangerous combinations: (set of permissions) → extra score + description
DANGEROUS_COMBINATIONS = [
    (
        {"webRequest", "webRequestBlocking", "<all_urls>"},
        20.0,
        "Full traffic interception: webRequest + webRequestBlocking + <all_urls> enables the "
        "extension to silently intercept, read, and modify all browser traffic."
    ),
    (
        {"webRequest", "<all_urls>"},
        12.0,
        "Passive traffic surveillance: webRequest + <all_urls> allows reading all HTTP/S "
        "request and response data for every site the user visits."
    ),
    (
        {"cookies", "<all_urls>"},
        12.0,
        "Session hijacking risk: cookies + <all_urls> allows the extension to read session "
        "tokens across all websites, enabling account takeover."
    ),
    (
        {"scripting", "<all_urls>"},
        12.0,
        "Universal code injection: scripting + <all_urls> allows arbitrary JavaScript to be "
        "injected into every website the user visits."
    ),
    (
        {"tabs", "history"},
        8.0,
        "Behavioral profiling: tabs + history enables detailed surveillance of the user's "
        "entire browsing activity."
    ),
    (
        {"nativeMessaging"},
        10.0,
        "Native messaging enables communication with host OS applications, breaking the browser "
        "sandbox and enabling potential remote code execution."
    ),
    (
        {"debugger"},
        10.0,
        "Debugger permission grants DevTools Protocol access — full read/write control over "
        "any browser tab including password fields and form data."
    ),
]

# Host permission patterns that indicate broad access
BROAD_HOST_PATTERNS = ["<all_urls>", "http://*/*", "https://*/*", "*://*/*"]


def _classify_host_permissions(host_permissions: List[str]) -> List[Dict[str, Any]]:
    """Classify host permission entries and return findings."""
    findings = []
    for hp in host_permissions:
        hp_clean = hp.strip().lower()
        if hp_clean in BROAD_HOST_PATTERNS or hp_clean == "<all_urls>":
            findings.append({
                "permission": hp,
                "severity": "CRITICAL",
                "reason": (
                    f"Host permission '{hp}' grants the extension access to all websites. "
                    "This is the most permissive host permission pattern and should be "
                    "limited to specific domains unless strictly necessary."
                )
            })
        elif hp_clean.startswith("http://") or hp_clean.startswith("https://"):
            # Specific domain — low risk
            findings.append({
                "permission": hp,
                "severity": "LOW",
                "reason": f"Scoped host permission for domain: {hp}. Limited to the specified origin."
            })
        else:
            findings.append({
                "permission": hp,
                "severity": "LOW",
                "reason": f"Host permission '{hp}' (scope unclear — treat as low risk until further analysis)."
            })
    return findings


def _normalize_risk_level(score: float) -> str:
    if score >= 80:
        return "CRITICAL"
    elif score >= 60:
        return "HIGH"
    elif score >= 35:
        return "MEDIUM"
    elif score >= 10:
        return "LOW"
    else:
        return "SAFE"


def analyze_extension(
    extension_id: Optional[str] = None,
    name: Optional[str] = None,
    version: Optional[str] = None,
    description: Optional[str] = None,
    manifest_version: Optional[int] = None,
    permissions: Optional[List[str]] = None,
    host_permissions: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Perform deterministic permission-based risk analysis of a browser extension.

    Returns a structured dict with score (0–100), risk_level, and all findings.
    No random numbers are used. The same inputs always produce the same output.
    """
    permissions = [p.strip() for p in (permissions or []) if p.strip()]
    host_permissions = [h.strip() for h in (host_permissions or []) if h.strip()]

    score = 0.0
    permission_findings: List[Dict[str, Any]] = []
    host_findings: List[Dict[str, Any]] = []
    combination_findings: List[Dict[str, Any]] = []

    # Normalize permission set for combination checks (lowercase)
    perm_set_lower = {p.lower() for p in permissions}
    # Include host permissions in combined set for pattern matching
    all_perms_lower = perm_set_lower | {h.lower() for h in host_permissions}

    # ── 1. Score individual permissions ──────────────────────────────────────
    for perm in permissions:
        perm_key = perm.strip()
        # Check catalogue (case-insensitive)
        match = None
        for cat_key in PERMISSION_CATALOGUE:
            if perm_key.lower() == cat_key.lower():
                match = PERMISSION_CATALOGUE[cat_key]
                break

        if match:
            severity, reason = match
        else:
            # Unknown permission — treat as LOW
            severity = "LOW"
            reason = (
                f"Permission '{perm_key}' is not in the standard permission catalogue. "
                "Treat as low risk unless context indicates otherwise."
            )

        score += SEVERITY_WEIGHTS.get(severity, 5.0)
        permission_findings.append({
            "permission": perm_key,
            "severity": severity,
            "reason": reason,
            "source": "permissions"
        })

    # ── 2. Score host permissions ─────────────────────────────────────────────
    hp_findings = _classify_host_permissions(host_permissions)
    for hpf in hp_findings:
        score += SEVERITY_WEIGHTS.get(hpf["severity"], 5.0)
        hpf["source"] = "host_permissions"
    host_findings = hp_findings

    # ── 3. Check dangerous permission combinations ────────────────────────────
    for combo_set, bonus, combo_reason in DANGEROUS_COMBINATIONS:
        # Check if all permissions in the combo are present
        if combo_set.issubset(all_perms_lower):
            score += bonus
            combination_findings.append({
                "combination": sorted(combo_set),
                "extra_score": bonus,
                "severity": "HIGH" if bonus < 15 else "CRITICAL",
                "reason": combo_reason
            })

    # ── 4. Manifest version flag (MV2 allows deprecated dangerous APIs) ───────
    mv_finding = None
    if manifest_version is not None and manifest_version == 2:
        score += 5.0
        mv_finding = {
            "check": "Manifest Version",
            "value": "Manifest V2",
            "severity": "LOW",
            "reason": (
                "This extension uses Manifest V2 which supports the deprecated "
                "`webRequestBlocking` API (now removed in MV3). MV2 extensions "
                "are being phased out by Chrome."
            )
        }

    # ── 5. Missing metadata penalty ──────────────────────────────────────────
    metadata_issues = []
    if not name:
        score += 3.0
        metadata_issues.append("Extension name not provided.")
    if not description:
        score += 2.0
        metadata_issues.append("Extension description not provided.")
    if not extension_id:
        score += 2.0
        metadata_issues.append("Extension ID not provided (cannot verify store origin).")

    # ── 6. Cap score at 100 ───────────────────────────────────────────────────
    score = min(round(score, 1), 100.0)
    risk_level = _normalize_risk_level(score)

    # ── 7. Build summary ─────────────────────────────────────────────────────
    total_findings = len(permission_findings) + len(host_findings) + len(combination_findings)
    critical_count = sum(
        1 for f in (permission_findings + host_findings)
        if f.get("severity") == "CRITICAL"
    ) + sum(
        1 for f in combination_findings
        if f.get("severity") == "CRITICAL"
    )

    if total_findings == 0 and score < 10:
        summary = (
            f"Extension analysis complete for '{name or extension_id or 'unknown'}'. "
            "No dangerous permissions detected. Risk is minimal."
        )
    else:
        summary = (
            f"Extension analysis complete for '{name or extension_id or 'unknown'}'. "
            f"Overall threat risk evaluated as {risk_level} (score: {score}). "
            f"{len(permission_findings)} permission(s) analyzed, "
            f"{len(combination_findings)} dangerous combination(s) detected, "
            f"{critical_count} critical finding(s)."
        )

    return {
        "extension_id": extension_id or "N/A",
        "name": name or "Unknown Extension",
        "version": version or "N/A",
        "description": description or "N/A",
        "manifest_version": manifest_version,
        "score": score,
        "risk_level": risk_level,
        "permissions_analyzed": permissions,
        "host_permissions_analyzed": host_permissions,
        "permission_findings": permission_findings,
        "host_findings": host_findings,
        "combination_findings": combination_findings,
        "manifest_finding": mv_finding,
        "metadata_issues": metadata_issues,
        "summary": summary,
        "engine": "CyberWatch Extension Analyzer 1.0",
    }
