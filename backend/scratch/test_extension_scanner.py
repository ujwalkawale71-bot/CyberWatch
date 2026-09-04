import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests

BASE_URL = "http://127.0.0.1:8000"

def get_token():
    res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "test@cyberwatch.ai", "password": "testpassword"})
    if not res.ok:
        print(f"Failed to login: {res.text}")
        sys.exit(1)
    return res.json()["data"]["access_token"]

def main():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Safe extension (no dangerous permissions)
    safe_payload = {
        "extension_id": "safe123",
        "name": "Safe Extension",
        "permissions": ["storage", "alarms"]
    }
    
    # 2. Medium risk extension
    medium_payload = {
        "extension_id": "med123",
        "name": "Medium Extension",
        "permissions": ["tabs", "history", "storage"],
        "host_permissions": ["http://example.com"]
    }

    # 3. High risk extension
    high_payload = {
        "extension_id": "high123",
        "name": "High Extension",
        "permissions": ["webRequest", "management"]
    }

    # 4. Critical risk extension
    critical_payload = {
        "extension_id": "crit123",
        "name": "Critical Extension",
        "permissions": ["webRequest", "webRequestBlocking", "debugger"],
        "host_permissions": ["<all_urls>"]
    }

    # 5. Empty permissions
    empty_payload = {
        "extension_id": "empty123",
        "name": "Empty Extension"
    }

    # 6. Invalid request (no id, name, or permissions)
    invalid_payload = {
        "description": "Just a description"
    }
    
    payloads = [
        ("Safe", safe_payload, 200),
        ("Medium", medium_payload, 200),
        ("High", high_payload, 200),
        ("Critical", critical_payload, 200),
        ("Empty", empty_payload, 200),
        ("Invalid", invalid_payload, 400)
    ]

    for name, payload, expected_status in payloads:
        print(f"\n--- Testing {name} payload ---")
        res = requests.post(f"{BASE_URL}/api/scans/extension", json=payload, headers=headers)
        if res.status_code != expected_status:
            print(f"FAILED {name}: Expected {expected_status}, got {res.status_code}")
            print(res.text)
        else:
            print(f"PASSED {name}: Got {res.status_code}")
            if res.ok:
                data = res.json().get("data", {})
                print(f"Score: {data.get('risk_score')}, Level: {data.get('risk_level')}")

if __name__ == "__main__":
    main()
