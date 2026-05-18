import { DashboardLayout } from "./DashboardLayout";

export function SimulatorPage() {
  return (
    <DashboardLayout title="Simulator">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-2 — Coming next sprint.
        </p>
      </div>
    </DashboardLayout>
  );
}
