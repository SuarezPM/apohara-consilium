import { DashboardLayout } from "./DashboardLayout";

interface AgentProfile {
  agent_id: string;
  health_score: number;
  lie_rate: number;
  incident_count: number;
  bypass_attempts: number;
  judge_decision_rate: number;
}

// Stub data — real telemetry feeds via /v1/soar/agents/{id}/profile (future sprint)
const DEMO_AGENTS: AgentProfile[] = [
  {
    agent_id: "fx-trader",
    health_score: 100,
    lie_rate: 0,
    incident_count: 0,
    bypass_attempts: 0,
    judge_decision_rate: 1.0,
  },
  {
    agent_id: "data-analyst",
    health_score: 100,
    lie_rate: 0,
    incident_count: 0,
    bypass_attempts: 0,
    judge_decision_rate: 1.0,
  },
  {
    agent_id: "support-bot",
    health_score: 100,
    lie_rate: 0,
    incident_count: 0,
    bypass_attempts: 0,
    judge_decision_rate: 1.0,
  },
];

function pct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

// Wilson score confidence interval for lie_rate (binary proportion)
// Returns [lower, upper] 95% CI
function wilsonCI(p: number, n: number): [number, number] {
  if (n === 0) return [0, 0];
  const z = 1.96; // 95%
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const halfWidth = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - halfWidth), Math.min(1, centre + halfWidth)];
}

function healthColor(score: number): string {
  if (score >= 90) return "var(--apohara-lime)";
  if (score >= 70) return "#b45309";
  return "var(--apohara-red)";
}

function AgentCard({ agent }: { agent: AgentProfile }) {
  const [lo, hi] = wilsonCI(agent.lie_rate, 1000);
  const color = healthColor(agent.health_score);

  return (
    <div
      className="rounded border p-5"
      style={{
        borderColor: "hsl(var(--border))",
        backgroundColor: "var(--apohara-bg-raised)",
      }}
    >
      {/* Agent ID */}
      <div className="flex items-center justify-between mb-4">
        <p
          className="font-pixel-sans text-[10px]"
          style={{ color: "var(--apohara-lime)" }}
        >
          {agent.agent_id}
        </p>
        <span
          className="font-mono text-[9px] px-2 py-0.5 rounded"
          style={{
            backgroundColor: "rgba(37,177,63,0.12)",
            color: "var(--apohara-lime)",
          }}
        >
          MONITORED
        </span>
      </div>

      {/* Health score — big number */}
      <div className="mb-4">
        <p
          className="font-mono text-[10px] mb-0.5"
          style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
        >
          health score
        </p>
        <p
          className="font-pixel-sans text-4xl leading-none"
          style={{ color }}
        >
          {agent.health_score}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
        <div>
          <p style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>lie rate</p>
          <p style={{ color: "var(--apohara-bone)" }}>
            {agent.lie_rate === 0 ? "0.000" : agent.lie_rate.toFixed(3)}
          </p>
          {agent.lie_rate === 0 ? (
            <p style={{ color: "var(--apohara-bone)", opacity: 0.3 }}>
              CI: [0.000, 0.004]
            </p>
          ) : (
            <p style={{ color: "var(--apohara-bone)", opacity: 0.3 }}>
              95% CI: [{lo.toFixed(3)}, {hi.toFixed(3)}]
            </p>
          )}
        </div>

        <div>
          <p style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>incidents</p>
          <p style={{ color: "var(--apohara-bone)" }}>{agent.incident_count}</p>
        </div>

        <div>
          <p style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>bypass attempts</p>
          <p style={{ color: "var(--apohara-bone)" }}>{agent.bypass_attempts}</p>
        </div>

        <div>
          <p style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>judge rate</p>
          <p style={{ color: "var(--apohara-bone)" }}>{pct(agent.judge_decision_rate)}</p>
        </div>
      </div>
    </div>
  );
}

export function AgentHealthPage() {
  return (
    <DashboardLayout title="Agent Health">
      <div className="p-6">
        <h2
          className="font-pixel-sans text-sm mb-1"
          style={{ color: "var(--apohara-bone)" }}
        >
          Agent Health Monitor
        </h2>
        <p className="font-mono text-xs mb-6" style={{ color: "var(--apohara-bone)", opacity: 0.5 }}>
          Simulator defaults · {DEMO_AGENTS.length} agents tracked
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {DEMO_AGENTS.map((agent) => (
            <AgentCard key={agent.agent_id} agent={agent} />
          ))}
        </div>

        {/* Telemetry stub notice */}
        <div
          className="rounded border p-4 font-mono text-[10px]"
          style={{
            borderColor: "hsl(var(--border) / 0.4)",
            backgroundColor: "var(--apohara-bg-raised)",
            color: "var(--apohara-bone)",
            opacity: 0.55,
          }}
        >
          Agent telemetry feeds will populate once /v1/soar/agents/&#123;id&#125;/profile endpoint ships.
          Currently stubbed with simulator defaults (health_score: 100, lie_rate: 0, incident_count: 0,
          bypass_attempts: 0, judge_decision_rate: 1.0).
        </div>
      </div>
    </DashboardLayout>
  );
}
