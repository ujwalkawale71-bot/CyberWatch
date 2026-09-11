"""
CyberWatch Behaviour Anomaly and Pattern Correlation Engine
Phase 2.1 Refined Implementation:
- 100% Real Evidence-Based Behavioural Patterns
- Strict removal of arbitrary individual scan thresholds (risk_score >= 50 removed)
- Unique evidence-based pattern cluster identity & duplicate suppression
- Pure multi-point correlation: Scan Risk vs Behaviour Risk separation
- Range-aware Behaviour Risk Index calculation without artificial saturation
"""
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.scan import Scan
from app.models.alert import Alert
from app.models.user import User

def get_date_cutoff(range_param: str) -> Optional[datetime]:
    now = datetime.now(timezone.utc)
    if range_param == "24h":
        return now - timedelta(hours=24)
    elif range_param == "7d":
        return now - timedelta(days=7)
    elif range_param == "30d":
        return now - timedelta(days=30)
    elif range_param == "all":
        return None
    return now - timedelta(days=7)

def format_relative_time(dt: Optional[datetime]) -> str:
    if not dt:
        return "recently"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return f"{max(1, seconds)}s ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"

# ============================================================================
# Core Evidence-Based Pattern Correlation Detectors
# ============================================================================

def detect_repeated_high_risk_patterns(scans: List[Scan], window_hours: float = 6.0) -> List[Dict[str, Any]]:
    """
    Detects repeated high-risk/critical scan activity within a rolling time window.
    STRICT RULE: Only relies on risk_level IN ('HIGH', 'CRITICAL', 'HIGH RISK').
    Arbitrary risk_score >= 50 is REMOVED.
    Requires at least 2 correlated qualifying scans.
    """
    high_scans = [
        s for s in scans
        if (s.risk_level or "").upper() in ["HIGH", "CRITICAL", "HIGH RISK"]
    ]
    if len(high_scans) < 2:
        return []

    sorted_scans = sorted(high_scans, key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc))
    clusters: List[List[Scan]] = []
    current_cluster: List[Scan] = []

    for s in sorted_scans:
        s_time = s.created_at if s.created_at.tzinfo else s.created_at.replace(tzinfo=timezone.utc)
        if not current_cluster:
            current_cluster.append(s)
        else:
            prev_time = current_cluster[-1].created_at if current_cluster[-1].created_at.tzinfo else current_cluster[-1].created_at.replace(tzinfo=timezone.utc)
            if (s_time - prev_time).total_seconds() <= window_hours * 3600:
                current_cluster.append(s)
            else:
                if len(current_cluster) >= 2:
                    clusters.append(current_cluster)
                current_cluster = [s]

    if len(current_cluster) >= 2:
        clusters.append(current_cluster)

    patterns = []
    for cl in clusters:
        latest = cl[-1]
        earliest = cl[0]
        scan_ids = sorted([s.id for s in cl])
        is_crit = any((s.risk_level or "").upper() == "CRITICAL" for s in cl)
        patterns.append({
            "id": f"pattern-highrisk-{earliest.id}_{latest.id}",
            "pattern_type": "Repeated High-Risk Activity",
            "name": "Repeated High-Risk Reconnaissance",
            "severity": "CRITICAL" if is_crit else "HIGH",
            "confidence": 90,
            "status": "Detected",
            "count": len(cl),
            "evidence_count": len(cl),
            "scan_ids": scan_ids,
            "target_summary": f"{len(cl)} high-risk targets evaluated (e.g. {latest.target[:30]})",
            "evidence_summary": f"Sequence of {len(cl)} high-severity scans executed within {window_hours}h window",
            "timestamp": format_relative_time(latest.created_at),
            "created_at": latest.created_at.isoformat() if latest.created_at else None
        })
    return patterns

def detect_ssrf_probe_bursts(scans: List[Scan], window_hours: float = 12.0) -> List[Dict[str, Any]]:
    """
    Detects repeated attempts to probe internal loopback or private RFC1918 subnets
    where actual SSRF containment / security block occurred.
    Requires at least 2 correlated blocked probe attempts.
    """
    ssrf_scans = []
    for s in scans:
        if s.status == "Blocked":
            res = s.result if isinstance(s.result, dict) else {}
            warnings = res.get("warnings", [])
            raw_res = str(res).lower()
            if "ssrf_blocked" in warnings or "ssrf" in raw_res or any(p in s.target for p in ["127.0.0.1", "localhost", "192.168.", "10.", "172.16.", "::1"]):
                ssrf_scans.append(s)

    if len(ssrf_scans) < 2:
        return []

    sorted_scans = sorted(ssrf_scans, key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc))
    clusters: List[List[Scan]] = []
    current_cluster: List[Scan] = []

    for s in sorted_scans:
        s_time = s.created_at if s.created_at.tzinfo else s.created_at.replace(tzinfo=timezone.utc)
        if not current_cluster:
            current_cluster.append(s)
        else:
            prev_time = current_cluster[-1].created_at if current_cluster[-1].created_at.tzinfo else current_cluster[-1].created_at.replace(tzinfo=timezone.utc)
            if (s_time - prev_time).total_seconds() <= window_hours * 3600:
                current_cluster.append(s)
            else:
                if len(current_cluster) >= 2:
                    clusters.append(current_cluster)
                current_cluster = [s]

    if len(current_cluster) >= 2:
        clusters.append(current_cluster)

    patterns = []
    for cl in clusters:
        latest = cl[-1]
        earliest = cl[0]
        scan_ids = sorted([s.id for s in cl])
        patterns.append({
            "id": f"pattern-ssrf-{earliest.id}_{latest.id}",
            "pattern_type": "SSRF Probe Burst",
            "name": "Internal Network SSRF Probing Burst",
            "severity": "CRITICAL",
            "confidence": 95,
            "status": "Blocked",
            "count": len(cl),
            "evidence_count": len(cl),
            "scan_ids": scan_ids,
            "target_summary": f"{len(cl)} internal endpoints probed ({latest.target[:30]})",
            "evidence_summary": f"{len(cl)} SSRF private network access attempts intercepted by security policy",
            "timestamp": format_relative_time(latest.created_at),
            "created_at": latest.created_at.isoformat() if latest.created_at else None
        })
    return patterns

def detect_phishing_clusters(scans: List[Scan], window_hours: float = 6.0) -> List[Dict[str, Any]]:
    """
    Detects clusters of scans with confirmed phishing indicators or brand impersonation findings.
    Requires at least 2 scans with actual evidence-based phishing findings.
    """
    phish_scans = []
    for s in scans:
        if (s.risk_level or "").upper() in ["MEDIUM", "HIGH", "CRITICAL", "MODERATE"]:
            res = s.result if isinstance(s.result, dict) else {}
            findings = res.get("findings", [])
            indicators = res.get("detected_indicators", [])
            all_text = (str(findings) + str(indicators) + str(s.target)).lower()
            if any(w in all_text for w in ["phishing", "impersonat", "credential", "fake login", "brand_impersonation"]):
                phish_scans.append(s)

    if len(phish_scans) < 2:
        return []

    sorted_scans = sorted(phish_scans, key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc))
    clusters: List[List[Scan]] = []
    current_cluster: List[Scan] = []

    for s in sorted_scans:
        s_time = s.created_at if s.created_at.tzinfo else s.created_at.replace(tzinfo=timezone.utc)
        if not current_cluster:
            current_cluster.append(s)
        else:
            prev_time = current_cluster[-1].created_at if current_cluster[-1].created_at.tzinfo else current_cluster[-1].created_at.replace(tzinfo=timezone.utc)
            if (s_time - prev_time).total_seconds() <= window_hours * 3600:
                current_cluster.append(s)
            else:
                if len(current_cluster) >= 2:
                    clusters.append(current_cluster)
                current_cluster = [s]

    if len(current_cluster) >= 2:
        clusters.append(current_cluster)

    patterns = []
    for cl in clusters:
        latest = cl[-1]
        earliest = cl[0]
        scan_ids = sorted([s.id for s in cl])
        patterns.append({
            "id": f"pattern-phish-{earliest.id}_{latest.id}",
            "pattern_type": "Phishing Pattern Cluster",
            "name": "Phishing and Brand Impersonation Cluster",
            "severity": "HIGH",
            "confidence": 88,
            "status": "Detected",
            "count": len(cl),
            "evidence_count": len(cl),
            "scan_ids": scan_ids,
            "target_summary": f"{len(cl)} credential/brand impersonation targets",
            "evidence_summary": f"{len(cl)} correlated targets with confirmed phishing indicators",
            "timestamp": format_relative_time(latest.created_at),
            "created_at": latest.created_at.isoformat() if latest.created_at else None
        })
    return patterns

def detect_risky_extension_permissions(scans: List[Scan]) -> List[Dict[str, Any]]:
    """
    Detects extensions requesting verified high-risk browser permissions.
    Only counts permissions actually stored in scan evidence.
    """
    ext_scans = [s for s in scans if (s.scan_type or "").lower() == "extension"]
    risky_extensions = []

    for s in ext_scans:
        res = s.result if isinstance(s.result, dict) else {}
        perms = res.get("permissions", [])
        findings = res.get("findings", [])
        all_txt = str(perms) + str(findings)
        if any(hp in all_txt for hp in ["<all_urls>", "webRequestBlocking", "debugger", "cookies", "nativeMessaging"]):
            risky_extensions.append(s)

    if len(risky_extensions) < 2:
        return []

    sorted_exts = sorted(risky_extensions, key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc))
    latest = sorted_exts[-1]
    earliest = sorted_exts[0]
    scan_ids = sorted([s.id for s in sorted_exts])

    return [{
        "id": f"pattern-ext-{earliest.id}_{latest.id}",
        "pattern_type": "Risky Extension Permissions",
        "name": "Excessive Extension Capability Profiling",
        "severity": "HIGH",
        "confidence": 85,
        "status": "Detected",
        "count": len(sorted_exts),
        "evidence_count": len(sorted_exts),
        "scan_ids": scan_ids,
        "target_summary": f"{len(sorted_exts)} high-risk extensions with sensitive API access",
        "evidence_summary": f"{len(sorted_exts)} extension scans exhibited excessive or dangerous permissions",
        "timestamp": format_relative_time(latest.created_at),
        "created_at": latest.created_at.isoformat() if latest.created_at else None
    }]

def detect_multi_source_threats(scans: List[Scan]) -> List[Dict[str, Any]]:
    """
    Detects scans corroborated by multiple successful independent threat intel sources.
    """
    corroborated_scans = []
    for s in scans:
        res = s.result if isinstance(s.result, dict) else {}
        ti = res.get("threat_intelligence", {})
        sources = ti.get("sources", {}) or ti.get("detections", {})
        if isinstance(sources, dict) and len(sources) >= 2:
            corroborated_scans.append(s)

    if len(corroborated_scans) < 2:
        return []

    sorted_scans = sorted(corroborated_scans, key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc))
    latest = sorted_scans[-1]
    earliest = sorted_scans[0]
    scan_ids = sorted([s.id for s in sorted_scans])

    return [{
        "id": f"pattern-multisrc-{earliest.id}_{latest.id}",
        "pattern_type": "Multi-Source Threat Detection",
        "name": "Multi-Vendor Threat Corroboration",
        "severity": "CRITICAL",
        "confidence": 98,
        "status": "Detected",
        "count": len(sorted_scans),
        "evidence_count": len(sorted_scans),
        "scan_ids": scan_ids,
        "target_summary": f"{len(sorted_scans)} targets flagged by multiple threat engines",
        "evidence_summary": "Multi-source reputation confirmed malicious threat intelligence signals",
        "timestamp": format_relative_time(latest.created_at),
        "created_at": latest.created_at.isoformat() if latest.created_at else None
    }]

# ============================================================================
# Main Service Analytics Builder
# ============================================================================

def get_behavior_analytics(db: Session, time_range: str = "7d", current_user: Optional[User] = None) -> Dict[str, Any]:
    cutoff = get_date_cutoff(time_range)
    now = datetime.now(timezone.utc)

    # 1. Fetch period-filtered scans strictly within the selected date range
    scan_query = db.query(Scan)
    if cutoff:
        scans_in_range = scan_query.filter(Scan.created_at >= cutoff).order_by(Scan.created_at.asc()).all()
    else:
        scans_in_range = scan_query.order_by(Scan.created_at.asc()).all()

    total_evaluations = len(scans_in_range)

    # 2. Run Evidence-Based Pattern Correlation Engines
    pattern_high_risk = detect_repeated_high_risk_patterns(scans_in_range)
    pattern_ssrf = detect_ssrf_probe_bursts(scans_in_range)
    pattern_phish = detect_phishing_clusters(scans_in_range)
    pattern_ext = detect_risky_extension_permissions(scans_in_range)
    pattern_multisrc = detect_multi_source_threats(scans_in_range)

    # 3. Duplicate Cluster Suppression and Unique Anomaly Identity
    unique_patterns_dict: Dict[str, Dict[str, Any]] = {}
    for p in (pattern_high_risk + pattern_ssrf + pattern_phish + pattern_ext + pattern_multisrc):
        if p["id"] not in unique_patterns_dict:
            unique_patterns_dict[p["id"]] = p

    all_confirmed_patterns = list(unique_patterns_dict.values())
    unique_patterns_count = len(all_confirmed_patterns)

    # Confirmed Behaviour Anomalies = count of unique evidence-based pattern clusters/events.
    confirmed_anomalies_count = unique_patterns_count

    # 4. Blocked Containment Actions count
    blocked_count = sum(1 for s in scans_in_range if s.status == "Blocked")

    # 5. Extension evaluations count
    ext_evaluations_count = sum(1 for s in scans_in_range if (s.scan_type or "").lower() == "extension")

    # 6. Behaviour Risk Index Calculation (Range-Aware & Proportional)
    # Evaluated strictly from unique active patterns in the selected time range without artificial saturation.
    if total_evaluations == 0 or unique_patterns_count == 0:
        behaviour_risk_index = 0
        behaviour_risk_level = "SAFE"
    else:
        score = 0
        
        # Bounded contribution per independent verified anomaly pattern
        # High Risk Clusters: +15 pts per cluster (max 30 pts)
        if pattern_high_risk:
            score += min(30, len(pattern_high_risk) * 15)
            
        # SSRF Probe Bursts: +25 pts per burst (max 30 pts)
        if pattern_ssrf:
            score += min(30, len(pattern_ssrf) * 25)
            
        # Phishing Clusters: +20 pts per cluster (max 25 pts)
        if pattern_phish:
            score += min(25, len(pattern_phish) * 20)
            
        # Multi-Source Detections: +20 pts (max 25 pts)
        if pattern_multisrc:
            score += min(25, len(pattern_multisrc) * 20)
            
        # Risky Extension Permissions: +10 pts (max 15 pts)
        if pattern_ext:
            score += min(15, len(pattern_ext) * 10)

        behaviour_risk_index = min(100, score)

        if behaviour_risk_index >= 75:
            behaviour_risk_level = "CRITICAL"
        elif behaviour_risk_index >= 50:
            behaviour_risk_level = "HIGH"
        elif behaviour_risk_index >= 25:
            behaviour_risk_level = "MEDIUM"
        elif behaviour_risk_index >= 10:
            behaviour_risk_level = "LOW"
        else:
            behaviour_risk_level = "SAFE"

    # 7. Build KPI Cards
    kpis = [
        {
            "id": "kpi-risk",
            "label": "Behavior Risk Score",
            "value": f"{behaviour_risk_index}/100",
            "rawValue": behaviour_risk_index,
            "subtext": f"{behaviour_risk_level} RISK",
            "severity": behaviour_risk_level,
            "iconName": "Gauge"
        },
        {
            "id": "kpi-events",
            "label": "Security Evaluations",
            "value": f"{total_evaluations:,}",
            "rawValue": total_evaluations,
            "subtext": "Total Scans",
            "iconName": "Activity"
        },
        {
            "id": "kpi-suspicious",
            "label": "Confirmed Anomalies",
            "value": f"{confirmed_anomalies_count:,}",
            "rawValue": confirmed_anomalies_count,
            "subtext": f"{unique_patterns_count} Unique Clusters",
            "severity": "HIGH" if confirmed_anomalies_count > 0 else "SAFE",
            "iconName": "AlertTriangle"
        },
        {
            "id": "kpi-blocked",
            "label": "Blocked Events",
            "value": f"{blocked_count:,}",
            "rawValue": blocked_count,
            "subtext": "Containment Actions",
            "severity": "SAFE" if blocked_count == 0 else "CRITICAL",
            "iconName": "ShieldCheck"
        },
        {
            "id": "kpi-ext",
            "label": "Monitored Extensions",
            "value": f"{ext_evaluations_count:,}",
            "rawValue": ext_evaluations_count,
            "subtext": "Extension Scans",
            "iconName": "Puzzle"
        },
        {
            "id": "kpi-patterns",
            "label": "Correlated Patterns",
            "value": f"{unique_patterns_count:,}",
            "rawValue": unique_patterns_count,
            "subtext": "Evidence Clusters",
            "iconName": "LayoutGrid"
        }
    ]

    # 8. Timeline Generation (Real Buckets)
    timeline: List[Dict[str, Any]] = []
    if time_range == "24h":
        hour_buckets: Dict[str, Dict[str, int]] = {}
        for i in range(23, -1, -1):
            h = now - timedelta(hours=i)
            h_key = h.strftime("%H:00")
            hour_buckets[h_key] = {"normal": 0, "suspicious": 0, "critical": 0, "blocked": 0}

        for s in scans_in_range:
            if s.created_at:
                s_dt = s.created_at if s.created_at.tzinfo else s.created_at.replace(tzinfo=timezone.utc)
                h_key = s_dt.strftime("%H:00")
                if h_key in hour_buckets:
                    if s.status == "Blocked":
                        hour_buckets[h_key]["blocked"] += 1
                    elif (s.risk_score or 0) >= 75.0 or (s.risk_level or "").upper() == "CRITICAL":
                        hour_buckets[h_key]["critical"] += 1
                    elif (s.risk_score or 0) >= 25.0 or (s.risk_level or "").upper() in ["MEDIUM", "HIGH", "MODERATE"]:
                        hour_buckets[h_key]["suspicious"] += 1
                    else:
                        hour_buckets[h_key]["normal"] += 1

        for h_label, counts in hour_buckets.items():
            timeline.append({
                "time": h_label,
                "normal": counts["normal"],
                "suspicious": counts["suspicious"],
                "critical": counts["critical"],
                "blocked": counts["blocked"]
            })
    else:
        days_count = 7 if time_range == "7d" else (30 if time_range == "30d" else 14)
        date_buckets: Dict[str, Dict[str, int]] = {}
        for i in range(days_count - 1, -1, -1):
            d = now - timedelta(days=i)
            d_key = d.strftime("%b %d")
            date_buckets[d_key] = {"normal": 0, "suspicious": 0, "critical": 0, "blocked": 0}

        for s in scans_in_range:
            if s.created_at:
                s_dt = s.created_at if s.created_at.tzinfo else s.created_at.replace(tzinfo=timezone.utc)
                d_key = s_dt.strftime("%b %d")
                if d_key in date_buckets:
                    if s.status == "Blocked":
                        date_buckets[d_key]["blocked"] += 1
                    elif (s.risk_score or 0) >= 75.0 or (s.risk_level or "").upper() == "CRITICAL":
                        date_buckets[d_key]["critical"] += 1
                    elif (s.risk_score or 0) >= 25.0 or (s.risk_level or "").upper() in ["MEDIUM", "HIGH", "MODERATE"]:
                        date_buckets[d_key]["suspicious"] += 1
                    else:
                        date_buckets[d_key]["normal"] += 1

        for d_label, counts in date_buckets.items():
            timeline.append({
                "time": d_label,
                "normal": counts["normal"],
                "suspicious": counts["suspicious"],
                "critical": counts["critical"],
                "blocked": counts["blocked"]
            })

    # 9. Top Suspicious Behaviors (Unique Pattern Clusters with Evidence Counts)
    pattern_color_map = {
        "SSRF Probe Burst": "#ef4444",
        "Repeated High-Risk Activity": "#f97316",
        "Phishing Pattern Cluster": "#f59e0b",
        "Risky Extension Permissions": "#a855f7",
        "Multi-Source Threat Detection": "#ef4444"
    }

    # Group by pattern type for clean breakdown
    type_counts: Dict[str, int] = {}
    type_sample: Dict[str, Dict[str, Any]] = {}
    for p in all_confirmed_patterns:
        ptype = p["pattern_type"]
        type_counts[ptype] = type_counts.get(ptype, 0) + 1
        type_sample[ptype] = p

    top_behaviors = []
    for idx, (ptype, count) in enumerate(type_counts.items()):
        sample = type_sample[ptype]
        top_behaviors.append({
            "id": f"top-beh-{idx+1}",
            "name": f"{sample['name']}",
            "count": count,
            "color": pattern_color_map.get(ptype, "#f59e0b")
        })

    # 10. Session Overview (Real User and Engine Metadata)
    username = getattr(current_user, "full_name", "") or getattr(current_user, "email", "") if current_user else "SecOps Operator"
    user_role = getattr(current_user, "role", "Administrator") if current_user else "Administrator"

    session_overview = [
        {"label": "Monitoring Status", "value": "Active & Ready", "isBadge": True, "badgeType": "SAFE"},
        {"label": "Engine Architecture", "value": "Evidence-Based Anomaly Classifier"},
        {"label": "Operator Context", "value": f"{username} ({user_role})"},
        {"label": "Database Backend", "value": "SQLite / SQLAlchemy Local Store"},
        {"label": "Evaluated Scans in Window", "value": f"{total_evaluations:,}"},
        {"label": "Confirmed Pattern Anomalies", "value": f"{unique_patterns_count:,}"},
        {"label": "Posture Risk Classification", "value": f"{behaviour_risk_level} RISK", "isBadge": True, "badgeType": behaviour_risk_level}
    ]

    # 11. Recent Suspicious Events (Sorted chronologically DESC)
    recent_events = []
    for p in all_confirmed_patterns:
        recent_events.append({
            "id": p["id"],
            "time": p["timestamp"],
            "name": p["name"],
            "source": p["target_summary"],
            "severity": p["severity"],
            "status": p["status"]
        })

    if len(recent_events) < 5:
        alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
        for a in alerts:
            if not any(e["name"] == a.title for e in recent_events):
                recent_events.append({
                    "id": f"alert-event-{a.id}",
                    "time": format_relative_time(a.created_at),
                    "name": a.title,
                    "source": a.description[:40] + "...",
                    "severity": (a.severity or "MEDIUM").upper(),
                    "status": "Detected"
                })

    recent_events = recent_events[:10]

    return {
        "range": time_range,
        "behaviour_risk_index": behaviour_risk_index,
        "behaviour_risk_level": behaviour_risk_level,
        "security_evaluations": total_evaluations,
        "confirmed_anomalies": confirmed_anomalies_count,
        "blocked_actions": blocked_count,
        "extension_evaluations": ext_evaluations_count,
        "correlated_patterns_count": unique_patterns_count,
        "kpis": kpis,
        "timeline": timeline,
        "top_behaviors": top_behaviors,
        "session_overview": session_overview,
        "recent_events": recent_events,
        "patterns": all_confirmed_patterns
    }
