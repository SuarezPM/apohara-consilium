import { DashboardLayout } from "./DashboardLayout";

export function JudgeLayerPage() {
  return (
    <DashboardLayout title="Judge Layer">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-1 view (US-82 will fill in). Backend: POST /v1/soar/judge/evaluate + GET /v1/soar/templates
        </p>
      </div>
    </DashboardLayout>
  );
}
