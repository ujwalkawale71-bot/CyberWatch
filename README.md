# CyberWatch

## Evidence-Based Cybersecurity Threat Detection, Risk Analysis and Behaviour Monitoring Platform

CyberWatch is a unified cybersecurity platform designed to detect, analyze, and monitor web, URL, file, and browser-extension related security risks from a single dashboard.

The project evolved from the earlier **Malicious Browser Detection** concept into a broader security monitoring platform with evidence-based risk analysis, threat intelligence, behaviour correlation, alerts, reports, and security analytics.

---

## Key Objectives

- Detect suspicious and malicious web resources.
- Analyze URLs and websites using multiple security indicators.
- Scan browser extensions and evaluate risky permissions/capabilities.
- Analyze uploaded files for security threats.
- Correlate security events to identify repeated or suspicious behaviour.
- Provide a unified risk score and severity classification.
- Present security findings through an interactive dashboard.
- Maintain scan history and security records for analysis and reporting.

---

## Main Features

### 1. URL Scanner
Analyzes a submitted URL and produces a security assessment based on available scan evidence and threat indicators.

### 2. Website Scanner
Performs website-level security checks and summarizes important findings, including security-related observations and risk factors.

### 3. File Scanner
Supports file security analysis and generates a structured report containing detected findings and risk information.

### 4. Browser Extension Scanner
Analyzes browser-extension information and permissions/capabilities to identify potentially dangerous extension behaviour.

### 5. Threat Intelligence
Provides threat-intelligence investigation and source-based analysis for security indicators.

### 6. Behaviour Monitor
Correlates security events over time instead of treating every scan as an isolated event.

The behaviour monitoring logic can identify patterns such as:

- Repeated high-risk activity
- SSRF/internal network probing indicators
- Phishing or credential-harvesting indicators
- Multi-source/multi-engine threat corroboration
- Dangerous browser-extension capabilities

The system uses correlation and evidence thresholds to reduce false positives.

### 7. Security Dashboard
Provides a unified view of:

- Total scans
- Detected threats
- Blocked threats
- Critical threats
- Threat activity
- Threat distribution
- Recent security activity
- Risky extensions
- Threat-intelligence information
- Behaviour monitoring status

---

## Risk Analysis

CyberWatch uses security evidence to classify findings into severity levels.

| Severity | Meaning |
|---|---|
| SAFE | No significant security evidence detected |
| LOW | Minor security indicators |
| MEDIUM | Suspicious or moderate-risk indicators |
| HIGH | Strong evidence of potentially harmful activity |
| CRITICAL | Highly significant or correlated threat evidence |

Behaviour monitoring also uses correlated evidence and temporal patterns instead of relying only on a single arbitrary score.

---

## System Architecture

```text
                    ┌─────────────────────┐
                    │     CyberWatch UI   │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │ Authentication      │
                    │ Scan APIs           │
                    │ Threat Intelligence │
                    │ Behaviour Analysis  │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
      │ Scan / Risk │  │ Threat Intel │  │ Behaviour    │
      │ Services    │  │ Services     │  │ Services     │
      └──────┬──────┘  └──────────────┘  └──────┬───────┘
             │                                   │
             └────────────────┬──────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │      Database       │
                    │ Scans / Alerts /    │
                    │ Users / Reports /   │
                    │ Extension & URL data│
                    └─────────────────────┘
```

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT-based authentication

### Database
- PostgreSQL configuration is supported through the backend environment configuration.
- Local development can use the project's configured database setup.

### Development Tools
- Visual Studio Code
- Git
- GitHub

---

## Project Structure

```text
CyberWatch/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Backend API

The FastAPI backend provides REST endpoints for authentication, users, scans, alerts, reports, and security-analysis operations.

When the backend is running, interactive API documentation is available through:

```text
http://localhost:8000/docs
```

---

## Local Setup

### Prerequisites

- Python 3.x
- Node.js and npm
- PostgreSQL (if using the PostgreSQL configuration)
- Git

### Backend

```bash
cd backend

python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local `.env` file from `.env.example` and configure the required database and authentication settings.

Start the API:

```bash
uvicorn app.main:app --reload
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will display the local frontend URL in the terminal.

---

## Security and Configuration

Do **not** commit real credentials, API keys, JWT secrets, database passwords, or private configuration files to GitHub.

Use:

```text
backend/.env
```

for local secrets and keep it excluded through `.gitignore`.

Use:

```text
backend/.env.example
```

to document the required configuration variables without exposing real secrets.

---

## Testing and Validation

The project includes backend test and diagnostic scripts for validating scan behaviour and security-analysis functionality.

Important validation areas include:

- Different URLs producing differentiated risk outcomes
- Clean/SAFE scan behaviour
- High-risk scan detection
- Correlated high-risk behaviour detection
- Threat-intelligence investigation
- Extension permission analysis
- API response and error handling
- Dashboard data consistency

---

## Current Development Status

### Implemented / Integrated

- Unified CyberWatch dashboard
- URL scanning
- Website scanning
- File scanning
- Browser extension analysis
- Threat intelligence investigation
- Dynamic dashboard statistics
- Recent security activity
- Behaviour monitoring and correlation
- Risk/severity analysis
- Authentication and user management
- REST API backend

### Ongoing / Further Enhancement

- Additional threat-intelligence sources
- Advanced analytics
- Policy automation
- Reporting enhancements
- Additional browser telemetry integrations
- Production deployment and monitoring

---

## Why CyberWatch?

Traditional security tools often provide separate utilities for URL checking, file scanning, browser-extension analysis, and threat intelligence.

CyberWatch aims to bring these capabilities into a single platform and connect individual security events with behavioural context. This makes the system more useful for continuous security monitoring rather than one-time scanning only.

---

## Future Scope

- Real-time browser telemetry integration
- Advanced anomaly detection and machine-learning models
- More threat-intelligence providers
- Automated policy enforcement
- Security report export and scheduling
- Role-based access control
- Cloud deployment
- Continuous monitoring and notification services

---

## Project Evolution

**Previous Project:** Malicious Browser Detection

**Upgraded Project:** CyberWatch

The upgrade expands the original browser-focused security concept into a broader cybersecurity platform covering web resources, files, browser extensions, threat intelligence, risk analysis, and behavioural monitoring.

---

## Screenshots

Screenshots of the implemented CyberWatch dashboard and security modules can be added here.

Recommended sections:

- Overall Dashboard
- URL Scanner
- Website Scanner
- File Scanner
- Browser Extension Scanner
- Threat Intelligence
- Behaviour Monitor
- Alerts
- Reports

---

## Disclaimer

CyberWatch is an academic/development project intended for cybersecurity analysis and defensive security research. Results should be validated with appropriate security tools and professional analysis before making production security decisions.

---

## Author

**Ujwal Kawale**

CyberWatch — Cybersecurity Threat Detection and Behaviour Monitoring Platform
