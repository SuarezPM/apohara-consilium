import { DashboardLayout } from "./DashboardLayout";

export function CompliancePage() {
  return (
    <DashboardLayout title="Compliance">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-1 view (US-82 will fill in). Backend: GET /v1/soar/compliance/frameworks + /v1/soar/compliance/report
        </p>
      </div>
    </DashboardLayout>
  );
}
