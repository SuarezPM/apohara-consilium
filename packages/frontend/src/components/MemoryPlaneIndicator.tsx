import { useState } from "react";
import { ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JCRDecision } from "@/lib/types";

export interface MemoryPlaneIndicatorProps {
  /** True while a verification run is in flight; shows the green pulse. */
  active?: boolean;
  /** ContextForge JCR decision once the run lands. */
  decision?: JCRDecision;
}

export function MemoryPlaneIndicator({
  active,
  decision,
}: MemoryPlaneIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-plane-memory/30 bg-plane-memory/5">
      <CardHeader className="flex-row items-center justify-between space-y-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full bg-plane-memory/15 text-plane-memory",
              active && "animate-pulse-green",
            )}
            aria-hidden="true"
          >
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-none">
              Memory Plane — Powered by ContextForge
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {active
                ? "Live: enforcing INV-15 between Gemini writer and 9 attackers"
                : "Memory Isolation: ACTIVE — INV-15 enforced by ContextForge"}
            </p>
          </div>
        </div>
        <Badge variant="success" className="shrink-0">
          INV-15
        </Badge>
      </CardHeader>

      {decision && (
        <CardContent className="pt-0">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={cn(
              "group flex w-full items-center gap-1 rounded-md p-1 text-left",
              "text-xs font-mono text-muted-foreground hover:text-foreground transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-expanded={expanded}
            aria-controls="jcr-decision-detail"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span className="truncate">audit_id: {decision.audit_id}</span>
            <span
              className={cn(
                "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                decision.decision === "allow" &&
                  "bg-plane-memory/15 text-plane-memory",
                decision.decision === "review" &&
                  "bg-plane-defense/15 text-plane-defense",
                decision.decision === "deny" &&
                  "bg-destructive/15 text-destructive",
              )}
            >
              {decision.decision}
            </span>
          </button>
          {expanded && (
            <pre
              id="jcr-decision-detail"
              className="mt-2 overflow-x-auto rounded-md border bg-background/60 p-3 text-[11px] font-mono text-muted-foreground"
            >
              {JSON.stringify(decision, null, 2)}
            </pre>
          )}
        </CardContent>
      )}
    </Card>
  );
}
