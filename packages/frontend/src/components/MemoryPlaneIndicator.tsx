import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JCRDecision } from "@/lib/types";

/** Upstream Apohara Context Forge repo — JCRSafetyGate / INV-15 source of truth. */
const CONTEXTFORGE_REPO_URL = "https://github.com/SuarezPM/Apohara_Context_Forge";
const JCR_DECISION_SCHEMA_URL =
  "https://github.com/SuarezPM/Apohara_Context_Forge/blob/main/apohara_context_forge/safety/jcr_gate.py";

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
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-center justify-between space-y-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary",
              active && "animate-pulse-lime",
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
                ? "Live: enforcing INV-15 between Gemini writer and 12 attackers"
                : "Memory Isolation: ACTIVE — INV-15 enforced by ContextForge"}
            </p>
          </div>
        </div>
        <Badge variant="success" className="shrink-0">
          INV-15
        </Badge>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Each attacker runs in an isolated KV-cache. The Gemini judge's
          session cannot be poisoned.
        </p>

        {decision && (
          <div>
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
              title="Click to view full ContextForge audit id + JCR decision payload"
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
                    "bg-primary/15 text-primary",
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
              <div id="jcr-decision-detail" className="mt-2 space-y-2">
                <div className="rounded-md border bg-background/60 p-3 text-[11px] font-mono text-muted-foreground">
                  <div className="mb-2 text-[10px] uppercase tracking-wide text-foreground/70">
                    ContextForge audit id
                  </div>
                  <div className="break-all">{decision.audit_id}</div>
                </div>
                <pre className="overflow-x-auto rounded-md border bg-background/60 p-3 text-[11px] font-mono text-muted-foreground">
                  {JSON.stringify(decision, null, 2)}
                </pre>
                <a
                  href={JCR_DECISION_SCHEMA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium",
                    "text-primary hover:underline focus-visible:outline-none focus-visible:underline",
                  )}
                >
                  View JCRDecision schema
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}

        <a
          href={CONTEXTFORGE_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium",
            "text-muted-foreground hover:text-foreground hover:underline",
            "focus-visible:outline-none focus-visible:underline",
          )}
        >
          Powered by Apohara Context Forge
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
