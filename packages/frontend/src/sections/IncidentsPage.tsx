import { DashboardLayout } from "./DashboardLayout";

export function IncidentsPage() {
  return (
    <DashboardLayout title="Incidents">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-1 view (US-82 will fill in). Backend: GET /v1/soar/incidents/types + /v1/soar/incidents/recent
        </p>
      </div>
    </DashboardLayout>
  );
}
