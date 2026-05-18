import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";

interface IncidentType {
  code: string;
  name: string;
  severity: number;
  description: string;
  detection_signals: string[];
  default_djl_rule_ids: string[];
  default_compliance_refs: string[];
}

const CATEGORY_PREFIXES = ["AGT-PI", "AGT-EXF", "AGT-MIS", "AGT-FIN", "AGT-PII", "AGT-GOV"];

function severityColor(sev: number): string {
  if (sev >= 9) return "var(--apohara-red)";
  if (sev >= 7) return "#b45309";
  if (sev >= 5) return "#a16207";
  return "var(--apohara-lime)";
}

function severityLabel(sev: number): string {
  if (sev >= 9) return "CRITICAL";
  if (sev >= 7) return "HIGH";
  if (sev >= 5) return "MEDIUM";
  return "LOW";
}

export function IncidentsPage() {
  const [types, setTypes] = useState<IncidentType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/incidents/types`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) {
          setError(`HTTP ${resp.status} from /v1/soar/incidents/types`);
          return;
        }
        const data = (await resp.json()) as IncidentType[];
        setTypes(data);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return types;
    const q = filter.toUpperCase();
    return types.filter(
      (t) => t.code.includes(q) || t.name.toUpperCase().includes(q),
    );
  }, [types, filter]);

  return (
    <DashboardLayout title="Incidents">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2
              className="font-pixel-sans text-sm mb-1"
              style={{ color: "var(--apohara-bone)" }}
            >
              Incident Taxonomy
            </h2>
            <p className="font-mono text-xs" style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>
              {types.length} incident types loaded from /v1/soar/incidents/types
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_PREFIXES.map((prefix) => (
              <button
                key={prefix}
                onClick={() => setFilter(filter === prefix ? "" : prefix)}
                className="font-mono text-[10px] px-2 py-1 rounded border transition-colors"
                style={{
                  borderColor:
                    filter === prefix
                      ? "var(--apohara-lime)"
                      : "hsl(var(--border))",
                  color:
                    filter === prefix
                      ? "var(--apohara-lime)"
                      : "var(--apohara-bone)",
                  backgroundColor:
                    filter === prefix
                      ? "rgba(37,177,63,0.10)"
                      : "transparent",
                  opacity: filter === prefix ? 1 : 0.6,
                }}
              >
                {prefix}
              </button>
            ))}
            <input
              type="text"
              placeholder="filter codes…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="font-mono text-xs px-2 py-1 rounded border bg-transparent outline-none w-32"
              style={{
                borderColor: "hsl(var(--border))",
                color: "var(--apohara-bone)",
              }}
            />
          </div>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded font-mono text-xs"
            style={{
              backgroundColor: "rgba(184,38,42,0.15)",
              color: "var(--apohara-red)",
              border: "1px solid var(--apohara-red)",
            }}
          >
            Error: {error}
          </div>
        )}

        {loading && !error && (
          <p className="font-mono text-xs" style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>
            Loading incident types…
          </p>
        )}

        {!loading && !error && types.length === 0 && (
          <div
            className="p-6 rounded border text-center"
            style={{
              borderColor: "hsl(var(--border))",
              color: "var(--apohara-bone)",
              opacity: 0.5,
            }}
          >
            <p className="font-mono text-sm">
              No incidents loaded — backend may be unreachable
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono border-collapse">
              <thead>
                <tr
                  className="text-left text-xs"
                  style={{
                    borderBottom: "1px solid hsl(var(--border))",
                    color: "var(--apohara-bone)",
                    opacity: 0.6,
                  }}
                >
                  <th className="pb-2 pr-4 font-normal">Code</th>
                  <th className="pb-2 pr-4 font-normal">Name</th>
                  <th className="pb-2 pr-4 font-normal">Severity</th>
                  <th className="pb-2 pr-6 font-normal">Description</th>
                  <th className="pb-2 font-normal">Detection Signals</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.code}
                    className="border-b"
                    style={{
                      borderColor: "hsl(var(--border) / 0.3)",
                    }}
                  >
                    <td className="py-2.5 pr-4">
                      <span
                        className="font-pixel-sans text-[9px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--apohara-bg-raised)",
                          color: "var(--apohara-lime)",
                        }}
                      >
                        {t.code}
                      </span>
                    </td>
                    <td
                      className="py-2.5 pr-4 text-xs whitespace-nowrap"
                      style={{ color: "var(--apohara-bone)" }}
                    >
                      {t.name}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: severityColor(t.severity),
                          backgroundColor: `${severityColor(t.severity)}22`,
                        }}
                      >
                        {t.severity} · {severityLabel(t.severity)}
                      </span>
                    </td>
                    <td
                      className="py-2.5 pr-6 text-xs max-w-xs"
                      style={{ color: "var(--apohara-bone)", opacity: 0.7 }}
                    >
                      {t.description}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {t.detection_signals.slice(0, 3).map((sig) => (
                          <span
                            key={sig}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--apohara-bg-raised)",
                              color: "var(--apohara-bone)",
                              opacity: 0.7,
                            }}
                          >
                            {sig}
                          </span>
                        ))}
                        {t.detection_signals.length > 3 && (
                          <span
                            className="text-[9px] px-1 py-0.5"
                            style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
                          >
                            +{t.detection_signals.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && types.length > 0 && filtered.length === 0 && (
          <p
            className="font-mono text-xs mt-4"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            No incident types match &quot;{filter}&quot;
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
