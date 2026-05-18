import { DashboardLayout } from "./DashboardLayout";

export function LiveFeedPage() {
  return (
    <DashboardLayout title="Live Feed">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-1 view (US-82 will fill in). Backend: GET /v1/soar/metrics + /v1/soar/judge/evaluate
        </p>
      </div>
    </DashboardLayout>
  );
}
