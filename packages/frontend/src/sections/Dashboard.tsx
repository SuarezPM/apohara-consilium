import { useEffect, useState } from "react";
import { VerdictTrendChart } from "./VerdictTrendChart";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";

interface LedgerEntry {
  verdict: "verified" | "risky" | "blocked";
  attackers: Array<{
    vendor: string;
    model: string;
    found_issue: boolean;
    reasoning: string;
  }>;
  signed_hash: string;
  latency_ms: number;
  ts: number;
}

interface MetricTiles {
  djl_rules: number | null;
  incident_types: number | null;
  templates: number | null;
  mythos_slot: string | null;
}

// Parse Prometheus text/plain gauge dump
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

function MetricTile({
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

export function Dashboard() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState<string>(
    () => localStorage.getItem("apohara_admin_key") ?? "",
  );
  const [tiles, setTiles] = useState<MetricTiles>({
    djl_rules: null,
    incident_types: null,
    templates: null,
    mythos_slot: null,
  });

  // Fetch /v1/soar/metrics (Prometheus text format)
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/metrics`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!resp.ok) return;
        const text = await resp.text();
        const gauges = parsePrometheusGauges(text);
        setTiles({
          djl_rules: gauges["apohara_soar_djl_rules_total"] ?? null,
          incident_types: gauges["apohara_soar_incident_codes_total"] ?? null,
          templates: gauges["apohara_soar_industry_templates_total"] ?? null,
          mythos_slot:
            gauges["apohara_soar_mythos_slot_active"] === 1
              ? "active"
              : "reserved",
        });
      } catch {
        // non-blocking; tiles stay null
      }
    };

    void loadMetrics();
    const id = setInterval(() => void loadMetrics(), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!adminKey) return;

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({ limit: "50", admin_key: adminKey });
        const resp = await fetch(
          `${BASE}/v1/audit/recent?${params.toString()}`,
        );
        if (!resp.ok) {
          setError(`HTTP ${resp.status}`);
          return;
        }
        const data = (await resp.json()) as { entries: LedgerEntry[] };
        setEntries(data.entries ?? []);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    };

    void fetchData();
    const interval = setInterval(() => void fetchData(), 5000);
    return () => clearInterval(interval);
  }, [adminKey]);

  if (!adminKey) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="container mx-auto py-12 max-w-md">
          <h1 className="text-2xl font-pixel-sans mb-4">PROBANT Dashboard — Admin Access</h1>
          <input
            type="password"
            placeholder="APOHARA_ADMIN_KEY"
            className="w-full p-2 border border-border bg-card text-foreground rounded"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value;
                localStorage.setItem("apohara_admin_key", val);
                setAdminKey(val);
              }
            }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Press Enter to set. Stored in localStorage. To revoke: clear browser storage.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const counts = entries.reduce(
    (acc, e) => {
      acc[e.verdict] = (acc[e.verdict] ?? 0) + 1;
      return acc;
    },
    { verified: 0, risky: 0, blocked: 0 } as Record<string, number>,
  );
  const total = entries.length || 1;

  return (
    <DashboardLayout title="Dashboard">
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-pixel-sans mb-6">PROBANT Dashboard</h1>

        {error && (
          <div className="p-4 bg-destructive text-destructive-foreground rounded mb-4 font-mono text-sm">
            Error: {error}
          </div>
        )}

        {/* SOAR metric tiles from /v1/soar/metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricTile
            label="DJL rules loaded"
            value={tiles.djl_rules !== null ? String(tiles.djl_rules) : null}
            unit="rules"
            highlight={tiles.djl_rules !== null}
          />
          <MetricTile
            label="Incident types"
            value={tiles.incident_types !== null ? String(tiles.incident_types) : null}
            unit="codes"
          />
          <MetricTile
            label="Industry templates"
            value={tiles.templates !== null ? String(tiles.templates) : null}
            unit="tpl"
          />
          <MetricTile
            label="Mythos slot"
            value={tiles.mythos_slot}
          />
        </div>

        {/* Verdict trend bar */}
        <div className="mb-8">
          <h2 className="text-xl mb-2">
            Verdict distribution{" "}
            <span className="text-muted-foreground text-base font-normal">
              (last {entries.length})
            </span>
          </h2>
          <div className="flex h-8 w-full rounded overflow-hidden border border-border">
            <div
              className="bg-primary transition-all"
              style={{ width: `${(counts.verified / total) * 100}%` }}
              title={`verified: ${counts.verified}`}
            />
            <div
              className="bg-yellow-600 transition-all"
              style={{ width: `${(counts.risky / total) * 100}%` }}
              title={`risky: ${counts.risky}`}
            />
            <div
              className="bg-destructive transition-all"
              style={{ width: `${(counts.blocked / total) * 100}%` }}
              title={`blocked: ${counts.blocked}`}
            />
          </div>
          <div className="flex gap-4 mt-2 text-sm font-mono">
            <span className="text-primary">● verified {counts.verified}</span>
            <span className="text-yellow-600">● risky {counts.risky}</span>
            <span className="text-destructive">● blocked {counts.blocked}</span>
          </div>
        </div>

        {/* Verdict trend over time */}
        <div className="mb-8">
          <h2 className="text-xl mb-2">
            Verdict trend{" "}
            <span className="text-muted-foreground text-base font-normal">
              (5-min buckets, UTC)
            </span>
          </h2>
          <div className="border border-border rounded p-3 bg-card">
            <VerdictTrendChart entries={entries} />
          </div>
          <div className="flex gap-4 mt-2 text-sm font-mono">
            <span style={{ color: "#22c55e" }}>● verified</span>
            <span style={{ color: "#ca8a04" }}>● risky</span>
            <span style={{ color: "#ef4444" }}>● blocked</span>
          </div>
        </div>

        {/* What's new callout */}
        <div
          className="mb-8 p-4 rounded border"
          style={{
            borderColor: "var(--apohara-lime)",
            backgroundColor: "rgba(37,177,63,0.06)",
          }}
        >
          <p
            className="font-pixel-sans text-[10px] mb-1"
            style={{ color: "var(--apohara-lime)" }}
          >
            WHAT&apos;S NEW IN THIS BUILD
          </p>
          <p className="font-mono text-xs" style={{ color: "var(--apohara-bone)", opacity: 0.7 }}>
            PROBANT Fusion Sprint: 6 Tier-1 dashboard sections now live.
            Mythos/Glasswing reserved slot active.{" "}
            <a
              href="https://github.com/SuarezPM/apohara-probant/blob/main/MYTHOS_READY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--apohara-lime)" }}
            >
              Read MYTHOS_READY.md ↗
            </a>
          </p>
        </div>

        {/* Recent verdicts table */}
        <h2 className="text-xl mb-2">Recent verdicts</h2>
        {entries.length === 0 ? (
          <p className="text-muted-foreground font-mono text-sm">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-2">Time (UTC)</th>
                  <th className="p-2">Verdict</th>
                  <th className="p-2">Attackers</th>
                  <th className="p-2">Latency</th>
                  <th className="p-2">Signed hash</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.signed_hash} className="border-b border-border/40 hover:bg-card/60">
                    <td className="p-2 text-muted-foreground">
                      {new Date(e.ts * 1000).toISOString().slice(11, 19)}
                    </td>
                    <td
                      className={`p-2 font-semibold ${
                        e.verdict === "verified"
                          ? "text-primary"
                          : e.verdict === "risky"
                            ? "text-yellow-600"
                            : "text-destructive"
                      }`}
                    >
                      {e.verdict}
                    </td>
                    <td className="p-2">{e.attackers.length}</td>
                    <td className="p-2">{e.latency_ms.toFixed(0)}ms</td>
                    <td className="p-2 text-muted-foreground" title={e.signed_hash}>
                      {e.signed_hash.slice(0, 16)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
