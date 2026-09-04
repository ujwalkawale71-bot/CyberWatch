# CyberWatch Threat Detection Backend

This is the FastAPI backend service for the **CyberWatch Unified Web & Browser Threat Detection Platform**. It provides modular schemas, SQLAlchemy ORM models, JWT session authentication, and mock risk scoring APIs.

---

## Technical Stack
* **Python 3.13+**
* **FastAPI** (API routing & documentation)
* **SQLAlchemy** (ORM models manager)
* **PostgreSQL / SQLite** (Relational databases)
* **PyJWT & Bcrypt** (Security & password hashing)

---

## Directory Structure
```text
backend/
├── app/
│   ├── main.py                # Main API entrypoint
│   ├── config.py              # Configurations loader (BaseSettings)
│   ├── database.py            # Session generator & engine setup
│   ├── models/                # SQLAlchemy Models
│   │   ├── __init__.py
│   │   ├── user.py            # User credentials schema
│   │   ├── scan.py            # Threat telemetry records
│   │   ├── alert.py           # Triggered security alarms
│   │   └── report.py          # Security findings reports
│   ├── schemas/               # Pydantic input/output schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── scan.py
│   ├── routes/                # FastAPI Routers
│   │   ├── auth.py            # /api/auth register, login, me
│   │   ├── users.py           # /api/users listing
│   │   ├── scans.py           # /api/scans threat lookup logs
│   │   ├── alerts.py          # /api/alerts resolution triggers
│   │   └── reports.py         # /api/reports summary outputs
│   ├── services/              # Core business layers
│   │   ├── auth_service.py    # Credentials checking & registration
│   │   ├── scan_service.py    # Auto-alert & report generation
│   │   └── risk_service.py    # Dynamic risk calculations
│   └── utils/
│       └── security.py        # Bcrypt hash & PyJWT token utilities
├── requirements.txt           # Python dependencies manifest
├── .env.example               # Template environment configuration
└── README.md                  # Setup & execution guides
```

---

## Getting Started

### 1. Setup Virtual Environment
Create and activate a virtual environment in the `backend` folder:
```bash
python -m venv venv
venv\Scripts\activate       # On Windows
source venv/bin/activate    # On Linux/macOS
```

### 2. Install Dependencies
Install packages listed in the requirements file:
```bash
pip install -r requirements.txt
```

### 3. Environment Configurations
Copy `.env.example` to `.env` and adjust database variables:
```bash
cp .env.example .env
```
* **SQLite (Default Dev)**: Keep `DATABASE_URL=sqlite:///../database/cyberwatch.db` for zero-configuration SQLite.
* **PostgreSQL (Production)**: Update connection string:
  ```env
  DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
  ```

### 4. Running the Server
Launch the server using Uvicorn:
```bash
uvicorn app.main:app --reload
```
The server will bind on **`http://127.0.0.1:8000`**.

---

## Swagger API Documentation
FastAPI automatically serves interactive API documents:
* **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Authentication Flow

### Register a User
```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
  "full_name": "SecOps Admin",
  "email": "admin@cyberwatch.ai",
  "password": "secretpassword"
}'
```

### Login & Retrieve Token
```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "admin@cyberwatch.ai",
  "password": "secretpassword"
}'
```

### Fetch Authorized Profile
Include the token in the `Authorization` header:
```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/api/auth/me' \
  -H 'Authorization: Bearer <your_jwt_token_here>'
```
