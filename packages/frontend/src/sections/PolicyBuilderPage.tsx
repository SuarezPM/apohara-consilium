// SPDX-License-Identifier: Apache-2.0
// US-87 — Policy Builder Page (Apohara PROBANT Fusion Sprint 2026-05-18)
// Fetches templates from GET /v1/soar/templates.
// Falls back to static data from apohara_aegis/templates.py when endpoint
// returns non-200 or is unreachable.
// DJL rule catalog mirrors apohara_aegis/djl.py ALL_RULES (62 rules).
// YAML export is hand-rendered — js-yaml is not in frontend/package.json.
import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";

// ---------------------------------------------------------------------------
// DJL rule catalog — mirrors apohara_aegis/djl.py ALL_RULES (62 rules)
// Source of truth: apohara_aegis/djl.py. Update here if djl.py changes.
// DJL-FIN-*, DJL-POL-006, DJL-POL-007 referenced in templates but not yet
// in djl.py engine — shown as "pending" in the rule table.
// ---------------------------------------------------------------------------

interface DjlRuleMeta {
  id: string;
  category: string;
  severity: number;
  description: string;
  pending?: boolean; // true = referenced in template, not yet in engine
}

const ALL_DJL_RULES: DjlRuleMeta[] = [
  // Prompt Injection (20 rules)
  { id: "DJL-PI-001", category: "prompt_injection", severity: 9, description: "Classic 'ignore previous instructions' override." },
  { id: "DJL-PI-002", category: "prompt_injection", severity: 9, description: "'Disregard system prompt' override." },
  { id: "DJL-PI-003", category: "prompt_injection", severity: 9, description: "Role re-assignment to known jailbreak persona (DAN, etc)." },
  { id: "DJL-PI-004", category: "prompt_injection", severity: 8, description: "Request to enter a privileged 'mode' that doesn't exist." },
  { id: "DJL-PI-005", category: "prompt_injection", severity: 8, description: "Explicit DAN ('Do Anything Now') invocation." },
  { id: "DJL-PI-006", category: "prompt_injection", severity: 8, description: "Direct 'jailbreak' lexical token." },
  { id: "DJL-PI-007", category: "prompt_injection", severity: 7, description: "Roleplay manipulation to remove safety persona." },
  { id: "DJL-PI-008", category: "prompt_injection", severity: 8, description: "'Act as if you have no restrictions' framing." },
  { id: "DJL-PI-009", category: "prompt_injection", severity: 7, description: "Suspiciously long base64 blob (possible instruction smuggle)." },
  { id: "DJL-PI-010", category: "prompt_injection", severity: 6, description: "Cyrillic/Greek homoglyph cluster (Unicode confusable attack)." },
  { id: "DJL-PI-011", category: "prompt_injection", severity: 9, description: "Bidirectional control character (Trojan-Source)." },
  { id: "DJL-PI-012", category: "prompt_injection", severity: 7, description: "Context-window displacement: redefining the rules." },
  { id: "DJL-PI-013", category: "prompt_injection", severity: 9, description: "System-prompt exfiltration attempt." },
  { id: "DJL-PI-014", category: "prompt_injection", severity: 7, description: "False 'end of system prompt' sentinel." },
  { id: "DJL-PI-015", category: "prompt_injection", severity: 7, description: "Indirect injection: addressing the assistant by name." },
  { id: "DJL-PI-016", category: "prompt_injection", severity: 8, description: "Chat-template control tag injection (<|im_start|> etc)." },
  { id: "DJL-PI-017", category: "prompt_injection", severity: 7, description: "Confidence-hijacking: false claim of authority." },
  { id: "DJL-PI-018", category: "prompt_injection", severity: 8, description: "Instruction-smuggling via encoded payload directive." },
  { id: "DJL-PI-019", category: "prompt_injection", severity: 6, description: "'This is just a test' rationalisation frame." },
  { id: "DJL-PI-020", category: "prompt_injection", severity: 9, description: "'Forget everything above' override." },
  // SQL Injection (6 rules)
  { id: "DJL-SQLI-001", category: "sqli", severity: 9, description: "Tautology-based SQLi: ' OR 1=1." },
  { id: "DJL-SQLI-002", category: "sqli", severity: 10, description: "Stacked SQLi: ; DROP TABLE." },
  { id: "DJL-SQLI-003", category: "sqli", severity: 9, description: "Union-based SQLi." },
  { id: "DJL-SQLI-004", category: "sqli", severity: 9, description: "Tautology SQLi: ' OR 'x'='x." },
  { id: "DJL-SQLI-005", category: "sqli", severity: 9, description: "Auth-bypass SQLi: admin'--." },
  { id: "DJL-SQLI-006", category: "sqli", severity: 9, description: "Time-based blind SQLi." },
  // XSS (6 rules)
  { id: "DJL-XSS-001", category: "xss", severity: 8, description: "Inline <script> tag." },
  { id: "DJL-XSS-002", category: "xss", severity: 8, description: "javascript: pseudo-protocol." },
  { id: "DJL-XSS-003", category: "xss", severity: 8, description: "HTML event handler attribute (onerror, onload, etc)." },
  { id: "DJL-XSS-004", category: "xss", severity: 7, description: "Inline <iframe src=> tag." },
  { id: "DJL-XSS-005", category: "xss", severity: 8, description: "<img onerror=> XSS vector." },
  { id: "DJL-XSS-006", category: "xss", severity: 8, description: "data: URL with HTML/JS payload." },
  // PII (10 rules)
  { id: "DJL-PII-001", category: "pii", severity: 8, description: "US Social Security Number (XXX-XX-XXXX format)." },
  { id: "DJL-PII-002", category: "pii", severity: 7, description: "Credit card number candidate (13-19 digit run)." },
  { id: "DJL-PII-003", category: "pii", severity: 7, description: "IBAN bank account number." },
  { id: "DJL-PII-004", category: "pii", severity: 6, description: "US passport number candidate." },
  { id: "DJL-PII-005", category: "pii", severity: 5, description: "International phone number (E.164)." },
  { id: "DJL-PII-006", category: "pii", severity: 4, description: "Email address." },
  { id: "DJL-PII-007", category: "pii", severity: 7, description: "UK National Insurance Number." },
  { id: "DJL-PII-008", category: "pii", severity: 6, description: "German Steuer-ID candidate (11-digit run)." },
  { id: "DJL-PII-009", category: "pii", severity: 4, description: "Date of birth (MM/DD/YYYY) candidate." },
  { id: "DJL-PII-010", category: "pii", severity: 4, description: "IPv4 address (GDPR quasi-identifier)." },
  // Exfiltration (5 rules)
  { id: "DJL-EXF-001", category: "exfiltration", severity: 9, description: "Database dump request." },
  { id: "DJL-EXF-002", category: "exfiltration", severity: 8, description: "'Export all users/records' request." },
  { id: "DJL-EXF-003", category: "exfiltration", severity: 8, description: "'List every record' enumeration request." },
  { id: "DJL-EXF-004", category: "exfiltration", severity: 9, description: "Send-to-external-endpoint exfiltration directive." },
  { id: "DJL-EXF-005", category: "exfiltration", severity: 8, description: "curl/wget call to an external HTTP(S) host." },
  // Tool Misuse (10 rules)
  { id: "DJL-MIS-001", category: "tool_misuse", severity: 10, description: "rm -rf destructive filesystem call." },
  { id: "DJL-MIS-002", category: "tool_misuse", severity: 10, description: "'Delete all' destructive directive." },
  { id: "DJL-MIS-003", category: "tool_misuse", severity: 9, description: "Financial transfer >= 10,000 of any currency." },
  { id: "DJL-MIS-004", category: "tool_misuse", severity: 8, description: "Unauthorized auto-merge / auto-deploy directive." },
  { id: "DJL-MIS-005", category: "tool_misuse", severity: 9, description: "Direct kernel / raw-device access attempt." },
  { id: "DJL-MIS-006", category: "tool_misuse", severity: 8, description: "Privilege-escalation primitive (sudo, setuid, chmod +s)." },
  { id: "DJL-MIS-007", category: "tool_misuse", severity: 10, description: "Bash fork-bomb pattern." },
  { id: "DJL-MIS-008", category: "tool_misuse", severity: 10, description: "Reverse-shell invocation pattern." },
  { id: "DJL-MIS-009", category: "tool_misuse", severity: 9, description: "Disable defensive-tool directive." },
  { id: "DJL-MIS-010", category: "tool_misuse", severity: 9, description: "Code-injection sink fed with untrusted input." },
  // Policy (5 rules in engine; 007 pending)
  { id: "DJL-POL-001", category: "policy", severity: 9, description: "Financial: transfer >= 1,000,000 (regulatory threshold)." },
  { id: "DJL-POL-002", category: "policy", severity: 9, description: "Healthcare: PHI export request (HIPAA Privacy Rule)." },
  { id: "DJL-POL-003", category: "policy", severity: 10, description: "Government: classified-marking handling." },
  { id: "DJL-POL-004", category: "policy", severity: 10, description: "Retail: storing cardholder authentication data (PCI-DSS 3.2 violation)." },
  { id: "DJL-POL-005", category: "policy", severity: 10, description: "Energy / Manufacturing: OT control directive (NERC CIP / IEC 62443)." },
  // Pending rules — referenced in templates, not yet added to djl.py engine
  { id: "DJL-POL-006", category: "policy", severity: 0, description: "Pending — not yet in djl.py engine.", pending: true },
  { id: "DJL-POL-007", category: "policy", severity: 0, description: "Pending — not yet in djl.py engine.", pending: true },
  { id: "DJL-FIN-001", category: "finance", severity: 0, description: "Pending — not yet in djl.py engine.", pending: true },
  { id: "DJL-FIN-002", category: "finance", severity: 0, description: "Pending — not yet in djl.py engine.", pending: true },
  { id: "DJL-FIN-003", category: "finance", severity: 0, description: "Pending — not yet in djl.py engine.", pending: true },
];


// ---------------------------------------------------------------------------
// Template data — static fallback mirrors apohara_aegis/templates.py TEMPLATES
// Used when GET /v1/soar/templates returns non-200 or is unreachable.
// ---------------------------------------------------------------------------

interface TemplateData {
  name: string;
  description: string;
  regulatory_refs: string[];
  default_djl_rule_subset: string[];
  mandatory_incident_codes: string[];
  default_compliance_report_sections: string[];
}

const STATIC_TEMPLATES: Record<string, TemplateData> = {
  finance: {
    name: "Finance",
    description:
      "Banks, broker-dealers, payment processors, and fintech platforms. " +
      "Stricter on AGT-FIN-* codes and PII leakage; requires audit-tamper " +
      "resistance for SOX 404 compliance and AML structuring detection for " +
      "FinCEN obligations.",
    regulatory_refs: ["PCI-DSS-4.0", "SOX", "GLBA", "EU-MIFID-II", "FinCEN-31-CFR-1020", "NIST-SP-800-53"],
    default_djl_rule_subset: [
      "DJL-PI-001", "DJL-PI-002", "DJL-PI-003",
      "DJL-FIN-001", "DJL-FIN-002", "DJL-FIN-003",
      "DJL-EXF-002", "DJL-EXF-003",
      "DJL-PII-002", "DJL-PII-003",
      "DJL-POL-002", "DJL-POL-003", "DJL-POL-006",
    ],
    mandatory_incident_codes: [
      "AGT-FIN-HIGH-VALUE-TRANSFER",
      "AGT-FIN-FRAUD-PATTERN",
      "AGT-GOV-AUDIT-TAMPERING",
      "AGT-PII-LEAKAGE",
      "AGT-EXF-NETWORK",
    ],
    default_compliance_report_sections: [
      "PCI-DSS cardholder data flow audit",
      "SOX financial reporting controls (Section 404)",
      "AML transaction monitoring (FinCEN structuring detection)",
      "GLBA data-sharing consent evidence",
      "High-value transfer dual-control log",
    ],
  },
  healthcare: {
    name: "Healthcare",
    description:
      "Hospitals, health insurers, clinical decision-support tools, and " +
      "medical device software. HIPAA PHI handling and de-identification " +
      "validation are primary concerns; EU MDR applies when AI is embedded " +
      "in regulated medical devices.",
    regulatory_refs: ["HIPAA-Privacy-Rule", "HIPAA-Security-Rule", "HITECH", "21-CFR-Part-11", "NIST-SP-800-66", "EU-MDR-2017-745"],
    default_djl_rule_subset: [
      "DJL-PI-001", "DJL-PI-002", "DJL-PI-006",
      "DJL-PII-001", "DJL-PII-002", "DJL-PII-003", "DJL-PII-004",
      "DJL-EXF-001", "DJL-EXF-004",
      "DJL-MIS-001",
      "DJL-POL-004", "DJL-POL-006", "DJL-POL-007",
    ],
    mandatory_incident_codes: [
      "AGT-PII-LEAKAGE",
      "AGT-PII-RECONSTRUCTION",
      "AGT-EXF-PII-AGGREGATION",
      "AGT-GOV-HUMAN-OVERSIGHT-BYPASS",
      "AGT-MIS-DESTRUCTIVE",
    ],
    default_compliance_report_sections: [
      "HIPAA PHI access and disclosure log",
      "Breach notification assessment (HITECH §13402)",
      "21-CFR-Part-11 electronic records audit trail",
      "De-identification validation (Safe Harbor vs. Expert Determination)",
      "Human-in-the-loop gate evidence for clinical decision support",
    ],
  },
  government: {
    name: "Government",
    description:
      "Federal agencies, defence contractors, and critical infrastructure " +
      "operators under FISMA. FedRAMP Moderate authorization controls and " +
      "EO-14028 zero-trust requirements drive mandatory audit-tamper and " +
      "privilege escalation monitoring.",
    regulatory_refs: ["FedRAMP-Moderate", "FISMA", "NIST-SP-800-53-Rev5", "NIST-SP-800-171", "CISA-Zero-Trust-Maturity", "EO-14028"],
    default_djl_rule_subset: [
      "DJL-PI-001", "DJL-PI-002", "DJL-PI-003", "DJL-PI-006", "DJL-PI-007",
      "DJL-EXF-001", "DJL-EXF-002", "DJL-EXF-003",
      "DJL-MIS-003", "DJL-MIS-004",
      "DJL-POL-004", "DJL-POL-005", "DJL-POL-006", "DJL-POL-007",
    ],
    mandatory_incident_codes: [
      "AGT-PI-INDIRECT",
      "AGT-MIS-PRIVILEGE-ESCALATION",
      "AGT-GOV-POLICY-BYPASS",
      "AGT-GOV-AUDIT-TAMPERING",
      "AGT-GOV-HUMAN-OVERSIGHT-BYPASS",
    ],
    default_compliance_report_sections: [
      "FedRAMP continuous monitoring evidence",
      "FISMA annual security assessment artifacts",
      "NIST SP 800-53 Rev5 control satisfaction matrix",
      "Privilege escalation attempt log (AC-6)",
      "Audit log integrity chain (AU-9 tamper-evidence)",
    ],
  },
  retail: {
    name: "Retail",
    description:
      "E-commerce, brick-and-mortar chains, and marketplace platforms. " +
      "PCI-DSS governs payment card data; CCPA and GDPR mandate consumer " +
      "rights controls; fraud pattern detection is critical for " +
      "AI-assisted checkout and promotions abuse.",
    regulatory_refs: ["PCI-DSS-4.0", "CCPA", "GDPR", "CAN-SPAM", "FTC-Act-Section-5"],
    default_djl_rule_subset: [
      "DJL-PI-001", "DJL-PI-002",
      "DJL-SQLI-001",
      "DJL-PII-001", "DJL-PII-002", "DJL-PII-003",
      "DJL-EXF-002", "DJL-EXF-004",
      "DJL-MIS-005",
      "DJL-POL-003", "DJL-POL-004",
    ],
    mandatory_incident_codes: [
      "AGT-PII-LEAKAGE",
      "AGT-EXF-PII-AGGREGATION",
      "AGT-FIN-FRAUD-PATTERN",
      "AGT-MIS-UNAUTHORIZED-TRANSACTION",
    ],
    default_compliance_report_sections: [
      "PCI-DSS cardholder data environment scope",
      "CCPA consumer rights request log",
      "GDPR data subject access request evidence",
      "Fraud pattern and velocity anomaly summary",
    ],
  },
  manufacturing: {
    name: "Manufacturing",
    description:
      "Discrete and process manufacturers, smart factory OT/IT convergence, " +
      "and defence supply-chain operators. IEC 62443 OT segmentation and " +
      "CMMC defence-contractor requirements drive privilege escalation and " +
      "destructive command monitoring.",
    regulatory_refs: ["NIST-CSF-2.0", "IEC-62443-3-3", "ISO-27001-2022", "CMMC-2.0-Level2", "EU-CRA-2024"],
    default_djl_rule_subset: [
      "DJL-PI-001", "DJL-PI-003", "DJL-PI-006",
      "DJL-MIS-001", "DJL-MIS-002", "DJL-MIS-003", "DJL-MIS-004",
      "DJL-EXF-002", "DJL-EXF-003",
      "DJL-POL-001", "DJL-POL-005", "DJL-POL-006",
    ],
    mandatory_incident_codes: [
      "AGT-MIS-DESTRUCTIVE",
      "AGT-MIS-PRIVILEGE-ESCALATION",
      "AGT-MIS-UNAUTHORIZED-TRANSACTION",
      "AGT-PI-INDIRECT",
      "AGT-EXF-NETWORK",
    ],
    default_compliance_report_sections: [
      "IEC 62443-3-3 OT network segmentation evidence",
      "NIST CSF 2.0 Respond function incident timeline",
      "CMMC Level 2 access control attestation",
      "Destructive command invocation log",
      "OT/IT boundary crossing anomalies",
    ],
  },
  energy: {
    name: "Energy",
    description:
      "Electric utilities, oil & gas pipelines, and renewable energy " +
      "operators. NERC CIP governs bulk electric system cybersecurity; " +
      "IEC 62443 applies to ICS/SCADA control systems; EU NIS2 mandates " +
      "72-hour incident notification for critical infrastructure operators.",
    regulatory_refs: ["NERC-CIP-013-2", "IEC-62443-2-1", "NIST-SP-800-82-Rev3", "EU-NIS2-2022", "TSA-Security-Directive-2B"],
    default_djl_rule_subset: [
      "DJL-PI-001", "DJL-PI-003", "DJL-PI-006", "DJL-PI-007",
      "DJL-MIS-001", "DJL-MIS-002", "DJL-MIS-003", "DJL-MIS-004",
      "DJL-EXF-002", "DJL-EXF-003",
      "DJL-POL-004", "DJL-POL-005", "DJL-POL-006", "DJL-POL-007",
    ],
    mandatory_incident_codes: [
      "AGT-MIS-DESTRUCTIVE",
      "AGT-MIS-PRIVILEGE-ESCALATION",
      "AGT-GOV-POLICY-BYPASS",
      "AGT-GOV-AUDIT-TAMPERING",
      "AGT-PI-INDIRECT",
    ],
    default_compliance_report_sections: [
      "NERC CIP-013 supply-chain risk management evidence",
      "IEC 62443-2-1 ICS security management evidence",
      "NIST SP 800-82 ICS asset inventory and patch status",
      "EU NIS2 incident report (72-hour notification timeline)",
      "TSA Security Directive 2B cybersecurity architecture assessment",
    ],
  },
};

// ---------------------------------------------------------------------------
// YAML hand-renderer (no js-yaml dependency)
// ---------------------------------------------------------------------------

function toYaml(obj: unknown, indent = 0): string {
  const pad = " ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "string") {
    // Quote strings that need it
    if (obj.includes(":") || obj.includes("#") || obj.includes("'") || obj === "") {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => `\n${pad}- ${toYaml(item, indent + 2)}`).join("");
  }
  if (typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => {
        if (Array.isArray(v)) {
          return `\n${pad}${k}:${toYaml(v, indent + 2)}`;
        }
        return `\n${pad}${k}: ${toYaml(v, indent + 2)}`;
      })
      .join("");
  }
  return String(obj);
}

function templateToExportable(key: string, tpl: TemplateData) {
  return {
    template_id: key,
    name: tpl.name,
    regulatory_refs: tpl.regulatory_refs,
    default_djl_rule_subset: tpl.default_djl_rule_subset,
    mandatory_incident_codes: tpl.mandatory_incident_codes,
    default_compliance_report_sections: tpl.default_compliance_report_sections,
    description: tpl.description,
    source: "apohara_aegis/templates.py",
  };
}

// ---------------------------------------------------------------------------
// Collapsible section component
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded border mb-3"
      style={{
        borderColor: "hsl(var(--border))",
        backgroundColor: "var(--apohara-bg-raised)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <span
          className="font-pixel-sans text-[10px]"
          style={{ color: "var(--apohara-lime)" }}
        >
          {title}
        </span>
        <span
          className="font-mono text-[9px]"
          style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
        >
          {open ? "▲ collapse" : "▼ expand"}
        </span>
      </button>
      {open && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: "1px solid hsl(var(--border) / 0.4)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Severity color (mirrors IncidentsPage.tsx pattern)
// ---------------------------------------------------------------------------

function severityColor(sev: number): string {
  if (sev >= 9) return "var(--apohara-red)";
  if (sev >= 7) return "#b45309";
  if (sev >= 5) return "#a16207";
  if (sev === 0) return "var(--apohara-bone)";
  return "var(--apohara-lime)";
}

// ---------------------------------------------------------------------------
// Template icons (emoji only — no image assets)
// ---------------------------------------------------------------------------

const TEMPLATE_META: Record<string, { icon: string; shortDesc: string }> = {
  finance: { icon: "🏦", shortDesc: "PCI-DSS · SOX · GLBA" },
  healthcare: { icon: "🏥", shortDesc: "HIPAA · HITECH · 21-CFR-Part-11" },
  government: { icon: "🏛️", shortDesc: "FedRAMP · FISMA · EO-14028" },
  retail: { icon: "🛒", shortDesc: "PCI-DSS · CCPA · GDPR" },
  manufacturing: { icon: "🏭", shortDesc: "IEC-62443 · NIST-CSF · CMMC" },
  energy: { icon: "⚡", shortDesc: "NERC-CIP · IEC-62443 · EU-NIS2" },
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function PolicyBuilderPage() {
  const [templates, setTemplates] = useState<Record<string, TemplateData>>(STATIC_TEMPLATES);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // Fetch from API; fall back to static data on any error
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/templates`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) {
          setFetchError(
            `HTTP ${resp.status} from /v1/soar/templates — showing static fallback from apohara_aegis/templates.py`,
          );
          return;
        }
        const data = (await resp.json()) as Record<string, TemplateData>;
        if (Object.keys(data).length > 0) {
          setTemplates(data);
        }
        setFetchError(null);
      } catch (e) {
        setFetchError(
          `${(e as Error).message} — showing static fallback from apohara_aegis/templates.py`,
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const selected = selectedKey ? (templates[selectedKey] ?? null) : null;
  const selectedSubset = new Set(selected?.default_djl_rule_subset ?? []);

  function copyAsJson() {
    if (!selected || !selectedKey) return;
    const data = templateToExportable(selectedKey, selected);
    void navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopyMsg("Copied as JSON");
      setTimeout(() => setCopyMsg(null), 2000);
    });
  }

  function copyAsYaml() {
    if (!selected || !selectedKey) return;
    const data = templateToExportable(selectedKey, selected);
    const yaml = `# Apohara PROBANT — ${selected.name} template\n# Source: apohara_aegis/templates.py\n` + toYaml(data).trimStart();
    void navigator.clipboard.writeText(yaml).then(() => {
      setCopyMsg("Copied as YAML");
      setTimeout(() => setCopyMsg(null), 2000);
    });
  }

  return (
    <DashboardLayout title="Policy Builder">
      <div className="p-6">
        <div className="mb-6">
          <h2
            className="font-pixel-sans text-sm mb-1"
            style={{ color: "var(--apohara-bone)" }}
          >
            Policy Builder
          </h2>
          <p
            className="font-mono text-xs"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            6 industry templates · 62 DJL rules ·{" "}
            <code>GET {BASE}/v1/soar/templates</code>
          </p>
        </div>

        {/* Fetch error notice */}
        {!loading && fetchError && (
          <div
            className="mb-4 p-3 rounded font-mono text-[10px]"
            style={{
              backgroundColor: "rgba(180,83,9,0.10)",
              color: "#b45309",
              border: "1px solid rgba(180,83,9,0.4)",
            }}
          >
            {fetchError}
          </div>
        )}

        {loading && (
          <p
            className="font-mono text-xs mb-4"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            Loading templates…
          </p>
        )}

        {/* 2-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left — Template selector */}
          <div>
            <p
              className="font-pixel-sans text-[10px] mb-3"
              style={{ color: "var(--apohara-lime)" }}
            >
              Industry Templates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
              {Object.entries(templates).map(([key, tpl]) => {
                const meta = TEMPLATE_META[key] ?? { icon: "📋", shortDesc: key };
                const active = selectedKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedKey(active ? null : key);
                      setCopyMsg(null);
                    }}
                    className="text-left rounded border p-3 transition-colors"
                    style={{
                      borderColor: active
                        ? "var(--apohara-lime)"
                        : "hsl(var(--border))",
                      backgroundColor: active
                        ? "rgba(37,177,63,0.08)"
                        : "var(--apohara-bg-raised)",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl shrink-0">{meta.icon}</span>
                      <div className="min-w-0">
                        <p
                          className="font-pixel-sans text-[10px]"
                          style={{
                            color: active
                              ? "var(--apohara-lime)"
                              : "var(--apohara-bone)",
                          }}
                        >
                          {tpl.name}
                        </p>
                        <p
                          className="font-mono text-[9px] mt-0.5"
                          style={{ color: "var(--apohara-bone)", opacity: 0.45 }}
                        >
                          {meta.shortDesc}
                        </p>
                        <p
                          className="font-mono text-[9px] mt-1 leading-relaxed"
                          style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                        >
                          {tpl.default_djl_rule_subset.length} DJL rules ·{" "}
                          {tpl.mandatory_incident_codes.length} mandatory codes ·{" "}
                          {tpl.regulatory_refs.length} frameworks
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — Policy preview */}
          <div>
            {!selected && (
              <div
                className="rounded border p-8 text-center"
                style={{
                  borderColor: "hsl(var(--border))",
                  backgroundColor: "var(--apohara-bg-raised)",
                  color: "var(--apohara-bone)",
                  opacity: 0.4,
                }}
              >
                <p className="font-mono text-sm">Select a template to preview its policy</p>
              </div>
            )}

            {selected && selectedKey && (
              <div>
                {/* Header + export buttons */}
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <p
                    className="font-pixel-sans text-[10px]"
                    style={{ color: "var(--apohara-lime)" }}
                  >
                    {selected.name} Policy Preview
                  </p>
                  <div className="flex items-center gap-2">
                    {copyMsg && (
                      <span
                        className="font-mono text-[9px]"
                        style={{ color: "var(--apohara-lime)" }}
                      >
                        {copyMsg}
                      </span>
                    )}
                    <button
                      onClick={copyAsJson}
                      className="font-mono text-[9px] px-2.5 py-1 rounded border transition-colors"
                      style={{
                        borderColor: "hsl(var(--border))",
                        color: "var(--apohara-bone)",
                      }}
                    >
                      Copy as JSON
                    </button>
                    <button
                      onClick={copyAsYaml}
                      className="font-mono text-[9px] px-2.5 py-1 rounded border transition-colors"
                      style={{
                        borderColor: "hsl(var(--border))",
                        color: "var(--apohara-bone)",
                      }}
                    >
                      Copy as YAML
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div
                  className="rounded border p-3 mb-3 font-mono text-[10px] leading-relaxed"
                  style={{
                    borderColor: "hsl(var(--border) / 0.5)",
                    backgroundColor: "var(--apohara-bg-raised)",
                    color: "var(--apohara-bone)",
                    opacity: 0.7,
                  }}
                >
                  {selected.description}
                </div>

                {/* DJL rule subset */}
                <CollapsibleSection
                  title={`DJL Rule Subset (${selectedSubset.size} / 62 rules ON)`}
                >
                  <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                    {ALL_DJL_RULES.map((rule) => {
                      const on = selectedSubset.has(rule.id);
                      return (
                        <div
                          key={rule.id}
                          className="flex items-start gap-2 py-1 font-mono text-[9px]"
                          style={{
                            borderBottom: "1px solid hsl(var(--border) / 0.2)",
                            opacity: on ? 1 : 0.35,
                          }}
                        >
                          {/* ON/OFF indicator */}
                          <span
                            className="shrink-0 mt-0.5"
                            style={{
                              color: on ? "var(--apohara-lime)" : "var(--apohara-bone)",
                            }}
                          >
                            {on ? "●" : "○"}
                          </span>
                          {/* Rule ID */}
                          <span
                            className="shrink-0 w-24"
                            style={{
                              color: rule.pending
                                ? "var(--apohara-bone)"
                                : on
                                  ? "var(--apohara-lime)"
                                  : "var(--apohara-bone)",
                            }}
                          >
                            {rule.id}
                            {rule.pending && (
                              <span
                                className="ml-1 text-[8px]"
                                style={{ color: "#b45309" }}
                              >
                                (pending)
                              </span>
                            )}
                          </span>
                          {/* Category */}
                          <span
                            className="shrink-0 w-20"
                            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
                          >
                            {rule.category.replace("_", " ")}
                          </span>
                          {/* Severity */}
                          {!rule.pending && (
                            <span
                              className="shrink-0 w-4 text-center"
                              style={{ color: severityColor(rule.severity) }}
                            >
                              {rule.severity}
                            </span>
                          )}
                          {/* Description */}
                          <span style={{ color: "var(--apohara-bone)" }}>
                            {rule.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleSection>

                {/* Mandatory incident codes */}
                <CollapsibleSection
                  title={`Mandatory Incident Codes (${selected.mandatory_incident_codes.length})`}
                >
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.mandatory_incident_codes.map((code) => (
                      <span
                        key={code}
                        className="font-pixel-sans text-[9px] px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--apohara-dark)",
                          color: "var(--apohara-red)",
                          border: "1px solid rgba(184,38,42,0.3)",
                        }}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Regulatory references */}
                <CollapsibleSection
                  title={`Regulatory References (${selected.regulatory_refs.length})`}
                >
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.regulatory_refs.map((ref) => (
                      <span
                        key={ref}
                        className="font-mono text-[9px] px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--apohara-bg-raised)",
                          color: "var(--apohara-bone)",
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Compliance report sections */}
                <CollapsibleSection
                  title={`Compliance Report Sections (${selected.default_compliance_report_sections.length})`}
                  defaultOpen={false}
                >
                  <ol className="mt-2 space-y-1 list-decimal list-inside font-mono text-[10px]">
                    {selected.default_compliance_report_sections.map((sec, i) => (
                      <li
                        key={i}
                        style={{ color: "var(--apohara-bone)", opacity: 0.7 }}
                      >
                        {sec}
                      </li>
                    ))}
                  </ol>
                </CollapsibleSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
