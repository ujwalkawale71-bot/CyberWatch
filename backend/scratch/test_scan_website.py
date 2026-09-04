import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def post_json(url, data, token=None):
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    js_data = json.dumps(data).encode("utf-8")
    try:
        with urllib.request.urlopen(req, data=js_data) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

try:
    print("Logging in to obtain JWT...")
    status, res = post_json(f"{BASE_URL}/api/auth/login", {
        "email": "test@cyberwatch.ai",
        "password": "testpassword"
    })
    
    if status != 200:
        print("Login failed, attempting registration first...")
        reg_status, reg_res = post_json(f"{BASE_URL}/api/auth/register", {
            "full_name": "SecOps Tester",
            "email": "test@cyberwatch.ai",
            "password": "testpassword"
        })
        print(f"Register status: {reg_status}, response: {reg_res}")
        status, res = post_json(f"{BASE_URL}/api/auth/login", {
            "email": "test@cyberwatch.ai",
            "password": "testpassword"
        })

    token = res["data"]["access_token"]
    print("JWT Token acquired successfully.")

    test_sites = [
        "https://www.wikipedia.org/",
        "https://example.com/",
        "https://www.google.com/"
    ]

    for site in test_sites:
        print(f"\nScanning: {site}")
        status, scan_res = post_json(f"{BASE_URL}/api/scans/website", {
            "url": site
        }, token=token)
        print(f"Scan status: {status}")
        if status == 200:
            data = scan_res["data"]
            print("Response Keys:", list(data.keys()))
            print("Metadata:", data.get("metadata"))
            print("Confidence:", data.get("confidence"))
            print("Technology:", data.get("technology"))
        else:
            print("Failed:", scan_res)

except Exception as e:
    print(f"Error: {e}")
