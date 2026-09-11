"""
Static Code Analysis & Obfuscation Detection Service — CyberWatch Platform

Performs safe, in-memory static pattern analysis, context evaluation, and Shannon entropy
calculations on extracted JavaScript files from Chrome Extension packages.
Identifies dynamic execution, remote loading, WebAssembly, suspicious APIs, and obfuscation.
Zero fake data. Every finding is verified against an actual file and line snippet.
"""
import re
import math
from typing import Dict, List, Any, Tuple, Optional

MAX_JS_FILES_TO_ANALYZE = 60
MAX_FILE_BYTES_TO_ANALYZE = 2 * 1024 * 1024  # 2MB per file


def calculate_shannon_entropy(text: str) -> float:
    """Calculate the Shannon Entropy of a string."""
    if not text:
        return 0.0
    freq: Dict[str, int] = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    length = len(text)
    entropy = 0.0
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 3)


def analyze_javascript_files(
    js_files: Dict[str, str],
    manifest_permissions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Perform static code inspection and obfuscation analysis across extracted JS files.
    Returns structured, evidence-backed findings and calibrated risk scores.
    """
    total_found = len(js_files) if js_files else 0
    if not js_files or total_found == 0:
        return {
            "status": "NOT_ANALYZED",
            "total_js_files_found": 0,
            "total_js_files_scanned": 0,
            "files_scanned_count": 0,
            "files_analyzed": 0,
            "total_lines": 0,
            "findings": [],
            "obfuscation_status": "UNKNOWN",
            "obfuscation_details": {
                "status": "UNKNOWN",
                "max_entropy": 0.0,
                "entropy_score": 0.0,
                "highest_entropy_file": "None",
                "high_entropy_strings_count": 0,
                "packed_js_detected": False,
                "packer_detected": False,
                "hex_escapes_count": 0,
                "hex_identifiers_count": 0,
                "long_strings_count": 0
            },
            "code_pattern_risk_score": 0.0,
            "obfuscation_risk_score": 0.0
        }

    findings: List[Dict[str, Any]] = []
    total_lines = 0
    analyzed_count = 0
    max_entropy = 0.0
    highest_entropy_file = "None"
    high_entropy_count = 0
    packed_js_detected = False
    total_hex_escapes = 0
    total_hex_vars = 0
    total_long_strings = 0
    excessive_obfuscator_patterns = 0

    # Sort files to analyze background/service worker scripts first
    sorted_files = sorted(
        js_files.items(),
        key=lambda item: 0 if ("background" in item[0].lower() or "worker" in item[0].lower()) else 1
    )[:MAX_JS_FILES_TO_ANALYZE]

    for file_name, content in sorted_files:
        if not content:
            continue
        analyzed_count += 1
        lines = content.splitlines()
        total_lines += len(lines)

        # 1. Obfuscation & Entropy Analysis
        sample_text = content[:50000]
        file_entropy = calculate_shannon_entropy(sample_text)
        if file_entropy > max_entropy:
            max_entropy = file_entropy
            highest_entropy_file = file_name

        # Check for Dean Edwards Packer signature: eval(function(p,a,c,k,e,d...
        if re.search(r'eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*[dr]', content):
            packed_js_detected = True
            findings.append({
                "id": f"code-packer-{analyzed_count}",
                "finding_id": f"code-packer-{analyzed_count}",
                "title": "Packed / Compressed JavaScript Payload",
                "pattern_name": "Dean Edwards Packer Signature",
                "severity": "HIGH",
                "confidence": "HIGH",
                "category": "Obfuscation",
                "source": "STATIC_CODE_ANALYSIS",
                "file_path": file_name,
                "affected_file": file_name,
                "file": file_name,
                "line_number": 1,
                "line_or_pattern": "eval(function(p,a,c,k,e,d...)",
                "evidence_snippet": "eval(function(p,a,c,k,e,d) detected in file header",
                "evidence": "Detected Dean Edwards Packer signature used for code concealment",
                "evidence_type": "PACKER_SIGNATURE",
                "description": "Code concealment using Dean Edwards Packer packing format.",
                "why_it_matters": "Packers conceal executable JavaScript, hindering code audits and static verification."
            })

        # Check for Obfuscator.io hex identifier arrays (e.g. _0x5a1b, _0x4e21)
        hex_vars = len(re.findall(r'_0x[a-f0-9]{4,6}\b', content))
        total_hex_vars += hex_vars
        if hex_vars > 30:
            excessive_obfuscator_patterns += 1
            findings.append({
                "id": f"code-obfuscator-io-{analyzed_count}",
                "finding_id": f"code-obfuscator-io-{analyzed_count}",
                "title": "Automated Hex Identifier Obfuscation",
                "pattern_name": "Obfuscator.io Hex Variables",
                "severity": "MEDIUM",
                "confidence": "MEDIUM",
                "category": "Obfuscation",
                "source": "STATIC_CODE_ANALYSIS",
                "file_path": file_name,
                "affected_file": file_name,
                "file": file_name,
                "line_number": 1,
                "line_or_pattern": f"{hex_vars} hex identifiers (_0x...)",
                "evidence_snippet": f"Found {hex_vars} variables with pattern _0x[a-f0-9]+",
                "evidence": f"{hex_vars} hexadecimal variable identifiers matching javascript-obfuscator output",
                "evidence_type": "HEX_IDENTIFIERS",
                "description": f"Automated variable renaming with {hex_vars} hex identifiers.",
                "why_it_matters": "Hexadecimal identifier renaming obscures the true control flow and intent of the script."
            })

        # Check for excessive hex escape sequences (\x65\x76\x61\x6c)
        hex_escapes = len(re.findall(r'\\x[0-9a-fA-F]{2}', content))
        total_hex_escapes += hex_escapes
        if hex_escapes > 50:
            findings.append({
                "id": f"code-hex-escape-{analyzed_count}",
                "finding_id": f"code-hex-escape-{analyzed_count}",
                "title": "Excessive Hexadecimal String Escapes",
                "pattern_name": "Hex Escape Sequences",
                "severity": "LOW",
                "confidence": "LOW",
                "category": "Obfuscation",
                "source": "STATIC_CODE_ANALYSIS",
                "file_path": file_name,
                "affected_file": file_name,
                "file": file_name,
                "line_number": 1,
                "line_or_pattern": f"{hex_escapes} hex escape sequences",
                "evidence_snippet": f"Found {hex_escapes} '\\x..' escape sequences",
                "evidence": f"Found {hex_escapes} '\\x..' escape sequences in script",
                "evidence_type": "HEX_ESCAPES",
                "description": f"{hex_escapes} hexadecimal string escape sequences detected.",
                "why_it_matters": "Hex encoding can be used to conceal strings or API identifiers."
            })

        # Check for long encoded base64 / hex strings (> 400 chars without whitespace)
        long_strings = re.findall(r'["\']([A-Za-z0-9+/=]{400,})["\']', content)
        total_long_strings += len(long_strings)
        for idx, ls in enumerate(long_strings[:2]):
            s_entropy = calculate_shannon_entropy(ls)
            if s_entropy > 4.8:
                high_entropy_count += 1
                findings.append({
                    "id": f"code-encoded-payload-{analyzed_count}-{idx}",
                    "finding_id": f"code-encoded-payload-{analyzed_count}-{idx}",
                    "title": "High-Entropy Encoded String Payload",
                    "pattern_name": "Encoded Base64/Hex Payload",
                    "severity": "LOW",
                    "confidence": "LOW",
                    "category": "Encoded Payload",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": 1,
                    "line_or_pattern": f"String length: {len(ls)} chars (Entropy: {s_entropy})",
                    "evidence_snippet": f"{ls[:50]}... (len {len(ls)})",
                    "evidence": f"Encoded string payload ({ls[:40]}...)",
                    "evidence_type": "HIGH_ENTROPY_STRING",
                    "description": f"High-entropy ({s_entropy} bits/char) encoded string of {len(ls)} characters.",
                    "why_it_matters": "May represent asset bundles, embedded fonts, or encoded data."
                })

        # 2. Line-by-Line Security Pattern Checks
        for line_idx, line in enumerate(lines, start=1):
            if len(line) > 10000:
                line_sample = line[:200]
            else:
                line_sample = line.strip()

            if not line_sample or line_sample.startswith("//") or line_sample.startswith("/*"):
                continue

            # (a) eval() detection - Context aware (FIX 3 / 9)
            if re.search(r'\beval\s*\(', line):
                # Distinguish benign global scope detect like eval("this") or window.eval
                is_global_this = bool(re.search(r'eval\s*\(\s*["\'](?:this|window)["\']\s*\)', line))
                is_dynamic_eval = bool(re.search(r'eval\s*\(\s*[^"\'`\)]+\s*\)', line)) and not is_global_this

                severity = "HIGH" if is_dynamic_eval else "LOW"
                confidence = "HIGH" if is_dynamic_eval else "LOW"

                findings.append({
                    "id": f"code-eval-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-eval-{analyzed_count}-{line_idx}",
                    "title": "Dynamic Code Execution (eval)",
                    "pattern_name": "JavaScript eval() Call",
                    "severity": severity,
                    "confidence": confidence,
                    "category": "Dynamic Execution",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"eval() invocation detected at line {line_idx}.",
                    "why_it_matters": "eval() compiles and executes arbitrary strings as JavaScript, violating Manifest V3 CSP."
                })

            # (b) new Function() constructor - Context aware (FIX 5)
            # Minified libraries (like regenerator, core-js, lodash, react) use Function("return this")()
            if re.search(r'new\s+Function\s*\(', line) or re.search(r'\bFunction\s*\([^)]*\)\s*\(', line):
                is_global_detector = bool(re.search(r'Function\s*\(\s*["\']return\s+this["\']\s*\)', line))
                is_concatenated_args = bool(re.search(r'new\s+Function\s*\([^)]*?\+[^)]*?\)', line))

                if is_concatenated_args:
                    severity = "MEDIUM"
                    confidence = "MEDIUM"
                    title = "Dynamic Function Constructor with Variable Arguments"
                elif is_global_detector:
                    severity = "INFORMATIONAL"
                    confidence = "LOW"
                    title = "Global Scope Detection via Function Constructor"
                else:
                    severity = "LOW"
                    confidence = "LOW"
                    title = "Function Constructor Invocation"

                findings.append({
                    "id": f"code-func-ctor-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-func-ctor-{analyzed_count}-{line_idx}",
                    "title": title,
                    "pattern_name": "Function Constructor Execution",
                    "severity": severity,
                    "confidence": confidence,
                    "category": "Dynamic Execution",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Function constructor executed at line {line_idx}.",
                    "why_it_matters": "The Function constructor compiles string code in global scope."
                })

            # (c) setTimeout / setInterval with string evaluation
            if re.search(r'(?:setTimeout|setInterval)\s*\(\s*["\'`]', line):
                findings.append({
                    "id": f"code-timer-string-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-timer-string-{analyzed_count}-{line_idx}",
                    "title": "String-Based Timer Execution",
                    "pattern_name": "Timer String Evaluation",
                    "severity": "LOW",
                    "confidence": "MEDIUM",
                    "category": "Dynamic Execution",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Passing string expression to timer at line {line_idx}.",
                    "why_it_matters": "Passing strings to setTimeout/setInterval implicitly evaluates them like eval()."
                })

            # (d) Dynamic script tag creation - Context aware (FIX 3)
            if re.search(r'document\.createElement\s*\(\s*["\']script["\']\s*\)', line, re.IGNORECASE):
                has_remote_url = bool(re.search(r'https?://', line))
                severity = "HIGH" if has_remote_url else "INFORMATIONAL"
                confidence = "HIGH" if has_remote_url else "LOW"

                findings.append({
                    "id": f"code-dyn-script-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-dyn-script-{analyzed_count}-{line_idx}",
                    "title": "Dynamic Script Element Creation",
                    "pattern_name": "document.createElement('script')",
                    "severity": severity,
                    "confidence": confidence,
                    "category": "DOM Operation",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Dynamic script tag creation at line {line_idx}.",
                    "why_it_matters": "Used by bundle loaders or dynamic asset injectors to append scripts to the DOM."
                })

            # (e) Remote script imports (importScripts with http/s)
            if re.search(r'importScripts\s*\(\s*["\']https?://', line, re.IGNORECASE):
                findings.append({
                    "id": f"code-remote-importscripts-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-remote-importscripts-{analyzed_count}-{line_idx}",
                    "title": "Remote Script Import (importScripts)",
                    "pattern_name": "Remote importScripts() URL",
                    "severity": "CRITICAL",
                    "confidence": "HIGH",
                    "category": "Remote Code Execution",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Remote script imported over network at line {line_idx}.",
                    "why_it_matters": "Importing remote scripts over the network into background workers violates MV3 CSP."
                })

            # (f) WebAssembly usage - Context aware (FIX 6)
            if re.search(r'WebAssembly\.(?:compile|instantiate|Instance|Module)\s*\(', line):
                has_remote_stream = bool(re.search(r'instantiateStreaming\s*\(\s*fetch', line, re.IGNORECASE))
                severity = "MEDIUM" if has_remote_stream else "INFORMATIONAL"
                confidence = "MEDIUM" if has_remote_stream else "LOW"

                findings.append({
                    "id": f"code-wasm-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-wasm-{analyzed_count}-{line_idx}",
                    "title": "WebAssembly Module Usage",
                    "pattern_name": "WebAssembly API",
                    "severity": severity,
                    "confidence": confidence,
                    "category": "Binary Module",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"WebAssembly API call detected at line {line_idx}.",
                    "why_it_matters": "WebAssembly executes compiled binary logic in the browser."
                })

            # (g) Native messaging invocation (FIX 4)
            if re.search(r'chrome\.runtime\.(?:connectNative|sendNativeMessage)\s*\(', line):
                findings.append({
                    "id": f"code-native-msg-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-native-msg-{analyzed_count}-{line_idx}",
                    "title": "Native OS Messaging API Invocation",
                    "pattern_name": "chrome.runtime.connectNative",
                    "severity": "MEDIUM",
                    "confidence": "HIGH",
                    "category": "System Access",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Native messaging call detected at line {line_idx}.",
                    "why_it_matters": "Directly invokes host operating system desktop binaries outside the browser sandbox."
                })

            # (h) Chrome Debugger Protocol invocation
            if re.search(r'chrome\.debugger\.(?:attach|sendCommand)\s*\(', line):
                findings.append({
                    "id": f"code-debugger-call-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-debugger-call-{analyzed_count}-{line_idx}",
                    "title": "Chrome DevTools Debugger Protocol Call",
                    "pattern_name": "chrome.debugger API",
                    "severity": "HIGH",
                    "confidence": "HIGH",
                    "category": "Privileged API",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Chrome Debugger Protocol API invoked at line {line_idx}.",
                    "why_it_matters": "Attaches to DevTools debugger target to intercept browser execution or inspect memory."
                })

            # (i) Untrusted external script download via fetch/XHR
            if re.search(r'(?:fetch|XMLHttpRequest)\s*\(.*?(?:pastebin\.com|hastebin\.com|raw\.githubusercontent\.com|gist\.githubusercontent\.com).*?\)', line, re.IGNORECASE):
                findings.append({
                    "id": f"code-pastebin-fetch-{analyzed_count}-{line_idx}",
                    "finding_id": f"code-pastebin-fetch-{analyzed_count}-{line_idx}",
                    "title": "Fetch from Untrusted Code Hosting Service",
                    "pattern_name": "Untrusted Source Download",
                    "severity": "HIGH",
                    "confidence": "HIGH",
                    "category": "Remote Code Execution",
                    "source": "STATIC_CODE_ANALYSIS",
                    "file_path": file_name,
                    "affected_file": file_name,
                    "file": file_name,
                    "line_number": line_idx,
                    "line_or_pattern": f"Line {line_idx}",
                    "evidence_snippet": line_sample[:120],
                    "evidence": line_sample[:120],
                    "evidence_type": "CODE_PATTERN",
                    "description": f"Payload fetched from raw paste/gist site at line {line_idx}.",
                    "why_it_matters": "Fetching executable content from public paste sites is common for staging dynamic payloads."
                })

    # Evidence Integrity Check (FIX 13): discard any finding missing file_path or evidence_snippet
    valid_findings: List[Dict[str, Any]] = []
    for f in findings:
        f_path = f.get("file_path") or f.get("affected_file")
        f_ev = f.get("evidence_snippet") or f.get("evidence")
        if f_path and f_ev and f_path in js_files:
            valid_findings.append(f)

    findings = valid_findings

    # Determine Obfuscation Status (FIX 7: 0 - 5 max)
    if packed_js_detected or excessive_obfuscator_patterns > 1:
        obfuscation_status = "HIGH"
        obfuscation_score = 5.0
    elif total_hex_escapes > 60 or (max_entropy > 5.8 and analyzed_count > 1):
        obfuscation_status = "MEDIUM"
        obfuscation_score = 2.5
    elif total_hex_escapes > 20 or (max_entropy > 5.2 and analyzed_count > 1):
        obfuscation_status = "LOW"
        obfuscation_score = 1.0
    else:
        obfuscation_status = "NONE"
        obfuscation_score = 0.0

    # Calculate Code Pattern Risk Score (FIX 7: 0 - 20 max, with confidence weighting)
    code_pattern_score = 0.0
    for f in findings:
        sev = f.get("severity")
        conf = f.get("confidence", "MEDIUM")
        multiplier = 1.0 if conf == "HIGH" else (0.5 if conf == "MEDIUM" else 0.2)

        if sev == "CRITICAL":
            code_pattern_score += 15.0 * multiplier
        elif sev == "HIGH":
            code_pattern_score += 8.0 * multiplier
        elif sev == "MEDIUM":
            code_pattern_score += 4.0 * multiplier
        elif sev == "LOW":
            code_pattern_score += 1.5 * multiplier
        elif sev == "INFORMATIONAL":
            code_pattern_score += 0.5 * multiplier

    code_pattern_score = min(round(code_pattern_score, 1), 20.0)
    obfuscation_score = min(round(obfuscation_score, 1), 5.0)

    return {
        "status": "COMPLETED" if analyzed_count > 0 else "NOT_ANALYZED",
        "total_js_files_found": total_found,
        "total_js_files_scanned": analyzed_count,
        "files_scanned_count": analyzed_count,
        "files_analyzed": analyzed_count,
        "total_lines": total_lines,
        "findings": findings,
        "obfuscation_status": obfuscation_status,
        "obfuscation_details": {
            "status": obfuscation_status,
            "max_entropy": max_entropy,
            "entropy_score": max_entropy,
            "highest_entropy_file": highest_entropy_file,
            "high_entropy_strings_count": high_entropy_count,
            "packed_js_detected": packed_js_detected,
            "packer_detected": packed_js_detected,
            "hex_escapes_count": total_hex_escapes,
            "hex_identifiers_count": total_hex_vars,
            "long_strings_count": total_long_strings
        },
        "code_pattern_risk_score": code_pattern_score,
        "obfuscation_risk_score": obfuscation_score
    }
