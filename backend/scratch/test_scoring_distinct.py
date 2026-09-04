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

    test_urls = [
        "https://github.com/",
        "https://www.google.com/",
        "http://example.com/",
        "https://bit.ly/",
        "https://paypal.com/"
    ]

    for t_url in test_urls:
        print(f"\n--- Scanning URL: {t_url} ---")
        status, scan_res = post_json(f"{BASE_URL}/api/scan/url", {
            "url": t_url
        }, token=token)
        print(f"Status: {status}")
        if status == 200:
            data = scan_res["data"]
            print(f"Threat Index: {data.get('threat_index')}")
            print(f"Risk Level: {data.get('risk_level')}")
            print(f"Security Verdict: {data.get('security_verdict')}")
            print(f"Indicators: {data.get('heuristic_indicators')}")
            print(f"Checklist: {data.get('audit_checklist')}")
        else:
            print(scan_res)

except Exception as e:
    print(f"Error: {e}")
