import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal
from app.models.scan import Scan
from app.models.user import User

db = SessionLocal()
try:
    print("=== USERS ===")
    users = db.query(User).all()
    for u in users:
        print(f"ID: {u.id}, Name: {u.full_name}, Email: {u.email}")

    print("\n=== SCANS ===")
    scans = db.query(Scan).all()
    for s in scans:
        print(f"ID: {s.id}, Target: {s.target}, Type: {s.scan_type}, Score: {s.risk_score}, Level: {s.risk_level}")
        print(f"Result: {s.result}\n")
finally:
    db.close()
