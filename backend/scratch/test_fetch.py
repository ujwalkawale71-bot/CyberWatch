import urllib.request
import re
import json
import zipfile
import io
import struct

def parse_chrome_webstore_url(input_str: str):
    """
    Extract canonical 32-char extension ID from Chrome Web Store URL or ID string.
    Chrome extension IDs consist of 32 lowercase letters between 'a' and 'p'.
    """
    clean = input_str.strip()
    
    # Check if raw 32-character ID
    if re.fullmatch(r'[a-p]{32}', clean, re.IGNORECASE):
        return clean.lower(), "extension_id"
        
    # Check if Chrome Web Store URL
    # Matches /detail/[optional-slug]/[32-char-id] or /detail/[32-char-id]
    m = re.search(r'(?:chromewebstore\.google\.com|chrome\.google\.com/webstore)/detail/(?:[^/?#]+/)?([a-p]{32})', clean, re.IGNORECASE)
    if m:
        return m.group(1).lower(), "chrome_web_store_url"
        
    # Generic regex search for any 32-char [a-p] token in URL
    m_generic = re.search(r'([a-p]{32})', clean, re.IGNORECASE)
    if m_generic and ('chrome' in clean or 'webstore' in clean or 'google' in clean):
        return m_generic.group(1).lower(), "chrome_web_store_url"
        
    return None, "unknown"

def fetch_webstore_metadata(ext_id: str) -> dict:
    url = f'https://chromewebstore.google.com/detail/{ext_id}?hl=en'
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            name = None
            description = None
            store_url = f'https://chromewebstore.google.com/detail/{ext_id}'
            rating = None
            users = None
            developer = None
            version = None
            
            # Extract og:title
            m_title = re.search(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if m_title:
                raw_title = m_title.group(1).strip()
                # Remove " - Chrome Web Store" suffix
                name = re.sub(r'\s*-\s*Chrome\s+Web\s+Store$', '', raw_title, flags=re.IGNORECASE).strip()
                
            # Extract og:description
            m_desc = re.search(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if m_desc:
                description = m_desc.group(1).strip()
                
            # Extract og:url
            m_url = re.search(r'<meta\s+property=["\']og:url["\']\s+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if m_url:
                store_url = m_url.group(1).strip()
                
            # Try to extract schema.org JSON-LD if present
            m_jsonld = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
            for jtext in m_jsonld:
                try:
                    data = json.loads(jtext)
                    if isinstance(data, dict):
                        if not name and data.get('name'):
                            name = data['name']
                        if not description and data.get('description'):
                            description = data['description']
                        if not version and data.get('version'):
                            version = data['version']
                        if data.get('author'):
                            author = data['author']
                            developer = author.get('name') if isinstance(author, dict) else str(author)
                        if data.get('aggregateRating'):
                            rating = str(data['aggregateRating'].get('ratingValue', ''))
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
                "status": "success" if name else "partial"
            }
    except Exception as e:
        return {
            "extension_id": ext_id,
            "status": "unavailable",
            "error": str(e)
        }

def fetch_crx_manifest(ext_id: str) -> dict:
    """Fetch CRX package and extract manifest.json if accessible."""
    crx_url = f'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=130.0.0.0&acceptformat=crx2,crx3&x=id%3D{ext_id}%26uc'
    req = urllib.request.Request(crx_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            crx_data = response.read()
            if len(crx_data) < 16:
                return {"status": "unavailable", "reason": "CRX package not directly accessible"}
                
            magic = crx_data[:4]
            if magic != b'Cr24':
                # Might be raw zip
                try:
                    with zipfile.ZipFile(io.BytesIO(crx_data)) as z:
                        manifest = json.loads(z.read('manifest.json').decode('utf-8'))
                        return {"status": "success", "manifest": manifest}
                except Exception:
                    return {"status": "unavailable", "reason": f"Unknown CRX magic: {magic}"}
                    
            version = struct.unpack('<I', crx_data[4:8])[0]
            if version == 3:
                header_len = struct.unpack('<I', crx_data[8:12])[0]
                zip_bytes = crx_data[12 + header_len:]
            elif version == 2:
                pubkey_len = struct.unpack('<I', crx_data[8:12])[0]
                sig_len = struct.unpack('<I', crx_data[12:16])[0]
                zip_bytes = crx_data[16 + pubkey_len + sig_len:]
            else:
                return {"status": "unavailable", "reason": f"Unsupported CRX version: {version}"}
                
            with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
                manifest = json.loads(z.read('manifest.json').decode('utf-8'))
                return {"status": "success", "manifest": manifest}
    except Exception as e:
        return {"status": "unavailable", "reason": str(e)}


test_inputs = [
    "https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh",
    "https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?utm_source=ext_sidebar",
    "kbfnbcaeplbcioakkpcpgfkobkghlhen", # Grammarly
    "https://chromewebstore.google.com/detail/eimadpbcbfnmbkopoojfekhnkhdbieeh"
]

for inp in test_inputs:
    ext_id, in_type = parse_chrome_webstore_url(inp)
    print(f"\n==========================================")
    print(f"INPUT: {inp}")
    print(f"Detected Type: {in_type} | Extracted ID: {ext_id}")
    
    meta = fetch_webstore_metadata(ext_id)
    print(f"METADATA STATUS: {meta.get('status')}")
    print(f"Resolved Name: {meta.get('name')}")
    print(f"Resolved Description: {meta.get('description', '')[:100]}...")
    print(f"Store URL: {meta.get('store_url')}")
    
    crx_res = fetch_crx_manifest(ext_id)
    print(f"CRX MANIFEST STATUS: {crx_res.get('status')}")
    if crx_res.get('status') == 'success':
        m = crx_res['manifest']
        print(f"Manifest Name: {m.get('name')}, Version: {m.get('version')}, Perms: {m.get('permissions')}, HostPerms: {m.get('host_permissions')}")
