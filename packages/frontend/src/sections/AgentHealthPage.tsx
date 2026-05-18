import { DashboardLayout } from "./DashboardLayout";

export function AgentHealthPage() {
  return (
    <DashboardLayout title="Agent Health">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-1 view (US-82 will fill in). Backend: GET /v1/soar/healthz + /v1/soar/metrics
        </p>
      </div>
    </DashboardLayout>
  );
}
