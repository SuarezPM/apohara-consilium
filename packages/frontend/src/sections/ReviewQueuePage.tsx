// SPDX-License-Identifier: Apache-2.0
// US-88 — Review Queue Page (Apohara PROBANT Fusion Sprint 2026-05-18)
// Left:  REVIEW-verdict incidents from /v1/soar/incidents/recent?limit=50&verdict=REVIEW
//        (falls back to client-side filter if query param unsupported)
// Right: Selected incident detail — rules, ensemble votes, override actions
//        Override: POST /v1/soar/incidents/{id}/override
//        Fallback: info banner + curl hint if endpoint returns 404/405
import { useEffect, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";
const POLL_MS = 30_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DJLRule {
  rule_id: string;
  description: string;
  severity: string;
}

interface VendorVote {
  vendor: string;
  model: string;
  verdict: string;
  reasoning: string;
}

interface IncidentDetail {
  id: string;
  ts: number;
  incident_code: string;
  severity: number;
  verdict: string;
  prompt_excerpt: string;
  prompt_full?: string;
  signed_hash: string;
  djl_rules?: DJLRule[];
  vendor_votes?: VendorVote[];
  combined_reason?: string;
}

// Shape returned by /v1/soar/incidents/recent
interface IncidentRecent {
  id?: string;
  ts: number;
  incident_code: string;
  severity: number;
  verdict: string;
  signed_hash: string;
  prompt?: string;
  combined_reason?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  return (
    d.toISOString().slice(0, 10) +
    " " +
    String(d.getUTCHours()).padStart(2, "0") +
    ":" +
    String(d.getUTCMinutes()).padStart(2, "0") +
    " UTC"
  );
}

function verdictBg(verdict: string): string {
  if (verdict === "BLOCK") return "rgba(184,38,42,0.15)";
  if (verdict === "ALLOW") return "rgba(37,177,63,0.15)";
  return "rgba(180,83,9,0.15)";
}

function verdictColor(verdict: string): string {
  if (verdict === "BLOCK") return "var(--apohara-red)";
  if (verdict === "ALLOW") return "var(--apohara-lime)";
  return "#b45309";
}

function VerdictBadge({ verdict }: { verdict: string }) {
  return (
    <span
      className="font-pixel-sans text-[10px] px-2 py-0.5 rounded"
      style={{
        backgroundColor: verdictBg(verdict),
        color: verdictColor(verdict),
      }}
    >
      {verdict}
    </span>
  );
}

// Build an IncidentDetail from a raw IncidentRecent entry
function toDetail(r: IncidentRecent): IncidentDetail {
  const id =
    r.id ?? r.signed_hash.slice(0, 12);
  return {
    id,
    ts: r.ts,
    incident_code: r.incident_code,
    severity: r.severity,
    verdict: r.verdict,
    prompt_excerpt: r.prompt ? r.prompt.slice(0, 80) : "(no prompt)",
    prompt_full: r.prompt,
    signed_hash: r.signed_hash,
    combined_reason: r.combined_reason,
  };
}

// ---------------------------------------------------------------------------
// Incident list item
// ---------------------------------------------------------------------------

function IncidentListItem({
  incident,
  selected,
  onSelect,
}: {
  incident: IncidentDetail;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded border p-3 transition-colors mb-2"
      style={{
        borderColor: selected
          ? "var(--apohara-lime)"
          : "hsl(var(--border) / 0.5)",
        backgroundColor: selected
          ? "rgba(37,177,63,0.06)"
          : "transparent",
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className="font-pixel-sans text-[9px] px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: "var(--apohara-bg-raised)",
            color: "var(--apohara-lime)",
          }}
        >
          {incident.incident_code}
        </span>
        <VerdictBadge verdict={incident.verdict} />
      </div>
      <p
        className="font-mono text-[10px] truncate mb-0.5"
        style={{ color: "var(--apohara-bone)", opacity: 0.8 }}
      >
        {incident.prompt_excerpt}
      </p>
      <p
        className="font-mono text-[9px]"
        style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
      >
        {fmtTimestamp(incident.ts)}
      </p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Override result banner
// ---------------------------------------------------------------------------

type OverrideState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; decision: string }
  | { status: "stub"; decision: string; curlHint: string }
  | { status: "error"; message: string };

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function DetailPanel({
  incident,
}: {
  incident: IncidentDetail;
}) {
  const [reviewNote, setReviewNote] = useState("");
  const [overrideState, setOverrideState] = useState<OverrideState>({
    status: "idle",
  });

  async function submitOverride(decision: "BLOCK" | "ALLOW") {
    setOverrideState({ status: "submitting" });
    const url = `${BASE}/v1/soar/incidents/${incident.id}/override`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewer_note: reviewNote }),
        signal: AbortSignal.timeout(8000),
      });

      if (resp.status === 404 || resp.status === 405) {
        setOverrideState({
          status: "stub",
          decision,
          curlHint: `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"decision":"${decision}","reviewer_note":"${reviewNote || "manual review"}"}'`,
        });
        return;
      }

      if (!resp.ok) {
        setOverrideState({
          status: "error",
          message: `HTTP ${resp.status} from override endpoint`,
        });
        return;
      }

      setOverrideState({ status: "success", decision });
    } catch (e) {
      const msg = (e as Error).message;
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("Load failed")
      ) {
        setOverrideState({
          status: "stub",
          decision,
          curlHint: `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"decision":"${decision}","reviewer_note":"${reviewNote || "manual review"}"}'`,
        });
      } else {
        setOverrideState({ status: "error", message: msg });
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded border p-4"
        style={{
          borderColor: "hsl(var(--border))",
          backgroundColor: "var(--apohara-bg-raised)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-pixel-sans text-[9px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--apohara-bg-mid)",
              color: "var(--apohara-lime)",
            }}
          >
            {incident.incident_code}
          </span>
          <VerdictBadge verdict={incident.verdict} />
          <span
            className="font-mono text-[10px] ml-auto"
            style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
          >
            {fmtTimestamp(incident.ts)}
          </span>
        </div>
        <p
          className="font-mono text-[9px]"
          style={{ color: "var(--apohara-bone)", opacity: 0.3 }}
        >
          ID: {incident.id} · hash: {incident.signed_hash.slice(0, 20)}…
        </p>
      </div>

      {/* Full prompt */}
      <div
        className="rounded border p-4"
        style={{
          borderColor: "hsl(var(--border))",
          backgroundColor: "var(--apohara-bg-raised)",
        }}
      >
        <p
          className="font-pixel-sans text-[10px] mb-2"
          style={{ color: "var(--apohara-lime)" }}
        >
          Full Prompt
        </p>
        <p
          className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-words"
          style={{ color: "var(--apohara-bone)", opacity: 0.8 }}
        >
          {incident.prompt_full ?? incident.prompt_excerpt}
        </p>
      </div>

      {/* DJL matched rules */}
      <div
        className="rounded border p-4"
        style={{
          borderColor: "hsl(var(--border))",
          backgroundColor: "var(--apohara-bg-raised)",
        }}
      >
        <p
          className="font-pixel-sans text-[10px] mb-2"
          style={{ color: "var(--apohara-lime)" }}
        >
          DJL Matched Rules
        </p>
        {incident.djl_rules && incident.djl_rules.length > 0 ? (
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid hsl(var(--border) / 0.4)",
                  color: "var(--apohara-bone)",
                  opacity: 0.5,
                }}
              >
                <th className="text-left pb-1.5 pr-3 font-normal">Rule ID</th>
                <th className="text-left pb-1.5 pr-3 font-normal">Description</th>
                <th className="text-left pb-1.5 font-normal">Severity</th>
              </tr>
            </thead>
            <tbody>
              {incident.djl_rules.map((r) => (
                <tr
                  key={r.rule_id}
                  style={{
                    borderBottom: "1px solid hsl(var(--border) / 0.2)",
                  }}
                >
                  <td className="py-1.5 pr-3">
                    <a
                      href={`https://github.com/SuarezPM/apohara-probant/blob/main/apohara_aegis/djl.py#:~:text=${encodeURIComponent(r.rule_id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: "var(--apohara-lime)" }}
                    >
                      {r.rule_id}
                    </a>
                  </td>
                  <td
                    className="py-1.5 pr-3"
                    style={{ color: "var(--apohara-bone)", opacity: 0.7 }}
                  >
                    {r.description}
                  </td>
                  <td
                    className="py-1.5"
                    style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                  >
                    {r.severity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p
            className="font-mono text-[10px]"
            style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
          >
            Rule detail not returned by this endpoint.{" "}
            <a
              href="https://github.com/SuarezPM/apohara-probant/blob/main/apohara_aegis/djl.py"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--apohara-lime)" }}
            >
              Browse djl.py ↗
            </a>
          </p>
        )}
      </div>

      {/* LLM ensemble votes */}
      <div
        className="rounded border p-4"
        style={{
          borderColor: "hsl(var(--border))",
          backgroundColor: "var(--apohara-bg-raised)",
        }}
      >
        <p
          className="font-pixel-sans text-[10px] mb-2"
          style={{ color: "var(--apohara-lime)" }}
        >
          LLM Ensemble Vendor Votes
        </p>
        {incident.vendor_votes && incident.vendor_votes.length > 0 ? (
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid hsl(var(--border) / 0.4)",
                  color: "var(--apohara-bone)",
                  opacity: 0.5,
                }}
              >
                <th className="text-left pb-1.5 pr-3 font-normal">Vendor</th>
                <th className="text-left pb-1.5 pr-3 font-normal">Model</th>
                <th className="text-left pb-1.5 pr-3 font-normal">Verdict</th>
                <th className="text-left pb-1.5 font-normal">Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {incident.vendor_votes.map((v, i) => (
                <tr
                  key={`${v.vendor}-${i}`}
                  style={{
                    borderBottom: "1px solid hsl(var(--border) / 0.2)",
                  }}
                >
                  <td
                    className="py-1.5 pr-3"
                    style={{ color: "var(--apohara-lime)" }}
                  >
                    {v.vendor}
                  </td>
                  <td
                    className="py-1.5 pr-3"
                    style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                  >
                    {v.model}
                  </td>
                  <td className="py-1.5 pr-3">
                    <VerdictBadge verdict={v.verdict} />
                  </td>
                  <td
                    className="py-1.5 max-w-xs"
                    style={{
                      color: "var(--apohara-bone)",
                      opacity: 0.6,
                      wordBreak: "break-word",
                    }}
                  >
                    {v.reasoning.slice(0, 120)}
                    {v.reasoning.length > 120 ? "…" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            {incident.combined_reason ? (
              <p
                className="font-mono text-[10px] leading-relaxed"
                style={{ color: "var(--apohara-bone)", opacity: 0.7 }}
              >
                Combined reason: {incident.combined_reason}
              </p>
            ) : (
              <p
                className="font-mono text-[10px]"
                style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
              >
                Ensemble vote detail not returned by this endpoint. US-89.
              </p>
            )}
          </>
        )}
      </div>

      {/* Override actions */}
      <div
        className="rounded border p-4"
        style={{
          borderColor: "hsl(var(--border))",
          backgroundColor: "var(--apohara-bg-raised)",
        }}
      >
        <p
          className="font-pixel-sans text-[10px] mb-3"
          style={{ color: "var(--apohara-lime)" }}
        >
          Human Override
        </p>

        <textarea
          placeholder="Reviewer note (optional)…"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={2}
          className="w-full font-mono text-[10px] px-2 py-1.5 rounded border bg-transparent outline-none resize-none mb-3"
          style={{
            borderColor: "hsl(var(--border))",
            color: "var(--apohara-bone)",
          }}
        />

        <div className="flex gap-2">
          <button
            onClick={() => void submitOverride("BLOCK")}
            disabled={overrideState.status === "submitting"}
            className="flex-1 rounded py-2 font-pixel-sans text-[11px] transition-colors"
            style={{
              backgroundColor: "rgba(184,38,42,0.15)",
              color: "var(--apohara-red)",
              border: "1px solid var(--apohara-red)",
              opacity: overrideState.status === "submitting" ? 0.5 : 1,
              cursor:
                overrideState.status === "submitting"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Mark BLOCK
          </button>
          <button
            onClick={() => void submitOverride("ALLOW")}
            disabled={overrideState.status === "submitting"}
            className="flex-1 rounded py-2 font-pixel-sans text-[11px] transition-colors"
            style={{
              backgroundColor: "rgba(37,177,63,0.10)",
              color: "var(--apohara-lime)",
              border: "1px solid var(--apohara-lime)",
              opacity: overrideState.status === "submitting" ? 0.5 : 1,
              cursor:
                overrideState.status === "submitting"
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Mark ALLOW
          </button>
        </div>

        {/* Override result feedback */}
        {overrideState.status === "success" && (
          <div
            className="mt-3 px-3 py-2 rounded font-mono text-[10px]"
            style={{
              backgroundColor: "rgba(37,177,63,0.10)",
              color: "var(--apohara-lime)",
              border: "1px solid var(--apohara-lime)",
            }}
          >
            Override applied: {overrideState.decision}
          </div>
        )}

        {overrideState.status === "stub" && (
          <div
            className="mt-3 px-3 py-2 rounded font-mono text-[10px]"
            style={{
              backgroundColor: "rgba(180,83,9,0.10)",
              color: "#b45309",
              border: "1px solid rgba(180,83,9,0.4)",
            }}
          >
            Override endpoint pending — tracking US-89 / future.
            <br />
            Manual override via ledger:
            <code
              className="block mt-1 px-2 py-1.5 rounded whitespace-pre font-mono text-[9px]"
              style={{
                backgroundColor: "var(--apohara-dark)",
                color: "var(--apohara-bone)",
                overflowX: "auto",
              }}
            >
              {overrideState.curlHint}
            </code>
          </div>
        )}

        {overrideState.status === "error" && (
          <div
            className="mt-3 px-3 py-2 rounded font-mono text-[10px]"
            style={{
              backgroundColor: "rgba(184,38,42,0.15)",
              color: "var(--apohara-red)",
              border: "1px solid var(--apohara-red)",
            }}
          >
            Error: {overrideState.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function ReviewQueuePage() {
  const [incidents, setIncidents] = useState<IncidentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        // Try with verdict filter first; fall back to unfiltered client-side
        const url = `${BASE}/v1/soar/incidents/recent?limit=50&verdict=REVIEW`;
        const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!resp.ok) {
          setError(`HTTP ${resp.status} from /v1/soar/incidents/recent`);
          setLoading(false);
          return;
        }
        const data = (await resp.json()) as IncidentRecent[];
        const all = Array.isArray(data) ? data : [];

        // Client-side REVIEW filter (handles backends that ignore the query param)
        const reviewOnly = all.filter(
          (e) => e.verdict === "REVIEW" || e.verdict === "review",
        );

        setIncidents((reviewOnly.length > 0 ? reviewOnly : all).map(toDetail));
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void fetchIncidents();
    const id = setInterval(() => void fetchIncidents(), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const selectedIncident =
    selectedId !== null
      ? incidents.find((i) => i.id === selectedId) ?? null
      : null;

  return (
    <DashboardLayout title="Review Queue">
      <div className="p-6">
        <div className="mb-4">
          <h2
            className="font-pixel-sans text-sm mb-1"
            style={{ color: "var(--apohara-bone)" }}
          >
            Human Review Queue
          </h2>
          <p
            className="font-mono text-xs"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            REVIEW-verdict incidents ·{" "}
            <code>
              GET {BASE}/v1/soar/incidents/recent?limit=50&verdict=REVIEW
            </code>
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column — list */}
          <div>
            <p
              className="font-pixel-sans text-[10px] mb-3"
              style={{ color: "var(--apohara-lime)" }}
            >
              {loading
                ? "Loading…"
                : `${incidents.length} incident${incidents.length !== 1 ? "s" : ""} pending review`}
            </p>

            {!loading && incidents.length === 0 && !error && (
              <div
                className="p-6 rounded border text-center"
                style={{
                  borderColor: "hsl(var(--border))",
                  color: "var(--apohara-bone)",
                  opacity: 0.5,
                }}
              >
                <p className="font-mono text-sm">
                  No REVIEW-verdict incidents found.
                </p>
                <p className="font-mono text-xs mt-1 opacity-60">
                  Queue is clear or backend returned no REVIEW entries.
                </p>
              </div>
            )}

            {incidents.map((inc) => (
              <IncidentListItem
                key={inc.id}
                incident={inc}
                selected={selectedId === inc.id}
                onSelect={() =>
                  setSelectedId(selectedId === inc.id ? null : inc.id)
                }
              />
            ))}
          </div>

          {/* Right column — detail */}
          <div>
            {selectedIncident !== null ? (
              <DetailPanel incident={selectedIncident} />
            ) : (
              <div
                className="rounded border p-6 h-full flex items-center justify-center"
                style={{
                  borderColor: "hsl(var(--border) / 0.4)",
                  color: "var(--apohara-bone)",
                  opacity: 0.4,
                }}
              >
                <p className="font-mono text-xs text-center">
                  Select an incident to view detail
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
