# Apohara PROBANT — Compliance Suite Mapping

**Version**: 1.0  
**Date**: 2026-05-18  
**Prepared by**: Pablo M. Suarez (sole maintainer)  
**Status**: Engineering reference artifact. See important disclaimer below.

---

## Disclaimer: Mapping ≠ Certification

This document maps Apohara PROBANT runtime controls (DJL rules, SOAR playbooks,
audit log fields, incident taxonomy codes) to requirements in six regulatory
frameworks. **A compliance mapping is not a certification.** Obtaining formal
certification — SOC 2 Type II (6-12 months with an accredited CPA firm), ISO
27001 (multi-month audit with an accredited certification body), or demonstrating
EU AI Act conformity (notified body assessment for Annex III high-risk systems)
— requires a structured organizational engagement that this document does not
substitute.

The purpose of this document is to give engineers, auditors, and procurement
reviewers a clear, honest picture of which framework requirements PROBANT addresses
and which remain partial or absent, so remediation can be prioritized.

---

## Summary Table

| Framework | Version | Control Count | Example Controls | Source |
|---|---|---|---|---|
| EU AI Act | Regulation (EU) 2024/1689 | 5 | EU-AI-ACT:Art-9, EU-AI-ACT:Art-14, EU-AI-ACT:Art-73 | [artificialintelligenceact.eu](https://artificialintelligenceact.eu/) |
| NIST AI RMF | 1.0 (Jan 2023) + CSA Agentic Draft (Mar 2026) | 10 | NIST-AI-RMF:RMF-GOVERN-1.7, NIST-AI-RMF:AGENTIC-GOVERN-AUDIT-INTEGRITY, NIST-AI-RMF:AGENTIC-MANAGE-BLOCK-RESPONSE | [doi.org/10.6028/NIST.AI.100-1](https://doi.org/10.6028/NIST.AI.100-1) |
| NIST SP 800-53 | Rev 5 (Dec 2020, updated Jan 2022) | 12 | SP800-53:AC-3, SP800-53:AU-9, SP800-53:IR-4 | [doi.org/10.6028/NIST.SP.800-53r5](https://doi.org/10.6028/NIST.SP.800-53r5) |
| SOC 2 Type II | AICPA TSC 2017 (updated 2022) | 6 | SOC2:CC6.1, SOC2:CC7.3, SOC2:CC9.1 | [aicpa-cima.com](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2) |
| ISO/IEC 27001 | 2022 | 6 | ISO27001:A.5.7, ISO27001:A.8.16, ISO27001:A.16.1 | [iso.org/standard/82875](https://www.iso.org/standard/82875.html) |
| OWASP LLM Top 10 | 2025 (community label: 2026) | 10 | OWASP-LLM-2026:LLM01, OWASP-LLM-2026:LLM06, OWASP-LLM-2026:LLM08 | [owasp.org LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) |
| **Total** | | **49** | | |

---

## Framework Detail

### EU AI Act (5 controls)

The EU AI Act (Regulation (EU) 2024/1689) establishes harmonized rules for
artificial intelligence in the EU. Obligations for providers of high-risk AI
systems (Annex III) include Articles 9, 12, 14, 15, and 73.

| Control ID | Title | PROBANT Artifact |
|---|---|---|
| EU-AI-ACT:Art-9 | Risk Management System | `verdict.djl.matched_rules`, `governance.risk_register` |
| EU-AI-ACT:Art-14 | Human Oversight | `verdict.hitl.gate_triggered`, `verdict.hitl.escalation_ticket_id` |
| EU-AI-ACT:Art-15 | Accuracy, Robustness and Cybersecurity | `metrics.adversarial_test_results`, `metrics.jbb_defense_score` |
| EU-AI-ACT:Art-73 | Serious Incident Reporting | `soar.incident_ticket_id`, `soar.playbook_execution_log` |
| EU-AI-ACT:Art-12 | Record-Keeping and Logging | `verdict.audit.hmac_chain_valid` |

**Honest gap note**: EU AI Act applicability to PROBANT depends on whether it is
classified as a high-risk system under Annex III in a specific deployment context
and whether it is placed on the EU market. Consult qualified EU law counsel before
making Annex III claims to prospective customers.

---

### NIST AI RMF (10 controls)

NIST AI RMF 1.0 (NIST AI 100-1, January 2023) provides a voluntary framework
across four functions: GOVERN, MAP, MEASURE, and MANAGE. The 10 controls in this
mapping include 6 base-RMF subcategories and 4 CSA Agentic Profile extensions.

**Important**: The CSA Agentic AI Safety Framework (March 2026 DRAFT) is a
practitioner-produced document, not an official NIST publication. NIST has not
published a formal Agentic Profile as of this writing. See
[docs/research/prior-art-nist-agentic-profile.md](./prior-art-nist-agentic-profile.md)
and [docs/research/nist-mapping.md](./nist-mapping.md) for the full honesty
caveat and source citations.

| Control ID | Title | Function |
|---|---|---|
| NIST-AI-RMF:RMF-GOVERN-1.1 | AI Risk Management Policy | GOVERN |
| NIST-AI-RMF:RMF-GOVERN-1.7 | Human Oversight of AI Actions | GOVERN |
| NIST-AI-RMF:RMF-MEASURE-2.5 | AI System Robustness | MEASURE |
| NIST-AI-RMF:RMF-MANAGE-2.2 | Mechanisms for AI Incident Reporting | MANAGE |
| NIST-AI-RMF:RMF-MANAGE-4.1 | Post-Incident Lessons Learned | MANAGE |
| NIST-AI-RMF:AGENTIC-GOVERN-AUDIT-INTEGRITY | Tamper-Evident Audit Trail | GOVERN |
| NIST-AI-RMF:AGENTIC-MAP-PROMPT-SURFACE | Prompt Attack Surface Mapping | MAP |
| NIST-AI-RMF:AGENTIC-MANAGE-BLOCK-RESPONSE | Automated BLOCK Verdict Execution | MANAGE |
| NIST-AI-RMF:AGENTIC-MANAGE-SOAR-PLAYBOOK | SOAR Automated Incident Response Playbook | MANAGE |
| NIST-AI-RMF:AGENTIC-MEASURE-PROMPT-INJECTION | Prompt Injection Detection Rate | MEASURE |

---

### NIST SP 800-53 Rev 5 (12 controls)

NIST SP 800-53 Rev 5 provides a catalog of security and privacy controls for
information systems. The 12 controls mapped here focus on access enforcement,
audit, boundary protection, incident handling, and system monitoring — all directly
applicable to AI agent governance.

| Control ID | Title |
|---|---|
| SP800-53:AC-3 | Access Enforcement |
| SP800-53:AC-4 | Information Flow Enforcement |
| SP800-53:AC-6 | Least Privilege |
| SP800-53:AU-2 | Event Logging |
| SP800-53:AU-9 | Protection of Audit Information |
| SP800-53:AU-12 | Audit Record Generation |
| SP800-53:IR-4 | Incident Handling |
| SP800-53:IR-5 | Incident Monitoring |
| SP800-53:SC-7 | Boundary Protection |
| SP800-53:SC-28 | Protection of Information at Rest |
| SP800-53:SI-4 | System Monitoring |
| SP800-53:SI-7 | Software, Firmware, and Information Integrity |

---

### SOC 2 Type II (6 controls)

SOC 2 is defined by the AICPA Trust Services Criteria. The 6 controls mapped here
cover the Security and Risk Mitigation categories most relevant to AI agent
governance. Full SOC 2 coverage details are in
[docs/compliance/soc2-control-mapping-2026.md](../compliance/soc2-control-mapping-2026.md).

| Control ID | Title |
|---|---|
| SOC2:CC6.1 | Logical and Physical Access Controls |
| SOC2:CC6.6 | Logical Access — External Threats |
| SOC2:CC7.2 | System Monitoring |
| SOC2:CC7.3 | Security Incident Evaluation |
| SOC2:CC7.4 | Security Incident Response |
| SOC2:CC9.1 | Risk Mitigation — Vendor and Partner |

---

### ISO/IEC 27001:2022 (6 controls)

ISO/IEC 27001:2022 specifies requirements for an Information Security Management
System (ISMS). Full ISO 27001 Annex A coverage details are in
[docs/compliance/iso27001-control-mapping-2026.md](../compliance/iso27001-control-mapping-2026.md).

| Control ID | Title |
|---|---|
| ISO27001:A.5.7 | Threat Intelligence |
| ISO27001:A.5.30 | ICT Readiness for Business Continuity |
| ISO27001:A.8.16 | Monitoring Activities |
| ISO27001:A.8.34 | Protection of Information Systems During Audit Testing |
| ISO27001:A.12.1 | Operational Procedures and Responsibilities |
| ISO27001:A.16.1 | Management of Information Security Incidents and Improvements |

---

### OWASP LLM Top 10 (10 controls)

All 10 OWASP Top 10 for Large Language Model Applications categories are mapped.
The current edition (v2025, community-labeled "2026") covers LLM01-LLM10. Every
category is traced to at least one PROBANT audit log field; categories without a
direct DJL rule (LLM03 Training Data Poisoning, LLM04 Model Denial of Service)
are mapped to governance audit fields.

| Control ID | Title | Incident Codes |
|---|---|---|
| OWASP-LLM-2026:LLM01 | Prompt Injection | AGT-PI-001, AGT-PI-002, AGT-PI-003 |
| OWASP-LLM-2026:LLM02 | Insecure Output Handling | AGT-PI-003, AGT-MIS-001 |
| OWASP-LLM-2026:LLM03 | Training Data Poisoning | (governance controls) |
| OWASP-LLM-2026:LLM04 | Model Denial of Service | (latency SLA controls) |
| OWASP-LLM-2026:LLM05 | Supply Chain Vulnerabilities | AGT-EXF-002 |
| OWASP-LLM-2026:LLM06 | Sensitive Information Disclosure | AGT-PII-001, AGT-PII-002, AGT-EXF-001, AGT-EXF-003 |
| OWASP-LLM-2026:LLM07 | Insecure Plugin Design | AGT-MIS-003, AGT-MIS-002 |
| OWASP-LLM-2026:LLM08 | Excessive Agency | AGT-GOV-003, AGT-MIS-001, AGT-FIN-001 |
| OWASP-LLM-2026:LLM09 | Overreliance | AGT-GOV-003 |
| OWASP-LLM-2026:LLM10 | Model Theft | AGT-EXF-001, AGT-EXF-002 |

---

## Cross-References

| Document | Description |
|---|---|
| [docs/research/nist-mapping.md](./nist-mapping.md) | Full 35-control NIST AI RMF + CSA Agentic Profile mapping (US-75 output). Explains the honesty caveat on CSA draft status and distinguishes base-NIST from extension controls. |
| [docs/research/prior-art-nist-agentic-profile.md](./prior-art-nist-agentic-profile.md) | Prior art survey for NIST Agentic AI Profile (US-70 output). Establishes that no official NIST Agentic Profile exists as of May 2026 and cites the CSA Lab Space preprint. |
| [docs/compliance/soc2-control-mapping-2026.md](../compliance/soc2-control-mapping-2026.md) | Phase 2 SOC 2 Type II full Annex mapping. Produced by the Phase 2 audit-readiness track. Includes gap taxonomy (No / Partial / Gap) and remediation actions. |
| [docs/compliance/iso27001-control-mapping-2026.md](../compliance/iso27001-control-mapping-2026.md) | Phase 2 ISO/IEC 27001:2022 full Annex A mapping. Covers all four sections (A.5 Organizational, A.6 People, A.7 Physical, A.8 Technological). |

---

## Machine-Readable Format

The compliance mapping is fully machine-readable via the
`apohara_aegis.compliance` module (source:
`apohara-aegis/apohara_aegis/compliance.py`):

```python
from apohara_aegis.compliance import FRAMEWORKS, generate
from apohara_aegis.taxonomy import IncidentCode

# List all 49 controls
for fw_name, fw in FRAMEWORKS.items():
    for ctrl_id, ctrl in fw.controls.items():
        print(ctrl_id, ctrl.title)

# Get evidence report for a specific incident
report = generate(IncidentCode.AGT_PI_OVERRIDE)
print(report["summary"])  # {"total_controls_triggered": N, "frameworks_with_evidence": M}
```

The `generate()` function returns a structured dict suitable for inclusion in
SOAR playbook reports, audit evidence packages, and third-party risk assessments.
