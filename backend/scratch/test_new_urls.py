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
    token = res["data"]["access_token"]
    print("JWT Token acquired successfully.")

    test_urls = [
        "https://www.google.com/",
        "https://github.com/",
        "https://www.wikipedia.org/",
        "https://example.com/",
        "http://example.com/",
        "https://example.com/login",
        "https://example.com/search?q=test",
        "http://192.0.2.1/login",
        "https://example.com:8080/",
        "https://example.com/login/verify/account"
    ]

    for t_url in test_urls:
        print(f"\n--- Scanning URL: {t_url} ---")
        status, scan_res = post_json(f"{BASE_URL}/api/scan/url", {
            "url": t_url
        }, token=token)
        print(f"Status: {status}")
        if status == 200:
            data = scan_res["data"]
            print(f"Normalized: {data.get('normalized_url')}")
            print(f"Hostname: {data.get('hostname')} | Protocol: {data.get('protocol')} | Port: {data.get('port')}")
            print(f"Threat Score: {data.get('threat_score')}")
            print(f"Risk Level: {data.get('risk_level')}")
            print(f"Security Verdict: {data.get('security_verdict')}")
            print(f"Detected Indicators: {data.get('detected_indicators')}")
            print(f"Passed Checks: {data.get('passed_checks')} | Warnings: {data.get('warnings')}")
            print(f"Explanation: {data.get('explanation')}")
            print(f"Recommendations: {data.get('recommendations')}")
        else:
            print(scan_res)

except Exception as e:
    print(f"Error: {e}")
