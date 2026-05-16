import { AlertTriangle, CheckCircle2, ExternalLink, XOctagon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Verdict, VerdictResponse } from "@/lib/types";

const COPY: Record<
  Verdict,
  { title: string; emoji: string; subtitle: (count: number) => string }
> = {
  verified: {
    title: "Verified",
    emoji: "✅",
    subtitle: (count) => `${count} of 9 attackers found issues — safe to merge.`,
  },
  risky: {
    title: "Risky",
    emoji: "⚠️",
    subtitle: (count) =>
      `${count} of 9 attackers found issues — human review recommended.`,
  },
  blocked: {
    title: "Blocked",
    emoji: "🔴",
    subtitle: (count) =>
      `${count} of 9 attackers found issues — do not merge.`,
  },
};

const STYLES: Record<Verdict, { border: string; tint: string; icon: string }> = {
  verified: {
    border: "border-plane-memory/50",
    tint: "bg-plane-memory/10",
    icon: "text-plane-memory",
  },
  risky: {
    border: "border-plane-defense/50",
    tint: "bg-plane-defense/10",
    icon: "text-plane-defense",
  },
  blocked: {
    border: "border-destructive/60",
    tint: "bg-destructive/10",
    icon: "text-destructive",
  },
};

const ICONS: Record<Verdict, typeof CheckCircle2> = {
  verified: CheckCircle2,
  risky: AlertTriangle,
  blocked: XOctagon,
};

export interface VerdictPanelProps {
  response: VerdictResponse;
}

export function VerdictPanel({ response }: VerdictPanelProps) {
  const copy = COPY[response.verdict];
  const styles = STYLES[response.verdict];
  const Icon = ICONS[response.verdict];

  return (
    <Card className={cn(styles.border, styles.tint)}>
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Icon
          className={cn("h-8 w-8 shrink-0 mt-0.5", styles.icon)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <CardTitle className="flex items-baseline gap-2 text-xl">
            <span aria-hidden="true">{copy.emoji}</span>
            <span>{copy.title}</span>
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            {copy.subtitle(response.found_issue_count)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {response.reasoning_summary}
        </p>
        <a
          href={response.signed_audit_trail_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 text-sm font-medium",
            "text-primary hover:underline focus-visible:outline-none focus-visible:underline",
          )}
        >
          View signed audit trail
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}
