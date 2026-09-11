"""
CyberWatch Threat Intelligence Integration Service
Deterministic, Live Multi-Source Threat Intelligence Query Engine
Supports: Google Safe Browsing, VirusTotal, URLhaus, PhishTank
IOC Types: URL, Domain, IPv4, IPv6, SHA-256
"""
import urllib.request
import urllib.parse
import json
import base64
import re
import ipaddress
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.models.scan import Scan
from app.models.alert import Alert
from app.models.user import User


# ==============================================================================
# IOC Classification & Normalization
# ==============================================================================
import re
import ipaddress
import urllib.parse
from typing import Tuple

SHA256_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")
IPV4_REGEX = re.compile(r"^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
DOMAIN_REGEX = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)

def is_valid_ipv6(val: str) -> bool:
    try:
        ip_obj = ipaddress.ip_address(val)
        return isinstance(ip_obj, ipaddress.IPv6Address)
    except ValueError:
        return False

def is_private_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local
    except ValueError:
        return False

def classify_ioc(indicator: str) -> Tuple[str, str]:
    """
    Classify and normalize an Indicator of Compromise (IOC).
    Returns (ioc_type, normalized_value).
    ioc_type: 'url' | 'domain' | 'ipv4' | 'ipv6' | 'sha256' | 'unknown'
    """
    cleaned = (indicator or "").strip()
    if not cleaned:
        return "unknown", ""

    # 1. Check SHA-256 Hash (exact 64 hexadecimal chars)
    if SHA256_REGEX.match(cleaned):
        return "sha256", cleaned.lower()

    # 2. Check IPv4
    if IPV4_REGEX.match(cleaned):
        return "ipv4", cleaned

    # 3. Check IPv6
    if is_valid_ipv6(cleaned):
        ip_obj = ipaddress.ip_address(cleaned)
        return "ipv6", str(ip_obj)

    # 4. Check Pure Domain
    if DOMAIN_REGEX.match(cleaned):
        return "domain", cleaned.lower()

    # 5. Check URL format (explicit scheme or containing path/query)
    has_scheme = cleaned.lower().startswith("http://") or cleaned.lower().startswith("https://")
    url_to_parse = cleaned if has_scheme else f"https://{cleaned}"
    
    try:
        parsed = urllib.parse.urlparse(url_to_parse)
        if parsed.scheme in ("http", "https") and parsed.netloc:
            hostname = parsed.hostname
            # Hostname must be a valid domain or valid IP
            if hostname and (DOMAIN_REGEX.match(hostname) or IPV4_REGEX.match(hostname) or is_valid_ipv6(hostname)):
                # If it had an explicit scheme OR had a path/query/fragment beyond root "/", it's a URL
                if has_scheme or "/" in cleaned or "?" in cleaned or "#" in cleaned:
                    return "url", url_to_parse if not has_scheme else cleaned
    except Exception:
        pass

    # 6. Check host:port
    if ":" in cleaned and not has_scheme:
        host, _, port = cleaned.partition(":")
        if port.isdigit():
            if DOMAIN_REGEX.match(host):
                return "domain", host.lower()
            if IPV4_REGEX.match(host):
                return "ipv4", host

    return "unknown", cleaned


# ==============================================================================
# Live Threat Provider Query Clients
# ==============================================================================

def query_google_safe_browsing(ioc: str, ioc_type: str, api_key: str = "") -> Dict[str, Any]:
    """
    Query Google Safe Browsing API v4.
    Supports URL and Domain targets.
    """
    source_name = "Google Safe Browsing"
    timestamp = datetime.now(timezone.utc).isoformat()
    target_queried = ioc if ioc_type == "url" else (f"https://{ioc}/" if ioc_type == "domain" else ioc)

    if ioc_type not in ("url", "domain"):
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": bool(api_key),
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_SUPPORTED",
            "data_origin": "N/A",
            "http_status": None,
            "detections": [],
            "error": None,
            "reason": f"Google Safe Browsing does not support direct {ioc_type.upper()} lookups.",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    if not api_key:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": False,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_CONFIGURED",
            "data_origin": "NOT_CONFIGURED",
            "http_status": None,
            "detections": [],
            "error": "API key not configured in environment (GOOGLE_SAFE_BROWSING_API_KEY).",
            "reason": "API key required by Google Cloud (GOOGLE_SAFE_BROWSING_API_KEY).",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
    payload = {
        "client": {
            "clientId": "cyberwatch-scanner",
            "clientVersion": "2.0.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": target_queried}]
        }
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "CyberWatch-Threat-Scanner/2.0"}
        )
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            body = resp.read().decode("utf-8")
            res_json = json.loads(body)
            matches = res_json.get("matches", [])
            if matches:
                threat_types = [m.get("threatType") for m in matches]
                detections = [{"category": t, "evidence": f"Flagged by Google Safe Browsing as {t}"} for t in threat_types]
                return {
                    "source": source_name,
                    "target_queried": target_queried,
                    "configured": True,
                    "authentication_required": True,
                    "request_executed": True,
                    "status": "DETECTED",
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "detections": detections,
                    "error": None,
                    "reason": f"Flagged by Google Safe Browsing: {', '.join(threat_types)}",
                    "checked_at": timestamp,
                    "first_seen": None,
                    "last_seen": timestamp,
                    "details": matches
                }
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "NOT_DETECTED",
                "data_origin": "LIVE",
                "http_status": resp.status,
                "detections": [],
                "error": None,
                "reason": "No active threat match in Google Safe Browsing database.",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": None
            }
    except urllib.error.HTTPError as he:
        if he.code == 429:
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "RATE_LIMITED",
                "data_origin": "LIVE",
                "http_status": 429,
                "detections": [],
                "error": "Google Safe Browsing API rate limit reached.",
                "reason": "API rate limit exceeded.",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": None
            }
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": he.code,
            "detections": [],
            "error": f"HTTP Error {he.code}: {he.reason}",
            "reason": f"HTTP Error {he.code}: {he.reason}",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }
    except Exception as e:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": None,
            "detections": [],
            "error": str(e),
            "reason": str(e),
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }


def query_virustotal(ioc: str, ioc_type: str, api_key: str = "") -> Dict[str, Any]:
    """
    Query VirusTotal API v3.
    Supports URL, Domain, IPv4, IPv6, and SHA-256 hash.
    """
    source_name = "VirusTotal"
    timestamp = datetime.now(timezone.utc).isoformat()
    target_queried = ioc

    if not api_key:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": False,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_CONFIGURED",
            "data_origin": "NOT_CONFIGURED",
            "http_status": None,
            "detections": [],
            "error": "API key not configured in environment (VIRUSTOTAL_API_KEY).",
            "reason": "API key required by VirusTotal (VIRUSTOTAL_API_KEY).",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    # Private IP check
    if ioc_type in ("ipv4", "ipv6") and is_private_ip(ioc):
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_SUPPORTED",
            "data_origin": "N/A",
            "http_status": None,
            "detections": [],
            "error": None,
            "reason": f"Private/RFC 1918 IP address ({ioc}) is not routable on public threat feeds.",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    if ioc_type == "url":
        url_id = base64.urlsafe_b64encode(ioc.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    elif ioc_type == "domain":
        api_url = f"https://www.virustotal.com/api/v3/domains/{ioc}"
    elif ioc_type in ("ipv4", "ipv6"):
        api_url = f"https://www.virustotal.com/api/v3/ip_addresses/{ioc}"
    elif ioc_type == "sha256":
        api_url = f"https://www.virustotal.com/api/v3/files/{ioc}"
    else:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_SUPPORTED",
            "data_origin": "N/A",
            "http_status": None,
            "detections": [],
            "error": None,
            "reason": f"Unsupported IOC type: {ioc_type}",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    try:
        req = urllib.request.Request(
            api_url,
            headers={
                "x-apikey": api_key,
                "User-Agent": "CyberWatch-Threat-Scanner/2.0"
            }
        )
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            body = resp.read().decode("utf-8")
            res_json = json.loads(body)
            attributes = res_json.get("data", {}).get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)

            first_seen_ts = attributes.get("first_submission_date") or attributes.get("creation_date")
            last_seen_ts = attributes.get("last_analysis_date") or attributes.get("last_modification_date")

            first_seen = datetime.fromtimestamp(first_seen_ts, tz=timezone.utc).isoformat() if first_seen_ts else None
            last_seen = datetime.fromtimestamp(last_seen_ts, tz=timezone.utc).isoformat() if last_seen_ts else None

            if malicious > 0 or suspicious > 0:
                detections = [{
                    "category": "Malicious Reputation",
                    "evidence": f"Flagged by {malicious} security vendor(s) on VirusTotal ({suspicious} suspicious)."
                }]
                return {
                    "source": source_name,
                    "target_queried": target_queried,
                    "configured": True,
                    "authentication_required": True,
                    "request_executed": True,
                    "status": "DETECTED",
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "detections": detections,
                    "error": None,
                    "reason": f"Flagged by {malicious} security vendor(s) on VirusTotal ({suspicious} suspicious).",
                    "checked_at": timestamp,
                    "first_seen": first_seen,
                    "last_seen": last_seen,
                    "details": stats
                }
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "NOT_DETECTED",
                "data_origin": "LIVE",
                "http_status": resp.status,
                "detections": [],
                "error": None,
                "reason": "No security vendors flagged this IOC on VirusTotal.",
                "checked_at": timestamp,
                "first_seen": first_seen,
                "last_seen": last_seen,
                "details": stats
            }
    except urllib.error.HTTPError as he:
        if he.code == 404:
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "NOT_DETECTED",
                "http_status": 404,
                "detections": [],
                "error": None,
                "reason": "IOC not previously submitted to VirusTotal database.",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": None
            }
        if he.code == 429:
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "RATE_LIMITED",
                "data_origin": "LIVE",
                "http_status": 429,
                "detections": [],
                "error": "VirusTotal API rate limit reached.",
                "reason": "VirusTotal API rate limit reached.",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": None
            }
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": he.code,
            "detections": [],
            "error": f"HTTP Error {he.code}: {he.reason}",
            "reason": f"HTTP Error {he.code}: {he.reason}",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }
    except Exception as e:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": None,
            "detections": [],
            "error": str(e),
            "reason": str(e),
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }


def query_urlhaus(ioc: str, ioc_type: str, api_key: str = "") -> Dict[str, Any]:
    """
    Query URLhaus (abuse.ch).
    Supports URL, Domain, IPv4, and SHA-256 hash.
    """
    source_name = "URLhaus"
    timestamp = datetime.now(timezone.utc).isoformat()
    target_queried = ioc

    if not api_key:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": False,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_CONFIGURED",
            "data_origin": "NOT_CONFIGURED",
            "http_status": None,
            "detections": [],
            "error": "Auth-Key required by abuse.ch API (URLHAUS_API_KEY).",
            "reason": "Auth-Key required by abuse.ch API (URLHAUS_API_KEY).",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    # Private IP check
    if ioc_type in ("ipv4", "ipv6") and is_private_ip(ioc):
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_SUPPORTED",
            "data_origin": "N/A",
            "http_status": None,
            "detections": [],
            "error": None,
            "reason": f"Private IP address ({ioc}) is non-routable on URLhaus.",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    headers = {
        "User-Agent": "CyberWatch-Threat-Scanner/2.0",
        "Auth-Key": api_key
    }

    if ioc_type == "url":
        api_url = "https://urlhaus-api.abuse.ch/v1/url/"
        data = urllib.parse.urlencode({"url": ioc}).encode("utf-8")
    elif ioc_type in ("domain", "ipv4"):
        api_url = "https://urlhaus-api.abuse.ch/v1/host/"
        data = urllib.parse.urlencode({"host": ioc}).encode("utf-8")
    elif ioc_type == "sha256":
        api_url = "https://urlhaus-api.abuse.ch/v1/payload/"
        data = urllib.parse.urlencode({"sha256_hash": ioc}).encode("utf-8")
    else:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": False,
            "status": "NOT_SUPPORTED",
            "data_origin": "N/A",
            "http_status": None,
            "detections": [],
            "error": None,
            "reason": f"URLhaus does not support {ioc_type.upper()} lookups.",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    try:
        req = urllib.request.Request(api_url, data=data, headers=headers)
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            body = resp.read().decode("utf-8")
            res_json = json.loads(body)
            query_status = res_json.get("query_status")

            first_seen = res_json.get("firstseen")
            last_seen = res_json.get("lastseen")

            if query_status == "ok":
                threat = res_json.get("threat") or res_json.get("signature") or "Malware"
                tags = res_json.get("tags") or []
                detections = [{
                    "category": f"Malware ({threat})",
                    "evidence": f"Active malware record in URLhaus (Threat: {threat}, Tags: {', '.join(tags) if tags else 'malware'})."
                }]
                return {
                    "source": source_name,
                    "target_queried": target_queried,
                    "configured": True,
                    "authentication_required": True,
                    "request_executed": True,
                    "status": "DETECTED",
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "detections": detections,
                    "error": None,
                    "reason": f"Active malware record in URLhaus (Threat: {threat}, Tags: {', '.join(tags) if tags else 'malware'}).",
                    "checked_at": timestamp,
                    "first_seen": first_seen,
                    "last_seen": last_seen,
                    "details": res_json
                }
            if query_status == "no_results":
                return {
                    "source": source_name,
                    "target_queried": target_queried,
                    "configured": True,
                    "authentication_required": True,
                    "request_executed": True,
                    "status": "NOT_DETECTED",
                    "http_status": resp.status,
                    "detections": [],
                    "error": None,
                    "reason": "IOC not listed in URLhaus malware database.",
                    "checked_at": timestamp,
                    "first_seen": None,
                    "last_seen": None,
                    "details": None
                }
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "FAILED",
                "http_status": resp.status,
                "detections": [],
                "error": f"URLhaus query returned status: {query_status}",
                "reason": f"URLhaus query returned status: {query_status}",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": res_json
            }
    except urllib.error.HTTPError as he:
        if he.code == 429:
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": True,
                "request_executed": True,
                "status": "RATE_LIMITED",
                "data_origin": "LIVE",
                "http_status": 429,
                "detections": [],
                "error": "URLhaus API rate limit exceeded.",
                "reason": "URLhaus API rate limit exceeded.",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": None
            }
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": he.code,
            "detections": [],
            "error": f"HTTP Error {he.code}: {he.reason}",
            "reason": f"HTTP Error {he.code}: {he.reason}",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }
    except Exception as e:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": True,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": None,
            "detections": [],
            "error": str(e),
            "reason": str(e),
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }


def query_phishtank(ioc: str, ioc_type: str, api_key: str = "") -> Dict[str, Any]:
    """
    Query PhishTank.
    Supports URL targets and public unauthenticated single-URL checks.
    """
    source_name = "PhishTank"
    timestamp = datetime.now(timezone.utc).isoformat()
    target_queried = ioc if ioc_type == "url" else (f"https://{ioc}/" if ioc_type == "domain" else ioc)

    if ioc_type not in ("url", "domain"):
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": False,
            "request_executed": False,
            "status": "NOT_SUPPORTED",
            "data_origin": "N/A",
            "http_status": None,
            "detections": [],
            "error": None,
            "reason": f"PhishTank does not support direct {ioc_type.upper()} lookups.",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }

    api_url = "https://checkurl.phishtank.com/checkurl/"
    params = {
        "url": target_queried,
        "format": "json"
    }
    if api_key:
        params["app_key"] = api_key

    data = urllib.parse.urlencode(params).encode("utf-8")
    headers = {"User-Agent": "phishtank/cyberwatch-security-scanner"}

    try:
        req = urllib.request.Request(api_url, data=data, headers=headers)
        for attempt in range(2):
            try:
                with urllib.request.urlopen(req, timeout=5.0) as resp:
                    body = resp.read().decode("utf-8")
                    res_json = json.loads(body)
                    results = res_json.get("results", {})
                    in_db = results.get("in_database", False)
                    is_valid = results.get("valid", False)
                    phish_id = results.get("phish_id")
                    verified_at = results.get("verified_at")

                    if in_db and is_valid:
                        detections = [{
                            "category": "Phishing",
                            "evidence": f"Verified active phishing target in PhishTank (Phish ID: {phish_id})."
                        }]
                        return {
                            "source": source_name,
                            "target_queried": target_queried,
                            "configured": True,
                            "authentication_required": False,
                            "request_executed": True,
                            "status": "DETECTED",
                            "data_origin": "LIVE",
                            "http_status": resp.status,
                            "detections": detections,
                            "error": None,
                            "reason": f"Verified active phishing target in PhishTank (Phish ID: {phish_id}).",
                            "checked_at": timestamp,
                            "first_seen": verified_at,
                            "last_seen": timestamp,
                            "details": results
                        }
                    
                    if in_db and not is_valid:
                        return {
                            "source": source_name,
                            "target_queried": target_queried,
                            "configured": True,
                            "authentication_required": False,
                            "request_executed": True,
                            "status": "NOT_DETECTED",
                            "data_origin": "LIVE",
                            "http_status": resp.status,
                            "detections": [],
                            "error": None,
                            "reason": f"Found in PhishTank archive but currently marked invalid/inactive (Phish ID: {phish_id}).",
                            "checked_at": timestamp,
                            "first_seen": verified_at,
                            "last_seen": timestamp,
                            "details": results
                        }

                    return {
                        "source": source_name,
                        "target_queried": target_queried,
                        "configured": True,
                        "authentication_required": False,
                        "request_executed": True,
                        "status": "NOT_DETECTED",
                        "data_origin": "LIVE",
                        "http_status": resp.status,
                        "detections": [],
                        "error": None,
                        "reason": "Not listed in PhishTank active phishing database.",
                        "checked_at": timestamp,
                        "first_seen": None,
                        "last_seen": None,
                        "details": results
                    }
            except Exception as e:
                if attempt == 0:
                    continue
                raise e
    except urllib.error.HTTPError as he:
        if he.code == 429:
            return {
                "source": source_name,
                "target_queried": target_queried,
                "configured": True,
                "authentication_required": False,
                "request_executed": True,
                "status": "RATE_LIMITED",
                "data_origin": "LIVE",
                "http_status": 429,
                "detections": [],
                "error": "PhishTank public rate limit reached.",
                "reason": "PhishTank public rate limit reached.",
                "checked_at": timestamp,
                "first_seen": None,
                "last_seen": None,
                "details": None
            }
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": False,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": he.code,
            "detections": [],
            "error": f"HTTP Error {he.code}: {he.reason}",
            "reason": f"HTTP Error {he.code}: {he.reason}",
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }
    except Exception as e:
        return {
            "source": source_name,
            "target_queried": target_queried,
            "configured": True,
            "authentication_required": False,
            "request_executed": True,
            "status": "FAILED",
            "data_origin": "LIVE",
            "http_status": None,
            "detections": [],
            "error": str(e),
            "reason": str(e),
            "checked_at": timestamp,
            "first_seen": None,
            "last_seen": None,
            "details": None
        }


# ==============================================================================
# Multi-Source Query Coordinator for URL Scanner (Backwards-Compatibility)
# ==============================================================================

def query_all_threat_intelligence(url: str) -> Dict[str, Any]:
    """
    Query all supported vendor feeds for a URL.
    Maintains full compatibility with url_scanner.py.
    """
    ioc_type, normalized_val = classify_ioc(url)
    if ioc_type == "unknown":
        ioc_type = "url"
        normalized_val = url

    sources_records = []

    # 1. Google Safe Browsing
    gsb_key = getattr(settings, "GOOGLE_SAFE_BROWSING_API_KEY", "") or os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
    gsb_res = query_google_safe_browsing(normalized_val, ioc_type, gsb_key)
    sources_records.append(gsb_res)

    # 2. VirusTotal
    vt_key = getattr(settings, "VIRUSTOTAL_API_KEY", "") or os.getenv("VIRUSTOTAL_API_KEY", "")
    vt_res = query_virustotal(normalized_val, ioc_type, vt_key)
    sources_records.append(vt_res)

    # 3. URLhaus
    urlhaus_key = getattr(settings, "URLHAUS_API_KEY", "") or os.getenv("URLHAUS_API_KEY", "")
    urlhaus_res = query_urlhaus(normalized_val, ioc_type, urlhaus_key)
    sources_records.append(urlhaus_res)

    # 4. PhishTank
    pt_key = getattr(settings, "PHISHTANK_API_KEY", "") or os.getenv("PHISHTANK_API_KEY", "")
    pt_res = query_phishtank(normalized_val, ioc_type, pt_key)
    sources_records.append(pt_res)

    total_sources = len(sources_records)
    configured_sources = len([s for s in sources_records if s.get("configured", False)])
    executed_sources = len([s for s in sources_records if s.get("request_executed", False)])
    successful_sources = len([s for s in sources_records if s.get("status") in ("DETECTED", "NOT_DETECTED")])
    detected_sources = len([s for s in sources_records if s.get("status") == "DETECTED"])
    failed_sources = len([s for s in sources_records if s.get("status") in ("FAILED", "RATE_LIMITED")])
    unconfigured_sources = len([s for s in sources_records if s.get("status") == "NOT_CONFIGURED"])

    coverage_summary = f"{successful_sources} / {total_sources} sources successfully analyzed"
    if successful_sources == total_sources:
        coverage_status = "AVAILABLE"
        coverage_note = f"All {total_sources} external threat intelligence databases are active and contributed to this scan."
    elif successful_sources > 0:
        active_names = [s["source"] for s in sources_records if s.get("status") in ("DETECTED", "NOT_DETECTED")]
        coverage_status = "PARTIAL"
        coverage_note = f"{successful_sources} of {total_sources} external threat intelligence sources executed successfully ({', '.join(active_names)})."
    else:
        coverage_status = "NOT AVAILABLE"
        coverage_note = "No external malicious URL reputation databases were available for this scan."

    findings = []
    for d in sources_records:
        if d.get("status") == "DETECTED":
            category = d.get("detections", [{}])[0].get("category", "Reputation Detection")
            findings.append({
                "id": f"intel-{d['source'].lower().replace(' ', '-')}",
                "category": "Threat Intelligence Feeds",
                "title": f"Threat Intelligence Detection: {d['source']}",
                "severity": "CRITICAL",
                "evidence_type": "VERIFIED_THREAT",
                "score_impact": 95.0,
                "confidence_rating": "HIGH",
                "statusTag": "Confirmed Malicious",
                "reason": d["reason"],
                "evidence": f"Confirmed by live {d['source']} query (HTTP {d.get('http_status', 200)}) at {d['checked_at']}",
                "module": "threat_intelligence",
                "confidence": 0.99,
                "timestamp": d["checked_at"]
            })

    return {
        "sources_queried": sources_records,
        "total_sources": total_sources,
        "configured_sources": configured_sources,
        "executed_sources": executed_sources,
        "successful_sources": successful_sources,
        "detected_sources": detected_sources,
        "failed_sources": failed_sources,
        "unconfigured_sources": unconfigured_sources,
        "coverage_summary": coverage_summary,
        "coverage_status": coverage_status,
        "coverage_note": coverage_note,
        "findings": findings
    }


# ==============================================================================
# ==============================================================================
# Full IOC Investigation & Persistence (Evidence-Based Synthesis)
# ==============================================================================

def calculate_shannon_entropy(text: str) -> float:
    import math
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    for x in set(text):
        p_x = text.count(x) / length
        entropy += - p_x * math.log2(p_x)
    return round(entropy, 3)

def run_local_cyberwatch_analysis(ioc: str, ioc_type: str) -> Dict[str, Any]:
    """
    Performs deterministic local CyberWatch heuristic analysis.
    Labels all generated findings under 'Local CyberWatch Analysis'.
    """
    findings = []
    risk_score = 0.0

    if ioc_type in ("url", "domain"):
        target_url = ioc if ioc.startswith(("http://", "https://")) else f"https://{ioc}"
        parsed = urllib.parse.urlparse(target_url)
        hostname = (parsed.hostname or "").lower()
        path = parsed.path or ""
        scheme = parsed.scheme.lower()
        is_ip_host = False

        # 1. Transport Encryption Check
        if scheme == "http":
            risk_score += 15.0
            findings.append({
                "source": "Local CyberWatch Analysis",
                "category": "Insecure Transport",
                "severity": "MEDIUM",
                "finding": "Unencrypted HTTP protocol detected. Cleartext communication lacks confidentiality."
            })

        # 2. Host is raw IP address
        try:
            ip_obj = ipaddress.ip_address(hostname)
            is_ip_host = True
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved or ip_obj.is_link_local:
                risk_score += 50.0
                findings.append({
                    "source": "Local CyberWatch Analysis",
                    "category": "SSRF / Private IP",
                    "severity": "CRITICAL",
                    "finding": f"Target host points to a private/internal IP ({hostname}), posing SSRF risk."
                })
            else:
                risk_score += 25.0
                findings.append({
                    "source": "Local CyberWatch Analysis",
                    "category": "Direct IP Host",
                    "severity": "HIGH",
                    "finding": f"Host is a raw public IPv4/IPv6 address ({hostname}) rather than a registered domain name."
                })
        except ValueError:
            pass

        # 3. Phishing / Credential Harvesting Keywords
        phish_keywords = [
            "login", "signin", "banking", "verify", "verification", "update", "account",
            "security", "wallet", "paypal", "microsoft", "apple", "google", "support",
            "recovery", "authenticate", "passcode", "credential", "auth-check", "portal-auth",
            "invoice", "secure-bank"
        ]
        detected_phish = [kw for kw in phish_keywords if kw in hostname or kw in path]
        if detected_phish:
            impact = min(45.0, len(detected_phish) * 20.0)
            risk_score += impact
            findings.append({
                "source": "Local CyberWatch Analysis",
                "category": "Phishing Indicators",
                "severity": "HIGH",
                "finding": f"High-risk credential harvesting keywords detected: {', '.join(detected_phish)}."
            })

        # 4. Dangerous Payload Artifacts
        danger_extensions = [".exe", ".scr", ".bat", ".vbs", ".ps1", ".pcap", ".elf", ".sh", ".apk", ".dmg", ".dll", ".hta"]
        for ext in danger_extensions:
            if path.lower().endswith(ext):
                risk_score += 35.0
                findings.append({
                    "source": "Local CyberWatch Analysis",
                    "category": "Dangerous Payload",
                    "severity": "HIGH",
                    "finding": f"URL directly links to executable or suspicious payload artifact ({ext})."
                })
                break

        # 5. Suspicious TLDs
        if not is_ip_host:
            suspicious_tlds = [".top", ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".buzz", ".fit", ".icu", ".work", ".click", ".link"]
            for stld in suspicious_tlds:
                if hostname.endswith(stld):
                    risk_score += 20.0
                    findings.append({
                        "source": "Local CyberWatch Analysis",
                        "category": "Suspicious TLD",
                        "severity": "MEDIUM",
                        "finding": f"Domain registered under high-abuse/suspicious top-level domain ({stld})."
                    })
                    break

            # 6. Excessive Subdomain Nesting
            subdomain_parts = hostname.split(".")
            if len(subdomain_parts) >= 4 and not hostname.endswith(".co.uk") and not hostname.endswith(".co.in"):
                risk_score += 15.0
                findings.append({
                    "source": "Local CyberWatch Analysis",
                    "category": "Complex Domain Structure",
                    "severity": "LOW",
                    "finding": f"Excessive subdomain nesting ({len(subdomain_parts) - 2} levels) frequently associated with phishing."
                })

            # 7. Entropy Check (DGA Detection)
            if len(hostname) > 10:
                domain_name = hostname.split(".")[0]
                ent = calculate_shannon_entropy(domain_name)
                if ent >= 3.8 and len(domain_name) >= 12:
                    risk_score += 25.0
                    findings.append({
                        "source": "Local CyberWatch Analysis",
                        "category": "High Lexical Entropy",
                        "severity": "MEDIUM",
                        "finding": f"High Shannon entropy ({ent}) indicates potential DGA or machine-generated domain."
                    })

        # 8. Embedded Credentials
        if "@" in parsed.netloc:
            risk_score += 30.0
            findings.append({
                "source": "Local CyberWatch Analysis",
                "category": "Embedded Credentials",
                "severity": "HIGH",
                "finding": "URL contains embedded credentials in authority string, common in phishing spoofing attacks."
            })

    elif ioc_type in ("ipv4", "ipv6"):
        try:
            ip_obj = ipaddress.ip_address(ioc)
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved or ip_obj.is_link_local:
                risk_score += 50.0
                findings.append({
                    "source": "Local CyberWatch Analysis",
                    "category": "Non-Routable IP",
                    "severity": "HIGH",
                    "finding": f"IP address ({ioc}) belongs to private/internal/reserved RFC subnet."
                })
            else:
                known_benign_ips = {"8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1", "9.9.9.9", "208.67.222.222", "2001:4860:4860::8888"}
                if ioc in known_benign_ips:
                    findings.append({
                        "source": "Local CyberWatch Analysis",
                        "category": "Known Public Infrastructure",
                        "severity": "CLEAN",
                        "finding": f"IP is a recognized, trusted public recursive DNS infrastructure."
                    })
        except ValueError:
            pass

    elif ioc_type == "sha256":
        if ioc.lower() == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855":
            findings.append({
                "source": "Local CyberWatch Analysis",
                "category": "Standard Hash",
                "severity": "INFO",
                "finding": "SHA-256 hash corresponds to the standard empty file digest."
            })

    final_score = min(100.0, round(risk_score, 1))
    return {
        "available": True,
        "risk_score": final_score,
        "findings": findings
    }


def investigate_ioc(
    ioc: str,
    db: Session,
    user_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Investigate an IOC across configured feeds and local CyberWatch analysis engines,
    compute evidence-based risk score and verdict, persist the scan record,
    and create an alert if confirmed high-risk/malicious.
    """
    raw_input = (ioc or "").strip()
    if not raw_input:
        raise ValueError("Indicator of Compromise (IOC) cannot be empty.")

    ioc_type, normalized_val = classify_ioc(raw_input)
    if ioc_type == "unknown":
        raise ValueError(f"Invalid or unsupported Indicator of Compromise format: '{raw_input}'")

    # 1. Run Local CyberWatch Analysis
    local_analysis = run_local_cyberwatch_analysis(normalized_val, ioc_type)
    local_score = local_analysis["risk_score"]
    local_findings = local_analysis["findings"]

    # 2. Run External Threat Intelligence Feeds
    sources_records = []

    # Google Safe Browsing
    gsb_key = getattr(settings, "GOOGLE_SAFE_BROWSING_API_KEY", "") or os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
    gsb_res = query_google_safe_browsing(normalized_val, ioc_type, gsb_key)
    sources_records.append(gsb_res)

    # VirusTotal
    vt_key = getattr(settings, "VIRUSTOTAL_API_KEY", "") or os.getenv("VIRUSTOTAL_API_KEY", "")
    vt_res = query_virustotal(normalized_val, ioc_type, vt_key)
    sources_records.append(vt_res)

    # URLhaus
    urlhaus_key = getattr(settings, "URLHAUS_API_KEY", "") or os.getenv("URLHAUS_API_KEY", "")
    urlhaus_res = query_urlhaus(normalized_val, ioc_type, urlhaus_key)
    sources_records.append(urlhaus_res)

    # PhishTank
    pt_key = getattr(settings, "PHISHTANK_API_KEY", "") or os.getenv("PHISHTANK_API_KEY", "")
    pt_res = query_phishtank(normalized_val, ioc_type, pt_key)
    sources_records.append(pt_res)

    # Feed Statuses
    detected_sources = [s for s in sources_records if s.get("status") == "DETECTED"]
    not_detected_sources = [s for s in sources_records if s.get("status") == "NOT_DETECTED"]
    configured_count = len([s for s in sources_records if s.get("configured", False)])
    executed_count = len([s for s in sources_records if s.get("request_executed", False)])
    unconfigured_sources = [s for s in sources_records if s.get("status") == "NOT_CONFIGURED"]

    # First Seen / Last Seen
    first_seen_val = None
    last_seen_val = None
    for s in sources_records:
        if s.get("first_seen") and not first_seen_val:
            first_seen_val = s["first_seen"]
        if s.get("last_seen") and not last_seen_val:
            last_seen_val = s["last_seen"]

    first_seen_display = first_seen_val if first_seen_val else "Not available"
    last_seen_display = last_seen_val if last_seen_val else "Not available"

    # ==============================================================================
    # Rigorous Evidence-Based Verdict Synthesis
    # ==============================================================================
    verdict_evidence = []
    
    # Add local findings to evidence list
    for lf in local_findings:
        verdict_evidence.append({
            "source": lf["source"],
            "category": lf["category"],
            "finding": lf["finding"]
        })

    # Case A: Multi-vendor or single-vendor external feed match (Confirmed Malicious)
    if len(detected_sources) >= 2:
        verdict = "MALICIOUS"
        risk_score = 95.0
        threat_level = "CRITICAL"
        confidence = 98.0
        for d in detected_sources:
            for det in d.get("detections", []):
                verdict_evidence.append({
                    "source": d["source"],
                    "category": det.get("category", "Threat Detected"),
                    "finding": det.get("evidence", d.get("reason", "Malicious activity confirmed."))
                })
    elif len(detected_sources) == 1:
        verdict = "MALICIOUS"
        risk_score = max(85.0, local_score)
        threat_level = "HIGH"
        confidence = 90.0
        for d in detected_sources:
            for det in d.get("detections", []):
                verdict_evidence.append({
                    "source": d["source"],
                    "category": det.get("category", "Threat Detected"),
                    "finding": det.get("evidence", d.get("reason", "Malicious activity confirmed."))
                })
    # Case B: Local heuristic engine detected high/critical threats
    elif local_score >= 60.0:
        verdict = "MALICIOUS"
        risk_score = local_score
        threat_level = "HIGH" if local_score < 80.0 else "CRITICAL"
        confidence = 85.0
    # Case C: Local heuristic engine detected moderate/suspicious patterns
    elif local_score >= 25.0:
        verdict = "SUSPICIOUS"
        risk_score = local_score
        threat_level = "MEDIUM" if local_score >= 40.0 else "LOW"
        confidence = 70.0
    # Case D: Clean consensus across multiple external feeds
    elif len(not_detected_sources) >= 2 and local_score == 0.0:
        verdict = "CLEAN"
        risk_score = 0.0
        threat_level = "CLEAN"
        confidence = min(95.0, 65.0 + (len(not_detected_sources) * 10.0))
        active_names = [s["source"] for s in not_detected_sources]
        verdict_evidence.append({
            "source": "CyberWatch Consensus",
            "category": "Clean Reputation",
            "finding": f"Clean reputation confirmed across {len(not_detected_sources)} active security providers: {', '.join(active_names)}."
        })
    # Case E: Single external check or 0 feeds + clean local analysis
    elif len(not_detected_sources) == 1 and local_score == 0.0:
        verdict = "UNASSESSED"
        risk_score = 0.0
        threat_level = "UNASSESSED"
        confidence = 35.0
        single_src = not_detected_sources[0]["source"]
        unconf_names = [s["source"] for s in unconfigured_sources]
        verdict_evidence.append({
            "source": single_src,
            "category": "Partial Intelligence",
            "finding": f"Queried {single_src} (no active matches). Local analysis found no suspicious heuristics. However, {len(unconfigured_sources)} primary threat feeds ({', '.join(unconf_names)}) are NOT CONFIGURED (missing API keys). Overall status is UNASSESSED."
        })
    else:
        # Zero external feeds ran / not supported
        verdict = "UNASSESSED"
        risk_score = local_score
        threat_level = "UNASSESSED"
        confidence = 15.0 if not any(f.get("severity") == "CLEAN" for f in local_findings) else 50.0
        unconf_names = [s["source"] for s in unconfigured_sources]
        if not local_findings:
            verdict_evidence.append({
                "source": "Feed Notice",
                "category": "Feeds Unavailable",
                "finding": f"No configured external threat feeds support or have active credentials for {ioc_type.upper()} lookups. Status is UNASSESSED."
            })

    # Detections list for structured response
    all_detections = []
    for s in sources_records:
        if s.get("status") == "DETECTED":
            for det in s.get("detections", []):
                all_detections.append({
                    "source": s["source"],
                    "category": det.get("category", "Malicious Indicator"),
                    "evidence": det.get("evidence", s.get("reason")),
                    "timestamp": s.get("checked_at")
                })

    investigation_result = {
        "target": normalized_val,
        "target_type": ioc_type,
        "input_ioc": raw_input,
        "ioc": normalized_val,
        "normalized_ioc": normalized_val,
        "ioc_type": ioc_type,
        "verdict": verdict,
        "risk_score": risk_score,
        "threat_level": threat_level,
        "confidence": confidence,
        "providers_checked": executed_count,
        "providers_available": configured_count,
        "feed_detections": len(detected_sources),
        "first_seen": first_seen_display,
        "last_seen": last_seen_display,
        "investigated_at": datetime.now(timezone.utc).isoformat(),
        "sources": sources_records,
        "local_analysis": local_analysis,
        "detections": all_detections,
        "verdict_evidence": verdict_evidence,
        "stats": {
            "total_sources": len(sources_records),
            "configured_sources": configured_count,
            "executed_sources": executed_count,
            "detected_sources": len(detected_sources),
            "clean_sources": len(not_detected_sources)
        }
    }

    # Resolve User ID for persistence
    target_user_id = user_id
    if not target_user_id:
        first_user = db.query(User).first()
        target_user_id = first_user.id if first_user else 1

    # Persist Scan record
    scan_record = Scan(
        user_id=target_user_id,
        target=normalized_val,
        scan_type="threat_intelligence",
        risk_score=risk_score,
        risk_level=threat_level,
        status="Completed",
        created_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
        result=investigation_result
    )
    db.add(scan_record)
    db.flush()

    # Trigger Alert if High or Critical risk
    if threat_level in ("CRITICAL", "HIGH"):
        alert_title = f"Threat Intel Alert: {verdict} {ioc_type.upper()} ({normalized_val[:50]})"
        evidence_summary = "; ".join(
            [f"{d['source']}: {d.get('reason', '')}" for d in detected_sources] +
            [f"{lf['source']}: {lf['finding']}" for lf in local_findings if lf.get("severity") in ("HIGH", "CRITICAL")]
        )
        alert_desc = f"Identified as {threat_level} threat with risk score {risk_score}/100. " + evidence_summary
        alert_record = Alert(
            user_id=target_user_id,
            scan_id=scan_record.id,
            title=alert_title[:255],
            severity=threat_level,
            description=alert_desc[:1000],
            status="Unresolved",
            created_at=datetime.now(timezone.utc)
        )
        db.add(alert_record)

    db.commit()
    db.refresh(scan_record)

    investigation_result["scan_id"] = scan_record.id
    return investigation_result


# ==============================================================================
# Overview & Aggregated Statistics
# ==============================================================================

def get_threat_intel_overview(db: Session) -> Dict[str, Any]:
    """
    Calculate real overview statistics from the database and feed statuses.
    100% evidence-based, zero mock data.
    """
    # 1. Indicators Checked = Total Scans in DB
    total_scans_count = db.query(Scan).count()

    # 2. Threats Confirmed = Scans with HIGH or CRITICAL risk
    threats_confirmed_count = db.query(Scan).filter(Scan.risk_level.in_(["HIGH", "CRITICAL"])).count()

    # 3. Active Alerts = Unresolved alerts in DB
    active_alerts_count = db.query(Alert).filter(Alert.status == "Unresolved").count()

    # 4. Provider Statuses Check
    providers_status_list = get_providers_status()
    online_count = sum(1 for p in providers_status_list if p.get("operational_status") in ("ONLINE", "AVAILABLE"))
    sources_online_display = f"{online_count}/{len(providers_status_list)}"

    # 5. Recent Intelligence = Last 15 scans from database
    recent_db_scans = db.query(Scan).order_by(Scan.created_at.desc()).limit(15).all()
    recent_intelligence = []
    for sc in recent_db_scans:
        res = sc.result or {}
        ioc_val = sc.target
        ioc_type = res.get("ioc_type") or ("url" if sc.scan_type == "URL" else "indicator")
        first_detection = (res.get("detections") or [{}])[0] if res.get("detections") else {}
        category = first_detection.get("category") or ("Malware" if sc.risk_level in ("HIGH", "CRITICAL") else "Clean")
        source = first_detection.get("source") or "CyberWatch Engine"

        recent_intelligence.append({
            "id": sc.id,
            "indicator": ioc_val,
            "type": ioc_type,
            "category": category,
            "source": source,
            "risk_score": sc.risk_score,
            "threat_level": sc.risk_level,
            "created_at": sc.created_at.isoformat() if sc.created_at else None
        })

    # 6. Threat Categories Breakdown from genuine scan results
    category_counts: Dict[str, int] = {}
    high_risk_scans = db.query(Scan).filter(Scan.risk_level.in_(["HIGH", "CRITICAL"])).all()
    for sc in high_risk_scans:
        res = sc.result or {}
        detections = res.get("detections") or []
        if detections:
            for det in detections:
                cat = det.get("category", "Malware")
                category_counts[cat] = category_counts.get(cat, 0) + 1
        else:
            cat = "General Threat"
            category_counts[cat] = category_counts.get(cat, 0) + 1

    threat_categories = [
        {"category": k, "count": v}
        for k, v in sorted(category_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    return {
        "kpis": {
            "indicators_checked": total_scans_count,
            "threats_confirmed": threats_confirmed_count,
            "active_alerts": active_alerts_count,
            "sources_online": sources_online_display
        },
        "provider_statuses": providers_status_list,
        "recent_intelligence": recent_intelligence,
        "threat_categories": threat_categories
    }


def get_providers_status() -> List[Dict[str, Any]]:
    """
    Returns actual operational and configuration status for each external threat feed.
    """
    providers = []

    # 1. Google Safe Browsing
    gsb_key = getattr(settings, "GOOGLE_SAFE_BROWSING_API_KEY", "") or os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
    providers.append({
        "name": "Google Safe Browsing",
        "type": "Cloud Threat List",
        "supported_iocs": ["URL", "Domain"],
        "is_configured": bool(gsb_key),
        "auth_required": True,
        "operational_status": "ONLINE" if bool(gsb_key) else "NOT_CONFIGURED",
        "description": "Google Safe Browsing API v4 reputation lookup service for malware and phishing URLs.",
        "docs_url": "https://developers.google.com/safe-browsing"
    })

    # 2. VirusTotal
    vt_key = getattr(settings, "VIRUSTOTAL_API_KEY", "") or os.getenv("VIRUSTOTAL_API_KEY", "")
    providers.append({
        "name": "VirusTotal",
        "type": "Multi-Antivirus Aggregator",
        "supported_iocs": ["URL", "Domain", "IPv4", "IPv6", "SHA-256"],
        "is_configured": bool(vt_key),
        "auth_required": True,
        "operational_status": "ONLINE" if bool(vt_key) else "NOT_CONFIGURED",
        "description": "VirusTotal v3 multi-engine antivirus scanner and domain/IP reputation analyzer.",
        "docs_url": "https://developers.virustotal.com/reference/overview"
    })

    # 3. URLhaus
    urlhaus_key = getattr(settings, "URLHAUS_API_KEY", "") or os.getenv("URLHAUS_API_KEY", "")
    providers.append({
        "name": "URLhaus",
        "type": "Malware URL Feed",
        "supported_iocs": ["URL", "Domain", "IPv4", "SHA-256"],
        "is_configured": bool(urlhaus_key),
        "auth_required": True,
        "operational_status": "ONLINE" if bool(urlhaus_key) else "NOT_CONFIGURED",
        "description": "abuse.ch URLhaus malware distribution site tracking database.",
        "docs_url": "https://urlhaus.abuse.ch/api/"
    })

    # 4. PhishTank
    pt_key = getattr(settings, "PHISHTANK_API_KEY", "") or os.getenv("PHISHTANK_API_KEY", "")
    providers.append({
        "name": "PhishTank",
        "type": "Community Phishing Feed",
        "supported_iocs": ["URL", "Domain"],
        "is_configured": True,  # PhishTank allows public single-URL queries
        "auth_required": False,
        "operational_status": "ONLINE",
        "description": "OpenDNS PhishTank community-verified phishing database.",
        "docs_url": "https://www.phishtank.com/developer_info.php"
    })

    return providers
