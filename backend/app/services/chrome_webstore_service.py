"""
Chrome Web Store Service — CyberWatch Threat Detection Platform

Provides robust, safe resolution of Chrome Web Store URLs, Extension IDs,
public store metadata (via AF_initDataCallback and OpenGraph), and safe in-memory
CRX2/CRX3/ZIP package manifest extraction with localization resolution.
Includes SSRF protection, size limits, and Zip Slip prevention.
"""
import urllib.request
import urllib.parse
import re
import json
import zipfile
import io
import struct
from typing import Optional, Tuple, Dict, Any

# Chrome Extension IDs are 32 characters long using lowercase characters a-p
EXTENSION_ID_REGEX = re.compile(r'^[a-p]{32}$', re.IGNORECASE)
CHROME_URL_PATTERN = re.compile(
    r'(?:chromewebstore\.google\.com|chrome\.google\.com/webstore)/detail/(?:[^/?#]+/)?([a-p]{32})',
    re.IGNORECASE
)

MAX_PACKAGE_SIZE = 100 * 1024 * 1024  # 100 MB max for large extensions (e.g. Grammarly)
MAX_MANIFEST_SIZE = 5 * 1024 * 1024    # 5 MB max for manifest.json


def parse_extension_input(input_str: str) -> Tuple[Optional[str], str]:
    """
    Parse user input and determine input type and canonical 32-char extension ID.
    Returns (extension_id, input_type).
    """
    clean = (input_str or "").strip()
    if not clean:
        return None, "empty"

    # Check if raw JSON manifest string
    if clean.startswith("{") and clean.endswith("}"):
        try:
            parsed = json.loads(clean)
            if isinstance(parsed, dict) and ("manifest_version" in parsed or "name" in parsed or "permissions" in parsed):
                return parsed.get("id") or parsed.get("extension_id"), "raw_manifest"
        except Exception:
            pass

    # Check if direct 32-character extension ID
    if EXTENSION_ID_REGEX.fullmatch(clean):
        return clean.lower(), "extension_id"

    # Check if Chrome Web Store URL
    m = CHROME_URL_PATTERN.search(clean)
    if m:
        return m.group(1).lower(), "chrome_web_store_url"

    # Fallback search for any 32-char [a-p] token in a URL
    if "chrome" in clean.lower() or "webstore" in clean.lower() or "google" in clean.lower():
        m_generic = re.search(r'([a-p]{32})', clean, re.IGNORECASE)
        if m_generic:
            return m_generic.group(1).lower(), "chrome_web_store_url"

    return None, "unknown"


def _extract_ds0_data(html: str) -> Dict[str, Any]:
    """
    Extract structured store data from Chrome Web Store AF_initDataCallback ({key: 'ds:0', ...}).
    """
    meta: Dict[str, Any] = {}
    
    # Locate AF_initDataCallback with ds:0
    match = re.search(
        r"AF_initDataCallback\(\s*\{[^}]*?key:\s*['\"]ds:0['\"].*?data:\s*(\[.+?\])\s*,\s*sideChannel:",
        html,
        re.DOTALL
    )
    if not match:
        match = re.search(
            r"AF_initDataCallback\(\s*\{[^}]*?key:\s*['\"]ds:0['\"].*?data:\s*(\[.+?\])\s*\}\s*\);",
            html,
            re.DOTALL
        )
    
    if match:
        try:
            data = json.loads(match.group(1))
            if isinstance(data, list) and len(data) > 0:
                item = data[0] if isinstance(data[0], list) else data
                
                # Title / Name
                if len(item) > 2 and isinstance(item[2], str) and item[2].strip():
                    meta["name"] = item[2].strip()
                
                # Rating float (e.g. 4.6569 -> 4.66)
                if len(item) > 3 and item[3] is not None:
                    try:
                        meta["rating"] = str(round(float(item[3]), 2))
                    except (ValueError, TypeError):
                        pass
                
                # Rating Count
                if len(item) > 4 and item[4] is not None:
                    try:
                        meta["rating_count"] = int(item[4])
                    except (ValueError, TypeError):
                        pass

                # Description
                if len(item) > 6 and isinstance(item[6], str) and item[6].strip():
                    meta["description"] = item[6].strip()

                # Users count (e.g. ['10,000,000+', 10000000])
                if len(item) > 10 and item[10]:
                    if isinstance(item[10], list) and len(item[10]) > 0 and item[10][0]:
                        meta["users"] = str(item[10][0])
                    elif isinstance(item[10], str):
                        meta["users"] = item[10]

                # Developer / Publisher (item[9], item[11], item[19], item[21], item[23])
                for idx in [9, 11, 19, 21, 23]:
                    if len(item) > idx and item[idx]:
                        val = item[idx]
                        if isinstance(val, str) and not val.startswith("http") and "@" not in val and len(val) < 80:
                            meta["developer"] = val.strip()
                            break
                        elif isinstance(val, list) and len(val) > 0 and isinstance(val[0], str) and not val[0].startswith("http"):
                            meta["developer"] = val[0].strip()
                            break

                # Store Version (item[20], item[22], item[18])
                for idx in [20, 22, 18]:
                    if len(item) > idx and item[idx]:
                        val = item[idx]
                        if isinstance(val, str) and re.match(r'^\d+(\.\d+)+$', val.strip()):
                            meta["version"] = val.strip()
                            break

                # Website & Privacy Policy (item[13], item[14], item[24], item[25])
                for idx in [13, 14, 24, 25]:
                    if len(item) > idx and item[idx]:
                        val = item[idx]
                        if isinstance(val, str) and val.startswith("http"):
                            if "privacy" in val.lower():
                                meta["privacy_policy"] = val.strip()
                            elif "website" not in meta:
                                meta["website"] = val.strip()

                # Icon URL (item[1])
                if len(item) > 1 and isinstance(item[1], str) and item[1].startswith("http"):
                    meta["icon_url"] = item[1]

        except Exception:
            pass

    return meta


def fetch_webstore_metadata(ext_id: str, timeout: int = 10) -> Dict[str, Any]:
    """
    Fetch public Chrome Web Store page and extract verified metadata.
    Extracts from AF_initDataCallback ds:0 block, OpenGraph tags, and JSON-LD.
    Does not fabricate data.
    """
    if not ext_id or not EXTENSION_ID_REGEX.fullmatch(ext_id):
        return {
            "extension_id": ext_id,
            "status": "unavailable",
            "reason": "Invalid extension ID format"
        }

    url = f"https://chromewebstore.google.com/detail/{ext_id}?hl=en"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            html = response.read().decode("utf-8", errors="ignore")

            name = None
            description = None
            store_url = f"https://chromewebstore.google.com/detail/{ext_id}"
            developer = None
            version = None
            rating = None
            rating_count = None
            users = None
            website = None
            privacy_policy = None
            icon_url = None

            # 1. Extract from AF_initDataCallback ds:0 structure
            ds0_meta = _extract_ds0_data(html)
            if ds0_meta:
                name = ds0_meta.get("name")
                description = ds0_meta.get("description")
                rating = ds0_meta.get("rating")
                rating_count = ds0_meta.get("rating_count")
                developer = ds0_meta.get("developer")
                version = ds0_meta.get("version")
                users = ds0_meta.get("users")
                website = ds0_meta.get("website")
                privacy_policy = ds0_meta.get("privacy_policy")
                icon_url = ds0_meta.get("icon_url")

            # 2. OpenGraph title fallback
            if not name:
                m_title = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                if m_title:
                    raw_title = m_title.group(1).strip()
                    name = re.sub(r'\s*-\s*Chrome\s+Web\s+Store$', '', raw_title, flags=re.IGNORECASE).strip()

            # 3. OpenGraph description fallback
            if not description:
                m_desc = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
                if m_desc:
                    description = m_desc.group(1).strip()

            # 4. OpenGraph URL
            m_url = re.search(r'<meta\s+property=["\']og:url["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if m_url:
                store_url = m_url.group(1).strip()

            # 5. JSON-LD schema.org metadata fallback
            m_jsonld = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
            for jtext in m_jsonld:
                try:
                    data = json.loads(jtext)
                    if isinstance(data, dict):
                        if not name and data.get("name"):
                            name = data["name"]
                        if not description and data.get("description"):
                            description = data["description"]
                        if not version and data.get("version"):
                            version = data["version"]
                        if not developer and data.get("author"):
                            auth = data["author"]
                            developer = auth.get("name") if isinstance(auth, dict) else str(auth)
                        if not rating and data.get("aggregateRating"):
                            rating = str(data["aggregateRating"].get("ratingValue", ""))
                except Exception:
                    pass

            return {
                "extension_id": ext_id,
                "name": name,
                "description": description,
                "version": version,
                "developer": developer,
                "store_url": store_url,
                "rating": rating,
                "rating_count": rating_count,
                "users": users,
                "website": website,
                "privacy_policy": privacy_policy,
                "icon_url": icon_url,
                "status": "success" if name else "partial"
            }
    except Exception as e:
        return {
            "extension_id": ext_id,
            "status": "unavailable",
            "reason": f"Web Store request failed: {str(e)}"
        }


def _resolve_manifest_localization(manifest: Dict[str, Any], z: zipfile.ZipFile) -> Dict[str, Any]:
    """
    Resolve localized placeholder strings (__MSG_key__) in manifest fields
    by reading _locales/en/messages.json or _locales/en_US/messages.json if present.
    """
    locale_candidates = [
        "_locales/en/messages.json",
        "_locales/en_US/messages.json",
        "_locales/en_GB/messages.json"
    ]
    
    loc_messages: Dict[str, Any] = {}
    for loc_path in locale_candidates:
        if loc_path in z.namelist():
            try:
                loc_content = z.read(loc_path).decode("utf-8", errors="ignore")
                loc_messages = json.loads(loc_content)
                if isinstance(loc_messages, dict):
                    break
            except Exception:
                pass

    if not loc_messages:
        # Check any _locales/*/messages.json
        for name in z.namelist():
            if name.startswith("_locales/") and name.endswith("/messages.json"):
                try:
                    loc_content = z.read(name).decode("utf-8", errors="ignore")
                    loc_messages = json.loads(loc_content)
                    if isinstance(loc_messages, dict):
                        break
                except Exception:
                    pass

    if loc_messages:
        for key in ["name", "description", "short_name"]:
            val = manifest.get(key)
            if isinstance(val, str) and val.startswith("__MSG_") and val.endswith("__"):
                msg_key = val[6:-2]
                if msg_key in loc_messages and isinstance(loc_messages[msg_key], dict) and "message" in loc_messages[msg_key]:
                    manifest[key] = loc_messages[msg_key]["message"]

    return manifest


def unpack_package_bytes(package_bytes: bytes) -> Dict[str, Any]:
    """
    Safely extract manifest.json from a CRX or ZIP package in memory.
    Protects against Zip Slip (path traversal) and excessive file sizes.
    Resolves localized manifest strings. Never executes untrusted code.
    """
    if len(package_bytes) > MAX_PACKAGE_SIZE:
        return {"status": "error", "reason": f"Package exceeds maximum allowed size of {MAX_PACKAGE_SIZE // (1024*1024)} MB"}

    if len(package_bytes) < 16:
        return {"status": "error", "reason": "Package data is too small to be a valid CRX or ZIP archive"}

    zip_bytes = package_bytes
    magic = package_bytes[:4]
    package_format = "ZIP"

    # Check for CRX format (Cr24 magic header)
    if magic == b'Cr24':
        try:
            version = struct.unpack('<I', package_bytes[4:8])[0]
            if version == 3:
                header_len = struct.unpack('<I', package_bytes[8:12])[0]
                zip_offset = 12 + header_len
                zip_bytes = package_bytes[zip_offset:]
                package_format = "CRX3"
            elif version == 2:
                pubkey_len = struct.unpack('<I', package_bytes[8:12])[0]
                sig_len = struct.unpack('<I', package_bytes[12:16])[0]
                zip_offset = 16 + pubkey_len + sig_len
                zip_bytes = package_bytes[zip_offset:]
                package_format = "CRX2"
            else:
                return {"status": "error", "reason": f"Unsupported CRX version: {version}"}
        except Exception as e:
            return {"status": "error", "reason": f"Failed to parse CRX header: {str(e)}"}

    # Parse zip payload safely
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            # Look for manifest.json with Zip Slip safety
            manifest_entry = None
            for name in z.namelist():
                # Normalize and check for path traversal
                norm_name = name.replace("\\", "/").strip()
                if norm_name.startswith("/") or ".." in norm_name:
                    continue  # Skip dangerous paths
                if norm_name.lower() == "manifest.json":
                    manifest_entry = name
                    break

            if not manifest_entry:
                return {"status": "error", "reason": "manifest.json not found inside extension archive"}

            # Check manifest size limit
            info = z.getinfo(manifest_entry)
            if info.file_size > MAX_MANIFEST_SIZE:
                return {"status": "error", "reason": "manifest.json exceeds maximum size limit"}

            manifest_content = z.read(manifest_entry).decode("utf-8", errors="ignore")
            manifest = json.loads(manifest_content)
            if not isinstance(manifest, dict):
                return {"status": "error", "reason": "manifest.json must contain a JSON object"}

            # Extract JavaScript files for static code analysis
            js_files: Dict[str, str] = {}
            for name in z.namelist():
                norm_name = name.replace("\\", "/").strip()
                if norm_name.startswith("/") or ".." in norm_name:
                    continue
                if norm_name.lower().endswith(".js") and not norm_name.lower().endswith(".min.js.map"):
                    try:
                        f_info = z.getinfo(name)
                        if f_info.file_size <= 2 * 1024 * 1024:  # 2MB limit per file
                            js_content = z.read(name).decode("utf-8", errors="ignore")
                            js_files[norm_name] = js_content
                            if len(js_files) >= 60:
                                break
                    except Exception:
                        pass

            # Resolve localized placeholders
            manifest = _resolve_manifest_localization(manifest, z)

            return {
                "status": "success",
                "package_status": "VERIFIED",
                "manifest_status": "VERIFIED",
                "package_format": package_format,
                "manifest": manifest,
                "js_files": js_files
            }
    except zipfile.BadZipFile:
        return {"status": "error", "package_status": "UNAVAILABLE", "manifest_status": "UNAVAILABLE", "reason": "Invalid or corrupted ZIP/CRX archive"}
    except json.JSONDecodeError as e:
        return {"status": "error", "package_status": "VERIFIED", "manifest_status": "UNAVAILABLE", "reason": f"Invalid JSON in manifest.json: {str(e)}"}
    except Exception as e:
        return {"status": "error", "package_status": "UNAVAILABLE", "manifest_status": "UNAVAILABLE", "reason": f"Package extraction error: {str(e)}"}


def fetch_crx_manifest(ext_id: str, timeout: int = 20) -> Dict[str, Any]:
    """
    Download CRX package from official Google update server and extract manifest.json.
    """
    if not ext_id or not EXTENSION_ID_REGEX.fullmatch(ext_id):
        return {"status": "unavailable", "reason": "Invalid extension ID format"}

    crx_url = (
        f"https://clients2.google.com/service/update2/crx?response=redirect"
        f"&prodversion=130.0.0.0&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc"
    )
    req = urllib.request.Request(
        crx_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 204:
                return {
                    "status": "unavailable",
                    "reason": "Google update server returned HTTP 204 (no CRX package available for this ID)"
                }
            crx_data = response.read()
            if not crx_data:
                return {
                    "status": "unavailable",
                    "reason": "Google update server returned empty payload"
                }
            return unpack_package_bytes(crx_data)
    except urllib.error.HTTPError as e:
        return {
            "status": "unavailable",
            "reason": f"Google update server returned HTTP {e.code}"
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "reason": f"CRX download failed: {str(e)}"
        }
