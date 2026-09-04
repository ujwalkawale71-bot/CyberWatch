"""
Threat Intelligence Service — CyberWatch Threat Detection Platform

Clean architecture for external threat feed integration.
Currently returns "not_configured" status for all providers.

To enable a provider, set the corresponding environment variable in .env:
  VIRUSTOTAL_API_KEY=...
  PHISHTANK_API_KEY=...
  URLHAUS_API_KEY=...

IMPORTANT:
- Never fabricate threat intelligence results.
- Never put API keys in source code.
- Always check os.environ before attempting an external call.
"""
import os
from typing import Any, Dict, Optional


def _not_configured(provider: str, env_var: str) -> Dict[str, Any]:
    """Standard response when a feed is not configured."""
    return {
        "provider": provider,
        "configured": False,
        "matched": False,
        "confidence": 0,
        "status": "not_configured",
        "message": f"Threat intelligence feed is not configured. "
                   f"Set {env_var} in your .env file to enable this provider."
    }


def check_url(url: str) -> Dict[str, Any]:
    """
    Check a URL against configured threat intelligence feeds.
    Returns a dict with match status and provider details.
    If no feeds are configured, returns not_configured status.
    """
    results = []

    # ── VirusTotal ────────────────────────────────────────────────────────────
    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    if vt_key:
        # Future implementation: call VirusTotal URL reputation API
        results.append({
            "provider": "VirusTotal",
            "configured": True,
            "matched": False,
            "confidence": 0,
            "status": "pending_implementation",
            "message": "VirusTotal API key is configured. Live integration coming in Phase 4."
        })
    else:
        results.append(_not_configured("VirusTotal", "VIRUSTOTAL_API_KEY"))

    # ── PhishTank ─────────────────────────────────────────────────────────────
    pt_key = os.environ.get("PHISHTANK_API_KEY", "").strip()
    if pt_key:
        results.append({
            "provider": "PhishTank",
            "configured": True,
            "matched": False,
            "confidence": 0,
            "status": "pending_implementation",
            "message": "PhishTank API key is configured. Live integration coming in Phase 4."
        })
    else:
        results.append(_not_configured("PhishTank", "PHISHTANK_API_KEY"))

    # ── URLHaus ───────────────────────────────────────────────────────────────
    uh_key = os.environ.get("URLHAUS_API_KEY", "").strip()
    if uh_key:
        results.append({
            "provider": "URLHaus",
            "configured": True,
            "matched": False,
            "confidence": 0,
            "status": "pending_implementation",
            "message": "URLHaus API key is configured. Live integration coming in Phase 4."
        })
    else:
        results.append(_not_configured("URLHaus", "URLHAUS_API_KEY"))

    return {
        "target": url,
        "target_type": "url",
        "feeds_checked": len(results),
        "feeds_configured": sum(1 for r in results if r["configured"]),
        "any_match": any(r.get("matched", False) for r in results),
        "results": results
    }


def check_domain(domain: str) -> Dict[str, Any]:
    """
    Check a domain against configured threat intelligence feeds.
    """
    results = []

    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    if vt_key:
        results.append({
            "provider": "VirusTotal",
            "configured": True,
            "matched": False,
            "confidence": 0,
            "status": "pending_implementation",
            "message": "VirusTotal domain check coming in Phase 4."
        })
    else:
        results.append(_not_configured("VirusTotal", "VIRUSTOTAL_API_KEY"))

    return {
        "target": domain,
        "target_type": "domain",
        "feeds_checked": len(results),
        "feeds_configured": sum(1 for r in results if r["configured"]),
        "any_match": any(r.get("matched", False) for r in results),
        "results": results
    }


def check_ip(ip: str) -> Dict[str, Any]:
    """
    Check an IP address against configured threat intelligence feeds.
    """
    results = []

    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    if vt_key:
        results.append({
            "provider": "VirusTotal",
            "configured": True,
            "matched": False,
            "confidence": 0,
            "status": "pending_implementation",
            "message": "VirusTotal IP check coming in Phase 4."
        })
    else:
        results.append(_not_configured("VirusTotal", "VIRUSTOTAL_API_KEY"))

    return {
        "target": ip,
        "target_type": "ip",
        "feeds_checked": len(results),
        "feeds_configured": sum(1 for r in results if r["configured"]),
        "any_match": any(r.get("matched", False) for r in results),
        "results": results
    }


def check_extension(extension_id: str) -> Dict[str, Any]:
    """
    Check a browser extension against configured threat intelligence feeds.
    """
    results = []

    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    if vt_key:
        results.append({
            "provider": "VirusTotal",
            "configured": True,
            "matched": False,
            "confidence": 0,
            "status": "pending_implementation",
            "message": "VirusTotal extension check coming in Phase 4."
        })
    else:
        results.append(_not_configured("VirusTotal", "VIRUSTOTAL_API_KEY"))

    return {
        "target": extension_id,
        "target_type": "extension",
        "feeds_checked": len(results),
        "feeds_configured": sum(1 for r in results if r["configured"]),
        "any_match": any(r.get("matched", False) for r in results),
        "results": results
    }
