import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def post_json(url, data):
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    
    js_data = json.dumps(data).encode("utf-8")
    try:
        with urllib.request.urlopen(req, data=js_data) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

print("=== Testing Login API ===")
status, res = post_json(f"{BASE_URL}/api/auth/login", {
    "email": "test@cyberwatch.ai",
    "password": "testpassword"
})
print(f"Status: {status}")
print(f"Response: {res}")
