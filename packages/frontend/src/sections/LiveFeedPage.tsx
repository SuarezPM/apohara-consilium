import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";
const POLL_MS = 5_000;

interface IncidentRecent {
  ts: number;
  incident_code: string;
  severity: number;
  verdict: string;
  signed_hash: string;
}

function verdictColor(verdict: string): string {
  if (verdict === "ALLOW") return "var(--apohara-lime)";
  if (verdict === "BLOCK") return "var(--apohara-red)";
  return "#b45309"; // REVIEW — amber
}

function codeCategory(code: string): string {
  const prefix = code.split("-").slice(0, 2).join("-");
  return prefix;
}

const CATEGORY_COLORS: Record<string, string> = {
  "AGT-PI":  "var(--apohara-lime)",
  "AGT-EXF": "var(--apohara-red)",
  "AGT-MIS": "#b45309",
  "AGT-FIN": "#a16207",
  "AGT-PII": "#9333ea",
  "AGT-GOV": "#2563eb",
};

function codeColor(code: string): string {
  const cat = codeCategory(code);
  return CATEGORY_COLORS[cat] ?? "var(--apohara-bone)";
}

function fmtTime(ts: number): string {
  const d = new Date(ts * 1000);
  return (
    String(d.getUTCHours()).padStart(2, "0") +
    ":" +
    String(d.getUTCMinutes()).padStart(2, "0") +
    ":" +
    String(d.getUTCSeconds()).padStart(2, "0") +
    " UTC"
  );
}

export function LiveFeedPage() {
  const [entries, setEntries] = useState<IncidentRecent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch(`${BASE}/v1/soar/incidents/recent?limit=50`, {
          signal: AbortSignal.timeout(6000),
        });
        if (!resp.ok) {
          setError(`HTTP ${resp.status}`);
          return;
        }
        const data = (await resp.json()) as IncidentRecent[];
        setEntries(data);
        setError(null);
        setLastPoll(new Date());
      } catch (e) {
        setError((e as Error).message);
      }
    };

    void poll();
    const id = setInterval(() => void poll(), POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <DashboardLayout title="Live Feed">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2
              className="font-pixel-sans text-sm mb-1"
              style={{ color: "var(--apohara-bone)" }}
            >
              DPI Live Feed
            </h2>
            <p className="font-mono text-xs" style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>
              Polling /v1/soar/incidents/recent every {POLL_MS / 1000}s
              {lastPoll && ` · last at ${lastPoll.toUTCString().slice(17, 25)} UTC`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--apohara-lime)" }}
            />
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--apohara-lime)" }}
            >
              LIVE
            </span>
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
            Poll error: {error}
          </div>
        )}

        <div
          ref={feedRef}
          className="rounded border overflow-y-auto"
          style={{
            borderColor: "hsl(var(--border))",
            backgroundColor: "var(--apohara-bg-raised)",
            height: "calc(100vh - 240px)",
            minHeight: "320px",
          }}
        >
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <span
                className="font-pixel-sans text-[10px] mb-3"
                style={{ color: "var(--apohara-lime)" }}
              >
                FEED READY
              </span>
              <p
                className="font-mono text-xs leading-relaxed"
                style={{ color: "var(--apohara-bone)", opacity: 0.6, maxWidth: "420px" }}
              >
                DPI Live Feed will populate once incident records flow.
                Backend stub returns empty list at this iteration.
              </p>
              <p
                className="font-mono text-[10px] mt-3"
                style={{ color: "var(--apohara-bone)", opacity: 0.35 }}
              >
                Polls every {POLL_MS / 1000}s · /v1/soar/incidents/recent?limit=50
              </p>
            </div>
          ) : (
            <div className="font-mono text-xs">
              {/* header row */}
              <div
                className="sticky top-0 flex gap-4 px-4 py-2 border-b text-[10px]"
                style={{
                  borderColor: "hsl(var(--border))",
                  backgroundColor: "var(--apohara-bg-mid)",
                  color: "var(--apohara-bone)",
                  opacity: 0.7,
                }}
              >
                <span className="w-28 shrink-0">Time (UTC)</span>
                <span className="w-28 shrink-0">Code</span>
                <span className="w-20 shrink-0">Verdict</span>
                <span className="flex-1">Signed Hash</span>
              </div>
              {/* entries — newest first */}
              {[...entries]
                .sort((a, b) => b.ts - a.ts)
                .map((e) => (
                  <div
                    key={e.signed_hash}
                    className="flex gap-4 px-4 py-2 border-b hover:bg-white/5 transition-colors"
                    style={{ borderColor: "hsl(var(--border) / 0.2)" }}
                  >
                    <span
                      className="w-28 shrink-0 tabular-nums"
                      style={{ color: "var(--apohara-bone)", opacity: 0.55 }}
                    >
                      {fmtTime(e.ts)}
                    </span>
                    <span className="w-28 shrink-0">
                      <span
                        className="font-pixel-sans text-[9px] px-1.5 py-0.5 rounded"
                        style={{
                          color: codeColor(e.incident_code),
                          backgroundColor: `${codeColor(e.incident_code)}22`,
                        }}
                      >
                        {e.incident_code}
                      </span>
                    </span>
                    <span className="w-20 shrink-0">
                      <span
                        className="font-semibold text-[10px]"
                        style={{ color: verdictColor(e.verdict) }}
                      >
                        {e.verdict}
                      </span>
                    </span>
                    <span
                      className="flex-1 tabular-nums truncate"
                      style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
                      title={e.signed_hash}
                    >
                      {e.signed_hash.slice(0, 20)}…
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
