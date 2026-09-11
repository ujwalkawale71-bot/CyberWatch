"""
File & Malware Scanner Service — CyberWatch Threat Detection Platform
Safe Static Analysis Engine & Malware Reputation Lookups

CRITICAL SECURITY PRINCIPLE:
- NEVER EXECUTE UPLOADED FILES.
- Pure static byte inspection, structure analysis, hash computation, and live threat intelligence lookups.
"""

import math
import hashlib
import re
import os
import io
import zipfile
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

# Configuration & Safety Limits
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB safe limit
MAX_ARCHIVE_ENTRIES = 500
MAX_ARCHIVE_RATIO = 100.0  # Max uncompressed to compressed ratio (Zip Bomb guard)

# ─────────────────────────────────────────────────────────────────────────────
# 1. HASH & ENTROPY COMPUTATION
# ─────────────────────────────────────────────────────────────────────────────

def compute_file_hashes(data: bytes) -> Dict[str, str]:
    """Calculate SHA-256, SHA-1, and MD5 from raw file bytes."""
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha1": hashlib.sha1(data).hexdigest(),
        "md5": hashlib.md5(data).hexdigest(),
    }

def calculate_shannon_entropy(data: bytes) -> float:
    """Calculate Shannon entropy (0.00 to 8.00). High entropy indicates compression/packing/encryption."""
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    byte_counts = [0] * 256
    for b in data:
        byte_counts[b] += 1
    for count in byte_counts:
        if count > 0:
            p_x = float(count) / length
            entropy -= p_x * math.log2(p_x)
    return round(entropy, 2)


# ─────────────────────────────────────────────────────────────────────────────
# 2. FILE TYPE & SIGNATURE DETECTION (MAGIC BYTES)
# ─────────────────────────────────────────────────────────────────────────────

def detect_file_signature(data: bytes, filename: str) -> Dict[str, Any]:
    """
    Detect true file format using magic byte signatures and inspect declared extension.
    """
    clean_name = os.path.basename(filename)
    ext = os.path.splitext(clean_name)[1].lower().lstrip(".")
    size = len(data)
    
    file_type = "Unknown Binary"
    mime_type = "application/octet-stream"
    category = "General"
    is_executable = False
    
    if data.startswith(b"MZ"):
        file_type = "Windows Portable Executable (PE)"
        mime_type = "application/x-dosexec"
        category = "Executable"
        is_executable = True
    elif data.startswith(b"\x7fELF"):
        file_type = "Linux Executable (ELF)"
        mime_type = "application/x-executable"
        category = "Executable"
        is_executable = True
    elif data.startswith(b"\xfe\xed\xfa\xce") or data.startswith(b"\xcf\xfa\xed\xfe") or data.startswith(b"\xca\xfe\xba\xbe"):
        file_type = "macOS Mach-O Binary"
        mime_type = "application/x-mach-binary"
        category = "Executable"
        is_executable = True
    elif data.startswith(b"%PDF-"):
        file_type = "PDF Document"
        mime_type = "application/pdf"
        category = "Document"
    elif data.startswith(b"PK\x03\x04") or data.startswith(b"PK\x05\x06"):
        # Check if Office OOXML or standard ZIP or APK/JAR
        is_docx = b"word/" in data[:4000] or (b"[Content_Types].xml" in data[:2000] and ext in ["docx", "docm"])
        is_xlsx = b"xl/" in data[:4000] or (b"[Content_Types].xml" in data[:2000] and ext in ["xlsx", "xlsm"])
        is_pptx = b"ppt/" in data[:4000] or (b"[Content_Types].xml" in data[:2000] and ext in ["pptx", "pptm"])
        is_apk = b"AndroidManifest.xml" in data[:4000] or ext == "apk"
        is_jar = b"META-INF/MANIFEST.MF" in data[:4000] or ext == "jar"
        
        if is_apk:
            file_type = "Android Package (APK)"
            mime_type = "application/vnd.android.package-archive"
            category = "Executable"
            is_executable = True
        elif is_jar:
            file_type = "Java Archive (JAR)"
            mime_type = "application/java-archive"
            category = "Executable"
            is_executable = True
        elif is_docx:
            file_type = "Microsoft Word Document (OOXML)"
            mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            category = "Document"
        elif is_xlsx:
            file_type = "Microsoft Excel Spreadsheet (OOXML)"
            mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            category = "Document"
        elif is_pptx:
            file_type = "Microsoft PowerPoint Presentation (OOXML)"
            mime_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            category = "Document"
        else:
            file_type = "ZIP Archive"
            mime_type = "application/zip"
            category = "Archive"
    elif data.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
        file_type = "Microsoft Compound Document (OLE / Legacy Office)"
        mime_type = "application/x-ole-storage"
        category = "Document"
    elif data.startswith(b"7z\xbc\xaf'\x1c"):
        file_type = "7-Zip Archive"
        mime_type = "application/x-7z-compressed"
        category = "Archive"
    elif data.startswith(b"Rar!\x1a\x07"):
        file_type = "RAR Archive"
        mime_type = "application/x-rar-compressed"
        category = "Archive"
    elif data.startswith(b"\x1f\x8b"):
        file_type = "GZIP Compressed Archive"
        mime_type = "application/gzip"
        category = "Archive"
    elif data.startswith(b"\x89PNG\r\n\x1a\n"):
        file_type = "PNG Image"
        mime_type = "image/png"
        category = "Image"
    elif data.startswith(b"\xff\xd8\xff"):
        file_type = "JPEG Image"
        mime_type = "image/jpeg"
        category = "Image"
    elif data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        file_type = "GIF Image"
        mime_type = "image/gif"
        category = "Image"
    elif data.startswith(b"<!DOCTYPE html") or data.startswith(b"<html") or data.startswith(b"<HTML"):
        file_type = "HTML Document"
        mime_type = "text/html"
        category = "Script/Web"
    elif data.startswith(b"<?xml") or data.startswith(b"<svg"):
        file_type = "XML / SVG Data"
        mime_type = "application/xml"
        category = "Data"
    else:
        # Check text / script signatures safely
        try:
            sample_text = data[:2048].decode("utf-8", errors="ignore")
            if ext in ["ps1", "psm1"]:
                file_type = "PowerShell Script"
                mime_type = "text/x-powershell"
                category = "Script"
                is_executable = True
            elif ext in ["bat", "cmd"]:
                file_type = "Windows Batch Script"
                mime_type = "text/x-batch"
                category = "Script"
                is_executable = True
            elif ext in ["sh", "bash", "zsh"]:
                file_type = "Shell Script"
                mime_type = "text/x-shellscript"
                category = "Script"
                is_executable = True
            elif ext in ["py", "pyw"]:
                file_type = "Python Script"
                mime_type = "text/x-python"
                category = "Script"
            elif ext in ["js", "mjs", "cjs"]:
                file_type = "JavaScript File"
                mime_type = "text/javascript"
                category = "Script"
            elif ext in ["vbs", "vbe"]:
                file_type = "VBScript File"
                mime_type = "text/vbscript"
                category = "Script"
                is_executable = True
            elif ext == "txt" or sample_text.isprintable() or "\n" in sample_text:
                file_type = "Plain Text Document"
                mime_type = "text/plain"
                category = "Text"
        except Exception:
            pass

    return {
        "file_name": clean_name,
        "file_type": file_type,
        "mime_type": mime_type,
        "category": category,
        "is_executable": is_executable,
        "declared_extension": f".{ext}" if ext else "None",
        "file_size": size
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. STATIC INSPECTION MODULES
# ─────────────────────────────────────────────────────────────────────────────

def inspect_file_identity(filename: str, signature: Dict[str, Any], data: bytes) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Detect filename anomalies, double extensions, and content-extension mismatches."""
    findings = []
    positive_signals = []
    
    clean_name = os.path.basename(filename.strip())
    ext = os.path.splitext(clean_name)[1].lower()
    
    # 1. Double extension check with precise document + executable heuristic
    parts = clean_name.split(".")
    if len(parts) > 2:
        inner_ext = f".{parts[-2].lower()}"
        outer_ext = f".{parts[-1].lower()}"
        doc_exts = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".jpg", ".png", ".zip", ".tar", ".gz"]
        exec_exts = [".exe", ".scr", ".pif", ".bat", ".cmd", ".vbs", ".js", ".ps1", ".hta", ".cpl", ".msi", ".jar"]
        
        if inner_ext in doc_exts and outer_ext in exec_exts:
            findings.append({
                "id": "suspicious_double_extension",
                "title": "Suspicious Double Extension",
                "category": "Filename Analysis",
                "severity": "HIGH",
                "evidence_type": "STRONG_SUSPICION",
                "score_contribution": 35,
                "confidence": "HIGH",
                "description": "The filename uses a document or media extension immediately before an executable or script extension.",
                "evidence": f"File '{clean_name}' contains inner '{inner_ext}' and executable outer '{outer_ext}'",
                "reason": f"The filename '{clean_name}' contains an embedded document extension '{inner_ext}' disguised before the actual executable extension '{outer_ext}'."
            })
        elif len(parts) >= 4 and outer_ext in exec_exts:
            findings.append({
                "id": "multiple_extensions",
                "title": "Multiple File Extensions Detected",
                "category": "Filename Analysis",
                "severity": "MEDIUM",
                "evidence_type": "MODERATE_HEURISTICS",
                "score_contribution": 15,
                "confidence": "MODERATE",
                "description": "The filename contains multiple dots and trailing extension sequences.",
                "evidence": clean_name,
                "reason": f"The filename '{clean_name}' contains multiple dots and extensions, which may obscure the true file type."
            })

    # 2. Check Extension vs Magic Byte Mismatch
    file_type = signature.get("file_type", "")
    if "Windows Portable Executable" in file_type and ext not in [".exe", ".dll", ".sys", ".scr", ".cpl", ".ocx"]:
        findings.append({
            "id": "pe_extension_mismatch",
            "title": "Executable Disguised As Non-Executable",
            "category": "File Type Validation",
            "severity": "HIGH",
            "evidence_type": "STRONG_SUSPICION",
            "score_contribution": 40,
            "confidence": "HIGH",
            "description": "The binary content is an executable binary, but declared filename uses a non-executable extension.",
            "evidence": f"Magic bytes: Windows PE MZ | Declared extension: {ext or 'None'}",
            "reason": f"The file content is a Windows PE Executable, but declared filename has non-executable extension '{ext or 'None'}'."
        })
    elif "PDF Document" in file_type and ext != ".pdf":
        findings.append({
            "id": "pdf_extension_mismatch",
            "title": "PDF Signature Mismatch",
            "category": "File Type Validation",
            "severity": "LOW",
            "evidence_type": "WEAK_INDICATOR",
            "score_contribution": 5,
            "confidence": "MODERATE",
            "description": "File header contains PDF magic bytes but extension differs.",
            "evidence": f"Detected: PDF | Extension: {ext}",
            "reason": f"File signature matches PDF document, but filename extension is '{ext}'."
        })
    elif not findings:
        positive_signals.append("Filename extension matches detected binary magic signature")

    return findings, positive_signals


def inspect_pe_structure(data: bytes) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Safe static parsing of Windows PE header structures without execution."""
    findings = []
    details: Dict[str, Any] = {
        "machine": "Unknown",
        "subsystem": "Unknown",
        "compile_timestamp": None,
        "sections": [],
        "suspicious_imports": []
    }
    
    if not data.startswith(b"MZ") or len(data) < 0x40:
        return findings, details
        
    try:
        e_lfanew = int.from_bytes(data[0x3C:0x40], byteorder="little")
        if e_lfanew + 24 > len(data) or data[e_lfanew:e_lfanew+4] != b"PE\x00\x00":
            return findings, details
            
        machine_id = int.from_bytes(data[e_lfanew+4:e_lfanew+6], byteorder="little")
        machine_map = {0x014c: "Intel 386 (x86)", 0x8664: "AMD64 (x64)", 0xaa64: "ARM64"}
        details["machine"] = machine_map.get(machine_id, f"Architecture 0x{machine_id:04x}")
        
        num_sections = int.from_bytes(data[e_lfanew+6:e_lfanew+8], byteorder="little")
        timestamp_val = int.from_bytes(data[e_lfanew+8:e_lfanew+12], byteorder="little")
        if timestamp_val > 0:
            try:
                details["compile_timestamp"] = datetime.fromtimestamp(timestamp_val, tz=timezone.utc).isoformat()
            except Exception:
                pass
                
        opt_hdr_size = int.from_bytes(data[e_lfanew+20:e_lfanew+22], byteorder="little")
        sec_table_offset = e_lfanew + 24 + opt_hdr_size
        
        sections = []
        packed_indicator = False
        
        for i in range(min(num_sections, 20)):
            sec_offset = sec_table_offset + (i * 40)
            if sec_offset + 40 > len(data):
                break
            sec_name_raw = data[sec_offset:sec_offset+8].rstrip(b"\x00")
            sec_name = sec_name_raw.decode("ascii", errors="ignore")
            v_size = int.from_bytes(data[sec_offset+8:sec_offset+12], byteorder="little")
            r_offset = int.from_bytes(data[sec_offset+20:sec_offset+24], byteorder="little")
            r_size = int.from_bytes(data[sec_offset+16:sec_offset+20], byteorder="little")
            
            sec_bytes = data[r_offset:r_offset+r_size] if r_offset + r_size <= len(data) else b""
            sec_entropy = calculate_shannon_entropy(sec_bytes) if sec_bytes else 0.0
            
            sections.append({
                "name": sec_name,
                "virtual_size": v_size,
                "raw_size": r_size,
                "entropy": sec_entropy
            })
            
            lower_name = sec_name.lower()
            if any(p in lower_name for p in ["upx", "aspack", "mpress", "themida", "vmp", "fsg"]):
                packed_indicator = True
                
        details["sections"] = sections
        
        if packed_indicator:
            findings.append({
                "id": "packed_pe_binary",
                "title": "Known Executable Packer Signature Detected",
                "category": "Executable Analysis",
                "severity": "MEDIUM",
                "evidence_type": "MODERATE_HEURISTICS",
                "score_contribution": 20,
                "confidence": "HIGH",
                "description": "PE section headers match known binary packers.",
                "evidence": "Section signature indicates UPX/Themida packing",
                "reason": "PE section names indicate binary compression/packing (e.g. UPX/Themida), commonly used to obfuscate executable code."
            })
            
        suspicious_apis = [
            (b"VirtualAllocEx", "Memory Allocation for Injection"),
            (b"WriteProcessMemory", "Process Memory Injection"),
            (b"CreateRemoteThread", "Remote Thread Injection"),
            (b"SetWindowsHookEx", "Keyboard/Mouse Hooking"),
            (b"IsDebuggerPresent", "Anti-Debugging Evasion"),
            (b"URLDownloadToFile", "Remote Payload Download"),
            (b"InternetOpenUrl", "Network Connection"),
            (b"WinExec", "Process Execution"),
            (b"ShellExecute", "Process Execution")
        ]
        
        found_apis = []
        for api_bytes, desc in suspicious_apis:
            if api_bytes in data:
                found_apis.append(api_bytes.decode("ascii"))
                
        details["suspicious_imports"] = found_apis
        if len(found_apis) >= 3:
            findings.append({
                "id": "suspicious_api_patterns",
                "title": "Multiple Process Injection / Network APIs Present",
                "category": "Executable Analysis",
                "severity": "MEDIUM",
                "evidence_type": "MODERATE_HEURISTICS",
                "score_contribution": 15,
                "confidence": "MODERATE",
                "description": "Executable imports multiple APIs commonly combined in process injection or remote downloads.",
                "evidence": f"APIs detected: {', '.join(found_apis[:4])}",
                "reason": f"Static inspection identified {len(found_apis)} high-risk API string references: {', '.join(found_apis[:4])}."
            })
            
    except Exception:
        pass
        
    return findings, details


def inspect_pdf_content(data: bytes) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Static inspection of PDF tags and active content elements."""
    findings = []
    details: Dict[str, Any] = {
        "has_javascript": False,
        "has_launch_action": False,
        "has_embedded_files": False,
        "has_open_action": False,
        "uri_links_count": 0
    }
    
    if not data.startswith(b"%PDF-"):
        return findings, details
        
    has_js = b"/JavaScript" in data or b"/JS" in data
    has_launch = b"/Launch" in data
    has_embedded = b"/EmbeddedFiles" in data or b"/EmbeddedFile" in data
    has_open_action = b"/OpenAction" in data or b"/AA" in data
    uri_matches = re.findall(rb"/URI\s*\((.*?)\)", data)
    
    details["has_javascript"] = bool(has_js)
    details["has_launch_action"] = bool(has_launch)
    details["has_embedded_files"] = bool(has_embedded)
    details["has_open_action"] = bool(has_open_action)
    details["uri_links_count"] = len(uri_matches)
    
    if has_launch:
        findings.append({
            "id": "pdf_launch_action",
            "title": "PDF /Launch Action Detected",
            "category": "Embedded Content",
            "severity": "HIGH",
            "evidence_type": "STRONG_SUSPICION",
            "score_contribution": 30,
            "confidence": "HIGH",
            "description": "PDF structure specifies an automatic launch command targeting system executables.",
            "evidence": "Tag /Launch located in PDF dictionary",
            "reason": "The PDF contains a /Launch action directive that attempts to execute external programs or commands when viewed."
        })
    elif has_js:
        findings.append({
            "id": "pdf_embedded_javascript",
            "title": "Embedded JavaScript Actions Detected",
            "category": "Embedded Content",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTICS",
            "score_contribution": 20,
            "confidence": "HIGH",
            "description": "PDF stream contains embedded JavaScript actions (/JS or /JavaScript).",
            "evidence": "Tag /JavaScript present in PDF structure",
            "reason": "The PDF contains embedded JavaScript (/JS, /JavaScript) that could execute automated script logic when opened."
        })
        
    if has_embedded:
        findings.append({
            "id": "pdf_embedded_files",
            "title": "Embedded Binary / Files Inside PDF",
            "category": "Embedded Content",
            "severity": "LOW",
            "evidence_type": "WEAK_INDICATOR",
            "score_contribution": 10,
            "confidence": "MODERATE",
            "description": "PDF stream packages embedded file objects inside /EmbeddedFiles dictionary.",
            "evidence": "/EmbeddedFiles tag detected",
            "reason": "The document contains embedded file attachments (/EmbeddedFiles) inside the PDF stream."
        })
        
    return findings, details


def inspect_office_document(filename: str, data: bytes) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Static inspection of Microsoft Office documents for VBA macros and external OLE objects."""
    findings = []
    details: Dict[str, Any] = {
        "has_vba_macros": False,
        "has_external_relationships": False,
        "embedded_executables": []
    }
    
    # 1. OOXML (ZIP-based .docx, .xlsm, .pptm, etc.)
    if data.startswith(b"PK\x03\x04"):
        try:
            with zipfile.ZipFile(io.BytesIO(data), "r") as z:
                namelist = z.namelist()
                has_vba = any("vbaProject.bin" in n for n in namelist)
                details["has_vba_macros"] = has_vba
                
                suspicious_embedded = [n for n in namelist if any(n.lower().endswith(e) for e in [".exe", ".bin", ".vbs", ".ps1", ".bat"])]
                details["embedded_executables"] = suspicious_embedded
                
                if has_vba:
                    findings.append({
                        "id": "office_vba_macros",
                        "title": "Macro-Enabled Content (vbaProject.bin)",
                        "category": "Embedded Content",
                        "severity": "MEDIUM",
                        "evidence_type": "MODERATE_HEURISTICS",
                        "score_contribution": 20,
                        "confidence": "HIGH",
                        "description": "Document packages compiled VBA macro storage stream (vbaProject.bin).",
                        "evidence": "vbaProject.bin member in OOXML package",
                        "reason": "The Office document contains executable VBA macro code (vbaProject.bin) which can automate actions upon opening."
                    })
                if suspicious_embedded and not has_vba:
                    findings.append({
                        "id": "office_embedded_payload",
                        "title": "Embedded Executable Content in Document",
                        "category": "Embedded Content",
                        "severity": "HIGH",
                        "evidence_type": "STRONG_SUSPICION",
                        "score_contribution": 30,
                        "confidence": "HIGH",
                        "description": "Document packages embedded binary payload files.",
                        "evidence": f"Embedded: {', '.join(suspicious_embedded[:3])}",
                        "reason": f"The document archive packages embedded executable objects: {', '.join(suspicious_embedded[:3])}."
                    })
        except Exception:
            pass
            
    # 2. Legacy OLE Documents (.doc, .xls)
    elif data.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
        if b"Attribut" in data and (b"Document_Open" in data or b"AutoOpen" in data or b"Workbook_Open" in data):
            details["has_vba_macros"] = True
            findings.append({
                "id": "ole_vba_auto_macros",
                "title": "Auto-Executing OLE VBA Macros Detected",
                "category": "Embedded Content",
                "severity": "MEDIUM",
                "evidence_type": "MODERATE_HEURISTICS",
                "score_contribution": 25,
                "confidence": "HIGH",
                "description": "Legacy OLE compound document contains automatic execution macros.",
                "evidence": "AutoOpen / Document_Open macro signatures detected",
                "reason": "Legacy OLE document contains automatic macro handlers (AutoOpen / Document_Open) configured to trigger on document load."
            })
            
    return findings, details


def inspect_archive_content(filename: str, data: bytes) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[str]]:
    """Safe static inspection of ZIP archives with strict safety limits without extraction."""
    findings = []
    limitations = []
    details: Dict[str, Any] = {
        "file_count": 0,
        "contains_executable": False,
        "contains_nested_archive": False,
        "has_path_traversal": False,
        "total_uncompressed_size": 0,
        "compression_ratio": 1.0,
        "files_sample": []
    }
    
    if not data.startswith(b"PK\x03\x04"):
        return findings, details, limitations
        
    try:
        with zipfile.ZipFile(io.BytesIO(data), "r") as z:
            infolist = z.infolist()
            total_entries = len(infolist)
            details["file_count"] = total_entries
            
            # Archive safety limit guards
            if total_entries > MAX_ARCHIVE_ENTRIES:
                limitations.append(f"Archive analysis safety limit reached ({total_entries} entries exceed limit of {MAX_ARCHIVE_ENTRIES}).")
                infolist = infolist[:MAX_ARCHIVE_ENTRIES]
                
            total_uncomp = sum(info.file_size for info in infolist)
            compressed_size = max(1, len(data))
            ratio = total_uncomp / compressed_size
            details["total_uncompressed_size"] = total_uncomp
            details["compression_ratio"] = round(ratio, 2)
            
            if ratio > MAX_ARCHIVE_RATIO and total_uncomp > 10 * 1024 * 1024:
                findings.append({
                    "id": "archive_bomb_anomaly",
                    "title": "High Compression Ratio / Archive Bomb Pattern",
                    "category": "Archive Analysis",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_SUSPICION",
                    "score_contribution": 35,
                    "confidence": "HIGH",
                    "description": "The archive demonstrates an abnormally high expansion ratio, indicating a potential zip-bomb.",
                    "evidence": f"Expansion ratio: {ratio:.1f}:1 ({total_uncomp // (1024*1024)} MB uncompressed)",
                    "reason": f"Archive ratio ({ratio:.1f}:1) exceeds safe inspection threshold."
                })
            
            exec_exts = [".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".ps1", ".msi", ".jar", ".pif"]
            exec_files = []
            has_traversal = False
            
            for info in infolist:
                name = info.filename
                if "../" in name or "..\\" in name:
                    has_traversal = True
                if any(name.lower().endswith(e) for e in exec_exts):
                    exec_files.append(name)
                    
            details["contains_executable"] = len(exec_files) > 0
            details["has_path_traversal"] = has_traversal
            details["files_sample"] = [i.filename for i in infolist[:12]]
            
            if has_traversal:
                findings.append({
                    "id": "archive_zip_slip",
                    "title": "Path Traversal (Zip Slip) Pattern Detected",
                    "category": "Archive Analysis",
                    "severity": "HIGH",
                    "evidence_type": "STRONG_SUSPICION",
                    "score_contribution": 40,
                    "confidence": "HIGH",
                    "description": "Archive entries contain relative directory traversal strings ('../') targeting parent directories.",
                    "evidence": "Zip Slip path traversal strings found in member names",
                    "reason": "Archive member names contain relative directory traversal sequences ('../'), an indicator of Zip Slip vulnerability exploitation."
                })
            elif exec_files:
                findings.append({
                    "id": "archive_executable_payload",
                    "title": "Executable Files Inside Compressed Archive",
                    "category": "Archive Analysis",
                    "severity": "MEDIUM",
                    "evidence_type": "MODERATE_HEURISTICS",
                    "score_contribution": 20,
                    "confidence": "HIGH",
                    "description": "The compressed archive packages executable binaries or script files.",
                    "evidence": f"Executable members: {', '.join(exec_files[:3])}",
                    "reason": f"The archive packages executable files ({', '.join(exec_files[:3])}), commonly distributed as download payloads."
                })
    except Exception as e:
        limitations.append(f"Archive stream parsing error: {str(e)}")
        
    return findings, details, limitations


def inspect_script_content(filename: str, data: bytes) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Safe static pattern matching for scripts (PowerShell, Batch, VBS, JS, Python, Shell)."""
    findings = []
    details: Dict[str, Any] = {
        "matched_patterns": [],
        "has_encoded_payload": False,
        "has_network_download": False,
        "has_hidden_execution": False
    }
    
    try:
        text = data.decode("utf-8", errors="ignore")
    except Exception:
        return findings, details
        
    # Check 1: Encoded PowerShell commands
    if re.search(r"-(e|enc|encodedcommand)\s+([A-Za-z0-9+/=]{16,})", text, re.IGNORECASE) or re.search(r"FromBase64String\s*\(", text, re.IGNORECASE):
        details["has_encoded_payload"] = True
        details["matched_patterns"].append("Base64 Encoded PowerShell")
        findings.append({
            "id": "encoded_powershell_execution",
            "title": "Base64 Encoded PowerShell Command Pattern",
            "category": "Script Analysis",
            "severity": "HIGH",
            "evidence_type": "STRONG_SUSPICION",
            "score_contribution": 35,
            "confidence": "HIGH",
            "description": "Script invokes base64-encoded command execution via -EncodedCommand parameter or FromBase64String.",
            "evidence": "Encoded command execution parameter identified",
            "reason": "Identified base64-encoded command string passed to PowerShell (-EncodedCommand / -enc) or FromBase64String, a standard obfuscation technique."
        })
        
    # Check 2: Obfuscated Script Download Cradles
    download_cradle_patterns = [
        (r"Invoke-WebRequest.*?http", "PowerShell Web Request Download"),
        (r"DownloadFile\s*\(.*?http", "WebClient DownloadFile"),
        (r"DownloadString\s*\(.*?http", "WebClient DownloadString Execution"),
        (r"certutil(\.exe)?\s+-urlcache", "Certutil URL Cache Download"),
        (r"bitsadmin(\.exe)?\s+/transfer", "Bitsadmin Background Transfer")
    ]
    for pattern, name in download_cradle_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            details["has_network_download"] = True
            details["matched_patterns"].append(name)
            findings.append({
                "id": "script_download_cradle",
                "title": f"Suspicious Remote Download Cradle ({name})",
                "category": "Script Analysis",
                "severity": "HIGH",
                "evidence_type": "STRONG_SUSPICION",
                "score_contribution": 30,
                "confidence": "HIGH",
                "description": f"Static inspection detected automated remote download utility pattern: '{name}'.",
                "evidence": f"Download cradle regex match: {name}",
                "reason": f"Static inspection detected automated remote download utility pattern: '{name}'."
            })
            break

    # Check 3: Hidden Window Execution
    if re.search(r"-WindowStyle\s+Hidden|-w\s+1|WScript\.Shell.*?,0,\s*True", text, re.IGNORECASE):
        details["has_hidden_execution"] = True
        details["matched_patterns"].append("Hidden Window Execution")
        findings.append({
            "id": "script_hidden_execution",
            "title": "Hidden Window / Stealth Execution Parameter",
            "category": "Script Analysis",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTICS",
            "score_contribution": 20,
            "confidence": "HIGH",
            "description": "Script configures hidden window execution to evade desktop user notice.",
            "evidence": "-WindowStyle Hidden parameter",
            "reason": "Script explicitly requests hidden window execution (-WindowStyle Hidden) to suppress user interface visibility."
        })

    # Check 4: Obfuscated JS / Eval strings
    if re.search(r"eval\s*\(\s*(unescape|decodeURIComponent|atob|String\.fromCharCode)", text, re.IGNORECASE):
        details["matched_patterns"].append("Obfuscated Dynamic Evaluation")
        findings.append({
            "id": "obfuscated_js_eval",
            "title": "Obfuscated Code Evaluation (eval / fromCharCode)",
            "category": "Script Analysis",
            "severity": "MEDIUM",
            "evidence_type": "MODERATE_HEURISTICS",
            "score_contribution": 25,
            "confidence": "HIGH",
            "description": "JavaScript dynamically constructs and evaluates de-obfuscated script logic.",
            "evidence": "eval() call with dynamic string decoder",
            "reason": "JavaScript code dynamically constructs and executes de-obfuscated script payloads via eval() and character decoding."
        })

    return findings, details


# ─────────────────────────────────────────────────────────────────────────────
# 4. THREAT INTELLIGENCE ENGINE (HASH-BASED)
# ─────────────────────────────────────────────────────────────────────────────

def query_malwarebazaar_hash(sha256: str) -> Dict[str, Any]:
    """
    Live query to abuse.ch MalwareBazaar official hash query API.
    Public API available without requiring API credentials.
    """
    source_name = "MalwareBazaar"
    timestamp = datetime.now(timezone.utc).isoformat()
    api_url = "https://mb-api.abuse.ch/api/v1/"
    
    try:
        data = urllib.parse.urlencode({"query": "get_info", "hash": sha256}).encode("utf-8")
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "CyberWatch-Threat-Scanner/2.0"
            }
        )
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            body = resp.read().decode("utf-8")
            res = json.loads(body)
            query_status = res.get("query_status", "")
            
            if query_status == "ok":
                entries = res.get("data", [])
                entry = entries[0] if entries else {}
                signature = entry.get("signature") or entry.get("file_type") or "Known Malware"
                tags = entry.get("tags") or []
                
                return {
                    "source": source_name,
                    "configured": True,
                    "request_executed": True,
                    "status": "DETECTED",
                    "detected": True,
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "reason": f"MalwareBazaar confirmed malicious hash: {signature} ({', '.join(tags[:3]) if tags else 'Identified threat'}).",
                    "checked_at": timestamp,
                    "details": {
                        "signature": signature,
                        "tags": tags,
                        "first_seen": entry.get("first_seen"),
                        "file_name": entry.get("file_name")
                    }
                }
            elif query_status == "hash_not_found":
                return {
                    "source": source_name,
                    "configured": True,
                    "request_executed": True,
                    "status": "NOT_DETECTED",
                    "detected": False,
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "reason": "Hash not listed in MalwareBazaar threat database.",
                    "checked_at": timestamp,
                    "details": None
                }
            else:
                return {
                    "source": source_name,
                    "configured": True,
                    "request_executed": True,
                    "status": "NOT_DETECTED",
                    "detected": False,
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "reason": f"Query response: {query_status}",
                    "checked_at": timestamp,
                    "details": None
                }
    except Exception as e:
        return {
            "source": source_name,
            "configured": True,
            "request_executed": False,
            "status": "FAILED",
            "detected": False,
            "data_origin": "LIVE",
            "http_status": None,
            "reason": f"MalwareBazaar lookup timed out or failed: {str(e)}",
            "checked_at": timestamp,
            "details": None
        }


def query_virustotal_file_hash(sha256: str) -> Dict[str, Any]:
    """Query VirusTotal API v3 by SHA-256 hash if VIRUSTOTAL_API_KEY is configured."""
    source_name = "VirusTotal"
    timestamp = datetime.now(timezone.utc).isoformat()
    api_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    
    if not api_key:
        return {
            "source": source_name,
            "configured": False,
            "request_executed": False,
            "status": "NOT_CONFIGURED",
            "detected": False,
            "data_origin": "NOT_CONFIGURED",
            "http_status": None,
            "reason": "API key not configured in environment (VIRUSTOTAL_API_KEY).",
            "checked_at": timestamp,
            "details": None
        }
        
    try:
        api_url = f"https://www.virustotal.com/api/v3/files/{sha256}"
        req = urllib.request.Request(
            api_url,
            headers={
                "x-apikey": api_key,
                "User-Agent": "CyberWatch-Threat-Scanner/2.0"
            }
        )
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            body = resp.read().decode("utf-8")
            res_json = json.loads(body)
            stats = res_json.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            
            if malicious > 0 or suspicious > 0:
                return {
                    "source": source_name,
                    "configured": True,
                    "request_executed": True,
                    "status": "DETECTED",
                    "detected": True,
                    "data_origin": "LIVE",
                    "http_status": resp.status,
                    "reason": f"Flagged by {malicious} security vendor(s) on VirusTotal ({suspicious} suspicious).",
                    "checked_at": timestamp,
                    "details": stats
                }
            return {
                "source": source_name,
                "configured": True,
                "request_executed": True,
                "status": "NOT_DETECTED",
                "detected": False,
                "data_origin": "LIVE",
                "http_status": resp.status,
                "reason": "No security vendors flagged this hash on VirusTotal.",
                "checked_at": timestamp,
                "details": stats
            }
    except urllib.error.HTTPError as he:
        if he.code == 404:
            return {
                "source": source_name,
                "configured": True,
                "request_executed": True,
                "status": "NOT_DETECTED",
                "detected": False,
                "data_origin": "LIVE",
                "http_status": 404,
                "reason": "File hash not previously seen or submitted in VirusTotal database.",
                "checked_at": timestamp,
                "details": None
            }
        return {
            "source": source_name,
            "configured": True,
            "request_executed": True,
            "status": "FAILED",
            "detected": False,
            "data_origin": "LIVE",
            "http_status": he.code,
            "reason": f"VirusTotal API HTTP {he.code}: {he.reason}",
            "checked_at": timestamp,
            "details": None
        }
    except Exception as e:
        return {
            "source": source_name,
            "configured": True,
            "request_executed": False,
            "status": "FAILED",
            "detected": False,
            "data_origin": "LIVE",
            "http_status": None,
            "reason": str(e),
            "checked_at": timestamp,
            "details": None
        }


# ─────────────────────────────────────────────────────────────────────────────
# 5. CORE COMPREHENSIVE SCANNER PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def scan_file_security(filename: str, data: bytes) -> Dict[str, Any]:
    """
    Comprehensive, Evidence-Based File & Malware Scanner.
    Executes pure static analysis and live threat intelligence lookups with full 10-module tracking.
    """
    clean_filename = os.path.basename(filename.strip())
    
    if not data or len(data) == 0:
        return {
            "file_name": clean_filename,
            "file_size": 0,
            "risk_score": None,
            "overall_risk": "ANALYSIS FAILED",
            "security_verdict": "ANALYSIS FAILED",
            "findings": [],
            "score_components": [],
            "positive_signals": [],
            "analysis_limitations": ["The uploaded file was empty and could not be analyzed."],
            "threat_intelligence": {},
            "threat_intelligence_sources": [],
            "module_status": {
                "file_identity": "FAILED",
                "hash_generation": "FAILED"
            }
        }
        
    if len(data) > MAX_FILE_SIZE_BYTES:
        return {
            "file_name": clean_filename,
            "file_size": len(data),
            "risk_score": None,
            "overall_risk": "ANALYSIS FAILED",
            "security_verdict": "ANALYSIS FAILED",
            "findings": [],
            "score_components": [],
            "positive_signals": [],
            "analysis_limitations": [f"File size ({len(data)} bytes) exceeds the maximum allowed scanning limit (50 MB)."],
            "threat_intelligence": {},
            "threat_intelligence_sources": []
        }

    # 10 Local Module Tracking
    module_status: Dict[str, str] = {
        "file_identity": "COMPLETED",
        "hash_generation": "COMPLETED",
        "file_signature_detection": "COMPLETED",
        "filename_analysis": "COMPLETED",
        "file_type_validation": "COMPLETED",
        "format_specific_analysis": "NOT_APPLICABLE",
        "embedded_content_inspection": "NOT_APPLICABLE",
        "archive_inspection": "NOT_APPLICABLE",
        "static_script_inspection": "NOT_APPLICABLE",
        "threat_intelligence_lookup": "COMPLETED"
    }

    # Step 1: Hashes & Entropy
    hashes = compute_file_hashes(data)
    entropy = calculate_shannon_entropy(data)
    
    # Step 2: File Identity & Signature
    signature = detect_file_signature(data, clean_filename)
    
    all_findings: List[Dict[str, Any]] = []
    positive_signals: List[str] = [
        "SHA-256 hash calculated successfully from uploaded bytes",
        "Static analysis completed without executing the file",
        f"File format identified: {signature['file_type']}"
    ]
    limitations: List[str] = []
    
    # 1. Identity & Filename Analysis
    ident_findings, ident_signals = inspect_file_identity(clean_filename, signature, data)
    all_findings.extend(ident_findings)
    positive_signals.extend(ident_signals)
    
    # 2. Entropy Check
    if entropy >= 7.85:
        all_findings.append({
            "id": "high_file_entropy",
            "title": f"High Shannon Entropy ({entropy} / 8.00)",
            "category": "Entropy Analysis",
            "severity": "LOW",
            "evidence_type": "WEAK_INDICATOR",
            "score_contribution": 8,
            "confidence": "MODERATE",
            "description": "File demonstrates high statistical randomness.",
            "evidence": f"Calculated Shannon entropy: {entropy} / 8.00",
            "reason": f"File demonstrates high statistical randomness ({entropy}/8.00), typical of packed, encrypted, or heavily compressed content."
        })
    
    # Technical details dictionary
    technical_details: Dict[str, Any] = {
        "hashes": hashes,
        "entropy": {
            "value": entropy,
            "scale": "0.00 - 8.00",
            "classification": "High (Packed/Encrypted)" if entropy >= 7.5 else "Moderate" if entropy >= 5.0 else "Low (Plain Data)"
        },
        "identity": signature,
        "pe": None,
        "pdf": None,
        "office": None,
        "archive": None,
        "script": None
    }
    
    # 3. Format-specific static modules
    file_type = signature["file_type"]
    
    # PE Executable
    if "Windows Portable Executable" in file_type:
        module_status["format_specific_analysis"] = "COMPLETED"
        pe_findings, pe_details = inspect_pe_structure(data)
        all_findings.extend(pe_findings)
        technical_details["pe"] = pe_details
        
    # PDF
    elif "PDF Document" in file_type:
        module_status["format_specific_analysis"] = "COMPLETED"
        module_status["embedded_content_inspection"] = "COMPLETED"
        pdf_findings, pdf_details = inspect_pdf_content(data)
        all_findings.extend(pdf_findings)
        technical_details["pdf"] = pdf_details
        
    # Office Document
    elif "Microsoft" in file_type:
        module_status["format_specific_analysis"] = "COMPLETED"
        module_status["embedded_content_inspection"] = "COMPLETED"
        off_findings, off_details = inspect_office_document(clean_filename, data)
        all_findings.extend(off_findings)
        technical_details["office"] = off_details
        
    # Archive
    elif "Archive" in file_type or "ZIP" in file_type:
        module_status["format_specific_analysis"] = "COMPLETED"
        module_status["archive_inspection"] = "COMPLETED"
        arc_findings, arc_details, arc_lims = inspect_archive_content(clean_filename, data)
        all_findings.extend(arc_findings)
        limitations.extend(arc_lims)
        technical_details["archive"] = arc_details
        
    # Script / Plain text
    if signature["category"] in ["Script", "Script/Web"] or any(clean_filename.lower().endswith(s) for s in [".ps1", ".bat", ".cmd", ".vbs", ".js", ".py", ".sh"]):
        module_status["static_script_inspection"] = "COMPLETED"
        scr_findings, scr_details = inspect_script_content(clean_filename, data)
        all_findings.extend(scr_findings)
        technical_details["script"] = scr_details
        
    # Step 4: Threat Intelligence Lookups
    ti_sources: List[Dict[str, Any]] = []
    
    # Query 1: MalwareBazaar (Active public feed)
    mb_res = query_malwarebazaar_hash(hashes["sha256"])
    ti_sources.append(mb_res)
    
    # Query 2: VirusTotal
    vt_res = query_virustotal_file_hash(hashes["sha256"])
    ti_sources.append(vt_res)
    
    # Process Threat Intel Detections
    verified_malware_detected = False
    for src in ti_sources:
        if src.get("status") == "DETECTED" and src.get("detected"):
            verified_malware_detected = True
            all_findings.append({
                "id": f"threat_intel_{src['source'].lower()}",
                "title": f"Verified Threat Intel Match ({src['source']})",
                "category": "Threat Intelligence",
                "severity": "CRITICAL",
                "evidence_type": "VERIFIED_THREAT",
                "score_contribution": 60,
                "confidence": "HIGH",
                "description": f"The SHA-256 hash was positively matched in {src['source']} active malware feed.",
                "evidence": src.get("reason", "Malicious hash identified"),
                "reason": src.get("reason", "Malicious hash identified in threat intelligence database.")
            })
            
    if not verified_malware_detected:
        positive_signals.append("No verified malware intelligence detection found in queried databases")
        
    # Check configured sources
    configured_ti_count = sum(1 for s in ti_sources if s.get("configured") or s.get("request_executed"))
    total_ti_count = len(ti_sources)
    if configured_ti_count < total_ti_count:
        unconfigured_names = [s["source"] for s in ti_sources if not s.get("configured")]
        if unconfigured_names:
            limitations.append(f"External threat intelligence provider not configured: {', '.join(unconfigured_names)}.")
            
    # Step 5: Score Calculation & Caps
    score_components = []
    heuristic_score = 0
    verified_threat_score = 0
    
    for f in all_findings:
        impact = f.get("score_contribution", 0)
        score_components.append({
            "id": f.get("id"),
            "title": f.get("title"),
            "category": f.get("category"),
            "severity": f.get("severity"),
            "evidence_type": f.get("evidence_type"),
            "score_contribution": impact,
            "confidence": f.get("confidence", "HIGH"),
            "description": f.get("description", f.get("reason")),
            "evidence": f.get("evidence", f.get("reason")),
            "reason": f.get("reason")
        })
        if f.get("evidence_type") == "VERIFIED_THREAT":
            verified_threat_score += impact
        else:
            heuristic_score += impact
            
    # Calibrate Final Score
    if verified_malware_detected:
        # Level 1 — Verified Threat produces CRITICAL (90-100)
        final_score = min(100, max(90, 75 + verified_threat_score + min(15, heuristic_score // 2)))
        overall_risk = "CRITICAL"
        security_verdict = "CRITICAL RISK"
    else:
        # Heuristic only is capped at 85
        final_score = min(85, heuristic_score)
        if final_score >= 50:
            overall_risk = "HIGH"
            security_verdict = "HIGH RISK"
        elif final_score >= 20:
            overall_risk = "MEDIUM"
            security_verdict = "MEDIUM RISK"
        else:
            overall_risk = "LOW"
            security_verdict = "LOW RISK"

    # Step 6: Dynamic Recommendations
    recommendations: List[str] = []
    if overall_risk == "CRITICAL":
        recommendations.append("Do not open or execute this file. Threat intelligence has confirmed malicious signatures associated with its hash.")
        recommendations.append("Isolate the file immediately and remove it from your storage or device.")
    elif overall_risk == "HIGH":
        recommendations.append("Avoid opening or executing this file until it has been independently verified. Multiple suspicious indicators were detected.")
        recommendations.append("Verify the original sender and examine whether the file disguise was intentional.")
    elif overall_risk == "MEDIUM":
        recommendations.append("Review the identified indicators before opening or executing this file.")
        recommendations.append("Verify the source and purpose of the file before proceeding.")
    else:
        recommendations.append("No major suspicious indicators were detected during static analysis.")
        recommendations.append("Continue using standard file safety precautions.")

    # Calculate Local Coverage based on applicable modules
    applicable_modules = [k for k, v in module_status.items() if v != "NOT_APPLICABLE"]
    completed_applicable = [k for k in applicable_modules if module_status[k] == "COMPLETED"]
    local_percent = int((len(completed_applicable) / max(1, len(applicable_modules))) * 100)
    
    return {
        "file_name": clean_filename,
        "file_size": len(data),
        "file_type": signature["file_type"],
        "mime_type": signature["mime_type"],
        "sha256": hashes["sha256"],
        "sha1": hashes["sha1"],
        "md5": hashes["md5"],
        "risk_score": final_score,
        "heuristic_score": heuristic_score,
        "verified_threat_score": verified_threat_score,
        "overall_risk": overall_risk,
        "security_verdict": security_verdict,
        "findings": all_findings,
        "score_components": score_components,
        "positive_signals": positive_signals[:5],
        "analysis_limitations": limitations,
        "recommendations": recommendations,
        "module_status": module_status,
        "analysis_coverage": {
            "local_analysis": {
                "status": "FULL" if local_percent == 100 else "PARTIAL",
                "percent": local_percent,
                "modules_completed": len(completed_applicable),
                "total_modules": len(applicable_modules)
            },
            "threat_intelligence": {
                "status": "FULL" if configured_ti_count >= total_ti_count else "PARTIAL" if configured_ti_count > 0 else "NOT CONFIGURED",
                "percent": int((configured_ti_count / total_ti_count) * 100),
                "configured_sources": configured_ti_count,
                "total_sources": total_ti_count
            }
        },
        "threat_intelligence": {
            "configured_sources_count": configured_ti_count,
            "total_sources": total_ti_count,
            "verified_malware_detected": verified_malware_detected,
            "sources_queried": ti_sources
        },
        "threat_intelligence_sources": ti_sources,
        "technical_details": technical_details
    }
