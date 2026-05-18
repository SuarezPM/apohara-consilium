import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";

interface Framework {
  name: string;
  version: string;
  description: string;
  control_count: number;
  source_url: string;
}

interface ControlMapping {
  control_id: string;
  control_name: string;
  status: string;
  evidence?: string;
}

interface ReportResult {
  framework_name: string;
  incident_code: string;
  mappings: ControlMapping[];
  generated_at?: string;
}

const DEMO_INCIDENT_CODE = "AGT-PI-001";

export function CompliancePage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, ReportResult | "loading" | string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/compliance/frameworks`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!resp.ok) {
          setError(`HTTP ${resp.status} from /v1/soar/compliance/frameworks`);
          return;
        }
        const data = (await resp.json()) as Framework[];
        setFrameworks(data);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const fetchReport = async (fw: Framework) => {
    const key = fw.name;
    if (expanded === key) {
      setExpanded(null);
      return;
    }
    setExpanded(key);
    if (reports[key]) return; // already fetched

    setReports((prev) => ({ ...prev, [key]: "loading" }));
    try {
      const resp = await fetch(`${BASE}/v1/soar/compliance/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident_code: DEMO_INCIDENT_CODE,
          framework_names: [fw.name],
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        setReports((prev) => ({ ...prev, [key]: `HTTP ${resp.status}: ${txt}` }));
        return;
      }
      const data = (await resp.json()) as ReportResult;
      setReports((prev) => ({ ...prev, [key]: data }));
    } catch (e) {
      setReports((prev) => ({ ...prev, [key]: (e as Error).message }));
    }
  };

  return (
    <DashboardLayout title="Compliance">
      <div className="p-6">
        <h2
          className="font-pixel-sans text-sm mb-1"
          style={{ color: "var(--apohara-bone)" }}
        >
          Compliance Frameworks
        </h2>
        <p className="font-mono text-xs mb-6" style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>
          GET /v1/soar/compliance/frameworks · click a card to pull a{" "}
          <span style={{ color: "var(--apohara-lime)" }}>{DEMO_INCIDENT_CODE}</span> mapping report
        </p>

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
            Loading frameworks…
          </p>
        )}

        {!loading && !error && frameworks.length === 0 && (
          <div
            className="p-6 rounded border text-center"
            style={{
              borderColor: "hsl(var(--border))",
              color: "var(--apohara-bone)",
              opacity: 0.5,
            }}
          >
            <p className="font-mono text-sm">No frameworks loaded — backend may be unreachable</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {frameworks.map((fw) => {
            const isExpanded = expanded === fw.name;
            const report = reports[fw.name];

            return (
              <div key={fw.name}>
                {/* Framework card */}
                <button
                  onClick={() => void fetchReport(fw)}
                  className="w-full text-left rounded border p-4 transition-colors cursor-pointer"
                  style={{
                    borderColor: isExpanded
                      ? "var(--apohara-lime)"
                      : "hsl(var(--border))",
                    backgroundColor: isExpanded
                      ? "rgba(37,177,63,0.06)"
                      : "var(--apohara-bg-raised)",
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
                        color: "var(--apohara-lime)",
                      }}
                    >
                      {fw.control_count} controls
                    </span>
                  </div>
                  <p
                    className="font-mono text-[10px] leading-relaxed mb-3"
                    style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                  >
                    {fw.description}
                  </p>
                  <a
                    href={fw.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] hover:underline"
                    style={{ color: "var(--apohara-lime)", opacity: 0.7 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗ source
                  </a>
                </button>

                {/* Inline report table */}
                {isExpanded && (
                  <div
                    className="rounded-b border border-t-0 p-4"
                    style={{
                      borderColor: "var(--apohara-lime)",
                      backgroundColor: "var(--apohara-bg-mid)",
                    }}
                  >
                    <p
                      className="font-mono text-[10px] mb-3"
                      style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
                    >
                      Control mapping for{" "}
                      <span style={{ color: "var(--apohara-lime)" }}>
                        {DEMO_INCIDENT_CODE}
                      </span>
                    </p>

                    {report === "loading" && (
                      <p
                        className="font-mono text-[10px]"
                        style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
                      >
                        Fetching report…
                      </p>
                    )}

                    {typeof report === "string" && report !== "loading" && (
                      <p
                        className="font-mono text-[10px]"
                        style={{ color: "var(--apohara-red)" }}
                      >
                        Error: {report}
                      </p>
                    )}

                    {report && typeof report === "object" && (
                      <>
                        {(!report.mappings || report.mappings.length === 0) ? (
                          <p
                            className="font-mono text-[10px]"
                            style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
                          >
                            No control mappings returned for this incident code.
                          </p>
                        ) : (
                          <table className="w-full text-[10px] font-mono">
                            <thead>
                              <tr
                                style={{
                                  borderBottom: "1px solid hsl(var(--border) / 0.4)",
                                  color: "var(--apohara-bone)",
                                  opacity: 0.5,
                                }}
                              >
                                <th className="text-left pb-1.5 pr-3 font-normal">Control ID</th>
                                <th className="text-left pb-1.5 pr-3 font-normal">Name</th>
                                <th className="text-left pb-1.5 font-normal">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.mappings.map((m) => (
                                <tr
                                  key={m.control_id}
                                  style={{ borderBottom: "1px solid hsl(var(--border) / 0.2)" }}
                                >
                                  <td
                                    className="py-1.5 pr-3"
                                    style={{ color: "var(--apohara-lime)" }}
                                  >
                                    {m.control_id}
                                  </td>
                                  <td
                                    className="py-1.5 pr-3"
                                    style={{ color: "var(--apohara-bone)", opacity: 0.7 }}
                                  >
                                    {m.control_name}
                                  </td>
                                  <td
                                    className="py-1.5"
                                    style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                                  >
                                    {m.status}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
