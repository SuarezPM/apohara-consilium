import { useRef, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

const BASE = "https://api.apohara.dev";

type Layer = "djl" | "llm" | "both";
type Decision = "ALLOW" | "REVIEW" | "BLOCK";

interface EvalResult {
  decision: Decision;
  decision_reason: string;
  djl_verdict: {
    decision: string;
    matched_rules: string[];
    latency_ms: number;
  };
  llm_verdict: {
    decision: string;
    vendor_votes: Record<string, string>;
    latency_ms: number;
  } | null;
  total_latency_ms: number;
}

interface HistoryEntry {
  id: number;
  prompt: string;
  layer: Layer;
  result: EvalResult;
  ts: Date;
}

function decisionColor(d: string): string {
  if (d === "ALLOW") return "var(--apohara-lime)";
  if (d === "BLOCK") return "var(--apohara-red)";
  return "#b45309";
}

function DecisionBadge({ decision, size = "sm" }: { decision: string; size?: "sm" | "lg" }) {
  const color = decisionColor(decision);
  const textSize = size === "lg" ? "text-base" : "text-[10px]";
  const padding = size === "lg" ? "px-4 py-1.5" : "px-2 py-0.5";
  return (
    <span
      className={`font-pixel-sans ${textSize} ${padding} rounded`}
      style={{
        color,
        backgroundColor: `${color}22`,
        border: `1px solid ${color}55`,
      }}
    >
      {decision}
    </span>
  );
}

export function JudgeLayerPage() {
  const [prompt, setPrompt] = useState("");
  const [layer, setLayer] = useState<Layer>("both");
  const [contextJson, setContextJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const idRef = useRef(0);

  const evaluate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    let parsedContext: Record<string, unknown> | undefined;
    if (contextJson.trim()) {
      try {
        parsedContext = JSON.parse(contextJson) as Record<string, unknown>;
      } catch {
        setError("Context JSON is invalid — fix or clear it before evaluating.");
        setLoading(false);
        return;
      }
    }

    try {
      const resp = await fetch(`${BASE}/v1/soar/judge/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), layer, context: parsedContext }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        setError(`HTTP ${resp.status}: ${txt}`);
        return;
      }
      const data = (await resp.json()) as EvalResult;
      setResult(data);
      setHistory((prev) => [
        { id: ++idRef.current, prompt: prompt.slice(0, 80), layer, result: data, ts: new Date() },
        ...prev.slice(0, 4),
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Judge Layer">
      <div className="p-6 max-w-5xl">
        <h2
          className="font-pixel-sans text-sm mb-1"
          style={{ color: "var(--apohara-bone)" }}
        >
          Judge Evaluate
        </h2>
        <p className="font-mono text-xs mb-6" style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>
          POST /v1/soar/judge/evaluate · DJL deterministic + optional LLM ensemble
        </p>

        {/* Input form */}
        <div
          className="rounded border p-4 mb-6"
          style={{
            borderColor: "hsl(var(--border))",
            backgroundColor: "var(--apohara-bg-raised)",
          }}
        >
          <label
            className="block font-mono text-xs mb-1"
            style={{ color: "var(--apohara-bone)", opacity: 0.7 }}
          >
            Prompt (max 10,000 chars)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={10000}
            rows={5}
            placeholder="Enter agent prompt to evaluate…"
            className="w-full rounded border bg-transparent font-mono text-xs p-2 resize-none outline-none"
            style={{
              borderColor: "hsl(var(--border))",
              color: "var(--apohara-bone)",
            }}
          />
          <div className="flex items-end gap-4 mt-3 flex-wrap">
            <div>
              <label
                className="block font-mono text-[10px] mb-1"
                style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
              >
                Layer
              </label>
              <select
                value={layer}
                onChange={(e) => setLayer(e.target.value as Layer)}
                className="font-mono text-xs rounded border bg-transparent px-2 py-1 outline-none cursor-pointer"
                style={{
                  borderColor: "hsl(var(--border))",
                  color: "var(--apohara-bone)",
                  backgroundColor: "var(--apohara-bg-mid)",
                }}
              >
                <option value="both">both (DJL + LLM)</option>
                <option value="djl">djl only</option>
                <option value="llm">llm only</option>
              </select>
            </div>

            <div className="flex-1 min-w-0">
              <label
                className="block font-mono text-[10px] mb-1"
                style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
              >
                Context JSON (optional)
              </label>
              <input
                type="text"
                value={contextJson}
                onChange={(e) => setContextJson(e.target.value)}
                placeholder='{"agent_id": "fx-trader"}'
                className="w-full rounded border bg-transparent font-mono text-xs px-2 py-1 outline-none"
                style={{
                  borderColor: "hsl(var(--border))",
                  color: "var(--apohara-bone)",
                }}
              />
            </div>

            <button
              onClick={() => void evaluate()}
              disabled={loading || !prompt.trim()}
              className="font-pixel-sans text-[10px] px-4 py-2 rounded transition-colors disabled:opacity-40"
              style={{
                backgroundColor: "var(--apohara-lime)",
                color: "var(--apohara-ink)",
              }}
            >
              {loading ? "Evaluating…" : "Evaluate"}
            </button>
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

        {/* Result panel */}
        {result && (
          <div className="mb-6">
            {/* Combined decision banner */}
            <div
              className="rounded border p-4 mb-4 flex items-center gap-4"
              style={{
                borderColor: decisionColor(result.decision) + "55",
                backgroundColor: decisionColor(result.decision) + "11",
              }}
            >
              <DecisionBadge decision={result.decision} size="lg" />
              <div>
                <p
                  className="font-mono text-xs"
                  style={{ color: "var(--apohara-bone)" }}
                >
                  {result.decision_reason}
                </p>
                <p
                  className="font-mono text-[10px]"
                  style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
                >
                  total latency: {result.total_latency_ms.toFixed(1)}ms
                </p>
              </div>
            </div>

            {/* Side-by-side panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DJL panel */}
              <div
                className="rounded border p-4"
                style={{
                  borderColor: "hsl(var(--border))",
                  backgroundColor: "var(--apohara-bg-raised)",
                }}
              >
                <p
                  className="font-pixel-sans text-[9px] mb-3"
                  style={{ color: "var(--apohara-lime)" }}
                >
                  DJL LAYER
                </p>
                <div className="mb-2">
                  <DecisionBadge decision={result.djl_verdict.decision} />
                </div>
                <p
                  className="font-mono text-[10px] mb-2"
                  style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
                >
                  latency: {result.djl_verdict.latency_ms.toFixed(1)}ms
                </p>
                {result.djl_verdict.matched_rules.length > 0 ? (
                  <div>
                    <p
                      className="font-mono text-[10px] mb-1"
                      style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                    >
                      Matched rules:
                    </p>
                    <ul className="space-y-0.5">
                      {result.djl_verdict.matched_rules.map((r) => (
                        <li key={r}>
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--apohara-bg-mid)",
                              color: "var(--apohara-bone)",
                              opacity: 0.8,
                            }}
                          >
                            {r}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p
                    className="font-mono text-[10px]"
                    style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
                  >
                    No rules matched
                  </p>
                )}
              </div>

              {/* LLM ensemble panel */}
              <div
                className="rounded border p-4"
                style={{
                  borderColor: "hsl(var(--border))",
                  backgroundColor: "var(--apohara-bg-raised)",
                }}
              >
                <p
                  className="font-pixel-sans text-[9px] mb-3"
                  style={{ color: "var(--apohara-lime)" }}
                >
                  LLM ENSEMBLE
                </p>
                {result.llm_verdict === null ? (
                  <p
                    className="font-mono text-[10px]"
                    style={{ color: "var(--apohara-bone)", opacity: 0.45 }}
                  >
                    Not active in this mode
                  </p>
                ) : (
                  <>
                    <div className="mb-2">
                      <DecisionBadge decision={result.llm_verdict.decision} />
                    </div>
                    <p
                      className="font-mono text-[10px] mb-3"
                      style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
                    >
                      latency: {result.llm_verdict.latency_ms.toFixed(1)}ms
                    </p>
                    {Object.keys(result.llm_verdict.vendor_votes).length > 0 ? (
                      <div>
                        <p
                          className="font-mono text-[10px] mb-1"
                          style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                        >
                          Vendor votes:
                        </p>
                        <table className="w-full text-[10px] font-mono">
                          <tbody>
                            {Object.entries(result.llm_verdict.vendor_votes).map(
                              ([vendor, vote]) => (
                                <tr key={vendor}>
                                  <td
                                    className="py-0.5 pr-2"
                                    style={{ color: "var(--apohara-bone)", opacity: 0.6 }}
                                  >
                                    {vendor}
                                  </td>
                                  <td>
                                    <span style={{ color: decisionColor(vote) }}>
                                      {vote}
                                    </span>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p
                        className="font-mono text-[10px]"
                        style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
                      >
                        No vendor votes recorded
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollback history */}
        {history.length > 0 && (
          <div>
            <h3
              className="font-pixel-sans text-[10px] mb-3"
              style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
            >
              LAST {history.length} EVALUATION{history.length > 1 ? "S" : ""}
            </h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="rounded border p-3 flex items-start gap-3"
                  style={{
                    borderColor: "hsl(var(--border) / 0.4)",
                    backgroundColor: "var(--apohara-bg-raised)",
                  }}
                >
                  <DecisionBadge decision={h.result.decision} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-mono text-[10px] truncate"
                      style={{ color: "var(--apohara-bone)" }}
                    >
                      {h.prompt}{h.prompt.length >= 80 ? "…" : ""}
                    </p>
                    <p
                      className="font-mono text-[9px]"
                      style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
                    >
                      {h.layer} · {h.result.total_latency_ms.toFixed(1)}ms ·{" "}
                      {h.ts.toISOString().slice(11, 19)} UTC
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
