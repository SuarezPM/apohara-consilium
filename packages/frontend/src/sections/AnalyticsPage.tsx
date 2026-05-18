// SPDX-License-Identifier: Apache-2.0
// US-88 — Analytics Page (Apohara PROBANT Fusion Sprint 2026-05-18)
// Row 1: DJL block-rate sparkline from /v1/soar/metrics (30 s poll)
// Row 2: 6 compliance framework cards with incident count mapping
//   - Frameworks: GET /v1/soar/compliance/frameworks
//   - Incidents:  GET /v1/soar/incidents/recent?limit=200
//   - AGT-* code mapping done client-side
//   - If either endpoint fails → explicit stub with "Aggregation endpoint pending — US-89" note
import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";
const POLL_MS = 30_000;
const SPARKLINE_MAX_POINTS = 30;

// ---------------------------------------------------------------------------
// Prometheus parser (matches Dashboard.tsx pattern)
// ---------------------------------------------------------------------------

function parsePrometheusGauges(text: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const line of text.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const [namePart, valuePart] = line.split(" ");
    if (namePart && valuePart !== undefined) {
      const val = parseFloat(valuePart);
      if (!isNaN(val)) result[namePart.trim()] = val;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricsSnapshot {
  ts: number;
  block: number;
  allow: number;
  review: number;
  blockRate: number; // 0–100
}

interface Framework {
  name: string;
  version: string;
  description: string;
  control_count: number;
  source_url: string;
}

interface IncidentRecent {
  ts: number;
  incident_code: string;
  severity: number;
  verdict: string;
  signed_hash: string;
}

// ---------------------------------------------------------------------------
// Framework metadata (static fallback labels + control-area hints)
// ---------------------------------------------------------------------------

const FRAMEWORK_META: Record<
  string,
  { label: string; shortLabel: string; sourceUrl: string }
> = {
  "EU AI Act": {
    label: "EU AI Act",
    shortLabel: "EU AI Act",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689",
  },
  "NIST AI RMF": {
    label: "NIST AI RMF",
    shortLabel: "AI RMF",
    sourceUrl: "https://airc.nist.gov/rmf",
  },
  "NIST SP 800-53": {
    label: "NIST SP 800-53",
    shortLabel: "SP 800-53",
    sourceUrl: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
  },
  "SOC 2": {
    label: "SOC 2",
    shortLabel: "SOC 2",
    sourceUrl: "https://www.aicpa.org/resources/article/soc-2-reporting-on-an-examination-of-controls-at-a-service-organization-relevant-to-security",
  },
  "ISO 27001": {
    label: "ISO 27001",
    shortLabel: "ISO 27001",
    sourceUrl: "https://www.iso.org/standard/27001",
  },
  "OWASP LLM 2026": {
    label: "OWASP LLM 2026",
    shortLabel: "OWASP LLM",
    sourceUrl: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
  },
};

// Six canonical frameworks — used as fallback if /v1/soar/compliance/frameworks returns empty/error
const CANONICAL_FRAMEWORKS: Framework[] = [
  {
    name: "EU AI Act",
    version: "2024/1689",
    description: "Horizontal regulation for AI systems placed on the EU market.",
    control_count: 0,
    source_url: FRAMEWORK_META["EU AI Act"].sourceUrl,
  },
  {
    name: "NIST AI RMF",
    version: "1.0",
    description: "Risk management framework for trustworthy AI systems.",
    control_count: 0,
    source_url: FRAMEWORK_META["NIST AI RMF"].sourceUrl,
  },
  {
    name: "NIST SP 800-53",
    version: "Rev 5",
    description: "Security and privacy controls for information systems.",
    control_count: 0,
    source_url: FRAMEWORK_META["NIST SP 800-53"].sourceUrl,
  },
  {
    name: "SOC 2",
    version: "2017",
    description: "Trust services criteria for security, availability and confidentiality.",
    control_count: 0,
    source_url: FRAMEWORK_META["SOC 2"].sourceUrl,
  },
  {
    name: "ISO 27001",
    version: "2022",
    description: "Information security management system standard.",
    control_count: 0,
    source_url: FRAMEWORK_META["ISO 27001"].sourceUrl,
  },
  {
    name: "OWASP LLM 2026",
    version: "1.0",
    description: "Top 10 security risks for LLM-powered applications.",
    control_count: 0,
    source_url: FRAMEWORK_META["OWASP LLM 2026"].sourceUrl,
  },
];

// Map AGT-* category prefix → likely frameworks
const CATEGORY_FRAMEWORK_MAP: Record<string, string[]> = {
  "AGT-PI":  ["OWASP LLM 2026", "NIST SP 800-53", "ISO 27001"],
  "AGT-EXF": ["NIST SP 800-53", "ISO 27001", "SOC 2"],
  "AGT-MIS": ["EU AI Act", "NIST AI RMF", "OWASP LLM 2026"],
  "AGT-FIN": ["NIST SP 800-53", "SOC 2", "ISO 27001"],
  "AGT-PII": ["NIST SP 800-53", "ISO 27001", "SOC 2"],
  "AGT-GOV": ["EU AI Act", "NIST AI RMF", "NIST SP 800-53"],
};

function incidentCategory(code: string): string {
  return code.split("-").slice(0, 2).join("-");
}

// ---------------------------------------------------------------------------
// Hand-rolled SVG sparkline (no chart library)
// ---------------------------------------------------------------------------

function Sparkline({
  points,
  width = 400,
  height = 60,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="var(--apohara-bone)"
          opacity="0.4"
        >
          Collecting data…
        </text>
      </svg>
    );
  }

  const max = Math.max(...points, 1);
  const padX = 4;
  const padY = 6;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const pts = points.map((v, i) => {
    const x = padX + (i / (points.length - 1)) * w;
    const y = padY + h - (v / max) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = pts.join(" ");

  // Fill area under curve
  const first = pts[0];
  const last = pts[pts.length - 1];
  const [, firstY] = first.split(",");
  const [lastX] = last.split(",");
  const fillPts = `${first} ${polyline} ${lastX},${(padY + h).toFixed(1)} ${padX},${(padY + h).toFixed(1)} ${padX},${firstY}`;

  return (
    <svg
      width={width}
      height={height}
      className="w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Fill */}
      <polygon
        points={fillPts}
        fill="var(--apohara-lime)"
        opacity="0.08"
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="var(--apohara-lime)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Latest dot */}
      {(() => {
        const [lx, ly] = last.split(",");
        return (
          <circle
            cx={lx}
            cy={ly}
            r="2.5"
            fill="var(--apohara-lime)"
          />
        );
      })()}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

function StatTile({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string | null;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded border p-4"
      style={{
        borderColor: highlight ? "var(--apohara-lime)" : "hsl(var(--border))",
        backgroundColor: "var(--apohara-bg-raised)",
      }}
    >
      <p
        className="font-mono text-[10px] mb-1"
        style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
      >
        {label}
      </p>
      <p
        className="font-pixel-sans text-2xl leading-none"
        style={{ color: highlight ? "var(--apohara-lime)" : "var(--apohara-bone)" }}
      >
        {value ?? "—"}
        {value !== null && unit && (
          <span
            className="font-mono text-[10px] ml-1"
            style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
          >
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Framework card
// ---------------------------------------------------------------------------

function FrameworkCard({
  fw,
  incidentCount,
  pending,
}: {
  fw: Framework;
  incidentCount: number | null;
  pending: boolean;
}) {
  const meta = FRAMEWORK_META[fw.name];
  const sourceUrl = meta?.sourceUrl ?? fw.source_url;

  return (
    <div
      className="rounded border p-4"
      style={{
        borderColor: "hsl(var(--border))",
        backgroundColor: "var(--apohara-bg-raised)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p
            className="font-pixel-sans text-[10px]"
            style={{ color: "var(--apohara-lime)" }}
          >
            {fw.name}
          </p>
          <p
            className="font-mono text-[10px]"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            {fw.version}
          </p>
        </div>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded shrink-0"
          style={{
            backgroundColor: "var(--apohara-bg-mid)",
            color:
              incidentCount !== null && incidentCount > 0
                ? "var(--apohara-red)"
                : "var(--apohara-bone)",
          }}
        >
          {pending
            ? "…"
            : incidentCount !== null
              ? `${incidentCount} incidents`
              : "—"}
        </span>
      </div>
      <p
        className="font-mono text-[10px] leading-relaxed mb-3"
        style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
      >
        {fw.description}
      </p>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[10px] hover:underline"
        style={{ color: "var(--apohara-lime)", opacity: 0.7 }}
      >
        ↗ source
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function AnalyticsPage() {
  // Sparkline history: array of block-rate % values
  const [sparkPoints, setSparkPoints] = useState<number[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<MetricsSnapshot | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Framework cards
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [frameworksPending, setFrameworksPending] = useState(true);
  const [incidentCounts, setIncidentCounts] = useState<Record<string, number> | null>(null);
  const [incidentsPending, setIncidentsPending] = useState(true);
  const [showAggStub, setShowAggStub] = useState(false);

  const pollCountRef = useRef(0);

  // ----- Metrics poll (30 s) -----
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/metrics`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!resp.ok) {
          setMetricsError(`HTTP ${resp.status} from /v1/soar/metrics`);
          return;
        }
        const text = await resp.text();
        const g = parsePrometheusGauges(text);

        const block = g["apohara_soar_verdicts_block_total"] ?? 0;
        const allow = g["apohara_soar_verdicts_allow_total"] ?? 0;
        const review = g["apohara_soar_verdicts_review_total"] ?? 0;
        const total = block + allow + review || 1;
        const blockRate = (block / total) * 100;

        const snap: MetricsSnapshot = {
          ts: Date.now(),
          block,
          allow,
          review,
          blockRate,
        };

        setLatestSnapshot(snap);
        setSparkPoints((prev) => {
          const next = [...prev, parseFloat(blockRate.toFixed(1))];
          return next.slice(-SPARKLINE_MAX_POINTS);
        });
        setMetricsError(null);
        pollCountRef.current += 1;
      } catch {
        setMetricsError("Metrics endpoint unreachable — /v1/soar/metrics");
      }
    };

    void fetchMetrics();
    const id = setInterval(() => void fetchMetrics(), POLL_MS);
    return () => clearInterval(id);
  }, []);

  // ----- Frameworks fetch (once) -----
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/compliance/frameworks`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) {
          // Fall back to canonical static list
          setFrameworks(CANONICAL_FRAMEWORKS);
          return;
        }
        const data = (await resp.json()) as Framework[];
        setFrameworks(data.length > 0 ? data : CANONICAL_FRAMEWORKS);
      } catch {
        setFrameworks(CANONICAL_FRAMEWORKS);
      } finally {
        setFrameworksPending(false);
      }
    };
    void load();
  }, []);

  // ----- Incidents fetch (once, client-side aggregation) -----
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/incidents/recent?limit=200`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) {
          setShowAggStub(true);
          return;
        }
        const data = (await resp.json()) as IncidentRecent[];
        if (!Array.isArray(data) || data.length === 0) {
          setShowAggStub(true);
          return;
        }

        // Map each incident to the frameworks it belongs to
        const counts: Record<string, number> = {};
        for (const inc of data) {
          const cat = incidentCategory(inc.incident_code);
          const fws = CATEGORY_FRAMEWORK_MAP[cat] ?? [];
          for (const fw of fws) {
            counts[fw] = (counts[fw] ?? 0) + 1;
          }
        }
        setIncidentCounts(counts);
      } catch {
        setShowAggStub(true);
      } finally {
        setIncidentsPending(false);
      }
    };
    void load();
  }, []);

  const displayFrameworks =
    frameworks.length > 0 ? frameworks : CANONICAL_FRAMEWORKS;

  return (
    <DashboardLayout title="Analytics">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2
            className="font-pixel-sans text-sm mb-1"
            style={{ color: "var(--apohara-bone)" }}
          >
            DJL Analytics
          </h2>
          <p
            className="font-mono text-xs"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            Block-rate sparkline · 30 s poll ·{" "}
            <code>GET {BASE}/v1/soar/metrics</code>
          </p>
        </div>

        {/* ── Row 1: Sparkline + stat tiles ── */}
        <div
          className="rounded border p-4"
          style={{
            borderColor: "hsl(var(--border))",
            backgroundColor: "var(--apohara-bg-raised)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="font-pixel-sans text-[10px]"
              style={{ color: "var(--apohara-lime)" }}
            >
              Block Rate % — last {sparkPoints.length} polls
            </p>
            {metricsError && (
              <span
                className="font-mono text-[10px]"
                style={{ color: "var(--apohara-red)" }}
              >
                {metricsError}
              </span>
            )}
          </div>

          <Sparkline points={sparkPoints} height={64} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatTile
              label="total BLOCK"
              value={
                latestSnapshot !== null
                  ? String(latestSnapshot.block)
                  : null
              }
              highlight={
                latestSnapshot !== null && latestSnapshot.block > 0
              }
            />
            <StatTile
              label="total ALLOW"
              value={
                latestSnapshot !== null
                  ? String(latestSnapshot.allow)
                  : null
              }
            />
            <StatTile
              label="total REVIEW"
              value={
                latestSnapshot !== null
                  ? String(latestSnapshot.review)
                  : null
              }
            />
            <StatTile
              label="block rate"
              value={
                latestSnapshot !== null
                  ? latestSnapshot.blockRate.toFixed(1)
                  : null
              }
              unit="%"
              highlight={
                latestSnapshot !== null && latestSnapshot.blockRate > 0
              }
            />
          </div>

          {latestSnapshot === null && !metricsError && (
            <p
              className="font-mono text-[10px] mt-2"
              style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
            >
              Waiting for first metrics poll…
            </p>
          )}
        </div>

        {/* ── Row 2: Compliance framework cards ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="font-pixel-sans text-[10px]"
              style={{ color: "var(--apohara-lime)" }}
            >
              Incident Count by Framework
            </p>
            <p
              className="font-mono text-[10px]"
              style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
            >
              {incidentsPending
                ? "loading incidents…"
                : "client-side AGT-* mapping"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayFrameworks.map((fw) => (
              <FrameworkCard
                key={fw.name}
                fw={fw}
                incidentCount={incidentCounts?.[fw.name] ?? null}
                pending={incidentsPending || frameworksPending}
              />
            ))}
          </div>

          {/* Stub notice — shown when aggregation endpoints are unavailable */}
          {showAggStub && (
            <div
              className="mt-4 px-3 py-2 rounded font-mono text-[10px]"
              style={{
                backgroundColor: "rgba(180,83,9,0.10)",
                color: "#b45309",
                border: "1px solid rgba(180,83,9,0.4)",
              }}
            >
              Aggregation endpoint pending — tracking US-89 + future stretch.
              <br />
              Incident counts will populate once{" "}
              <code className="font-mono">{BASE}/v1/soar/incidents/recent</code>{" "}
              returns AGT-* coded entries.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
