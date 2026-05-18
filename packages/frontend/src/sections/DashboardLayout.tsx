import { useEffect, useState } from "react";
import { SidebarNav } from "./SidebarNav";

const HEALTHZ_URL = "https://api.apohara.dev/v1/soar/healthz";
const POLL_INTERVAL_MS = 30_000;

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const [apiUp, setApiUp] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const resp = await fetch(HEALTHZ_URL, { method: "GET", signal: AbortSignal.timeout(5000) });
        if (!cancelled) setApiUp(resp.ok);
      } catch {
        if (!cancelled) setApiUp(false);
      }
    };

    void check();
    const id = setInterval(() => void check(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const dotColor =
    apiUp === null
      ? "var(--apohara-bone)"
      : apiUp
        ? "var(--apohara-lime)"
        : "var(--apohara-ink)";

  const statusLabel =
    apiUp === null ? "checking…" : apiUp ? "API live" : "API down";

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--apohara-bg-void)" }}
    >
      {/* Sidebar */}
      <SidebarNav />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-6 h-14 border-b border-border/40 shrink-0"
          style={{ backgroundColor: "var(--apohara-bg-mid)" }}
        >
          <h1 className="font-pixel-sans text-sm tracking-wide" style={{ color: "var(--apohara-bone)" }}>
            {title}
          </h1>

          {/* Live healthz indicator */}
          <div className="flex items-center gap-2 font-mono text-xs" style={{ color: "var(--apohara-bone)", opacity: 0.7 }}>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: dotColor }}
              aria-hidden="true"
            />
            <span>{statusLabel}</span>
          </div>
        </header>

        {/* Content area */}
        <main
          className="flex-1 overflow-auto"
          style={{ maxWidth: "1440px", width: "100%" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
