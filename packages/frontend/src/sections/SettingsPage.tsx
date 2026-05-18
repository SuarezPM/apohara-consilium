import { DashboardLayout } from "./DashboardLayout";

export function SettingsPage() {
  return (
    <DashboardLayout title="Settings">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-2 — Coming next sprint.
        </p>
      </div>
    </DashboardLayout>
  );
}
