"""
Risk Calculation Service - CyberWatch Threat Detection Platform
Provides deterministic threat metrics calculation based on structural indicators.
Random scoring has been permanently removed.
"""
from typing import Tuple, Dict, Any

def calculate_risk(target: str, scan_type: str) -> Tuple[float, str, Dict[str, Any]]:
    """
    Deterministic fallback risk evaluation.
    Evaluates basic security properties without random scoring.
    """
    target_lower = (target or "").strip().lower()
    score = 0.0
    indicators = []

    # Scheme check
    if target_lower.startswith("http://"):
        score += 30.0
        indicators.append("Unencrypted connection (HTTP)")
    elif target_lower.startswith("https://"):
        score += 0.0
    
    # Suspicious keywords
    for kw in ["login", "signin", "verify", "account", "secure", "update", "bank", "wallet"]:
        if kw in target_lower:
            score += 12.0
            indicators.append(f"Suspicious keyword: {kw}")
            break

    # Cap score
    score = min(round(score, 1), 100.0)

    if score >= 80:
        level = "CRITICAL"
    elif score >= 60:
        level = "HIGH"
    elif score >= 40:
        level = "MEDIUM"
    elif score >= 20:
        level = "LOW"
    else:
        level = "SAFE"

    findings = {
        "summary": f"Deterministic security analysis completed for {target}",
        "target": target,
        "scan_type": scan_type,
        "threat_score": score,
        "risk_level": level,
        "detected_indicators": indicators
    }

    return score, level, findings
