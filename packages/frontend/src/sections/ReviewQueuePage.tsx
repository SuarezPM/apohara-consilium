import { DashboardLayout } from "./DashboardLayout";

export function ReviewQueuePage() {
  return (
    <DashboardLayout title="Review Queue">
      <div className="p-6">
        <p className="text-muted-foreground font-mono text-sm">
          Tier-2 — Coming next sprint.
        </p>
      </div>
    </DashboardLayout>
  );
}
