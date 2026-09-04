import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import urllib.request
import urllib.error
import json
from app.utils.security import create_access_token

token = create_access_token({'sub': 'test@cyberwatch.ai'})

def test_scan(target, scan_type):
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/scans',
        method='POST',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        data=json.dumps({'target': target, 'scan_type': scan_type}).encode('utf-8')
    )
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            print(f"[{scan_type}] Status: {res.status}, Score: {data['data']['risk_score']}, Level: {data['data']['risk_level']}")
    except urllib.error.HTTPError as e:
        data = json.loads(e.read().decode('utf-8'))
        print(f"[{scan_type}] HTTP {e.code}: {data.get('detail')}")

print("=== Testing /api/scans Dispatching ===")
test_scan('https://google.com', 'URL')
test_scan('https://example.com', 'Website')
test_scan('sample-extension-id', 'Extension')
test_scan('sample-invalid', 'UnknownType')
