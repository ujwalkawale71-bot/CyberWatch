from app.database import SessionLocal, Base, engine
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_user, authenticate_user
from app.utils.security import create_access_token, decode_access_token

# Create tables
Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    print("Testing Registration...")
    reg_req = RegisterRequest(
        full_name="SecOps Tester",
        email="test@cyberwatch.ai",
        password="testpassword"
    )
    user = register_user(db, reg_req)
    print(f"Registered User: {user.full_name} ({user.email}) - Role: {user.role}")

    print("\nTesting Authentication...")
    login_req = LoginRequest(
        email="test@cyberwatch.ai",
        password="testpassword"
    )
    authenticated = authenticate_user(db, login_req)
    if authenticated:
        print("Auth: SUCCESS")
        token = create_access_token({"sub": authenticated.email})
        print(f"Access Token: {token[:30]}...")
        decoded = decode_access_token(token)
        print(f"Decoded Sub: {decoded['sub'] if decoded else 'None'}")
    else:
        print("Auth: FAILED")
except Exception as e:
    print(f"Error during validation: {e}")
finally:
    db.close()
