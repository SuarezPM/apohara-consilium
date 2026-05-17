import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { CodeInput } from "@/components/CodeInput";
import { AttackerGrid } from "@/components/AttackerGrid";
import { MemoryPlaneIndicator } from "@/components/MemoryPlaneIndicator";
import { VerdictPanel } from "@/components/VerdictPanel";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Button } from "@/components/ui/button";
import { verifyCode, verifyDemoCode } from "@/lib/api";
import type { VerdictResponse } from "@/lib/types";

export function TryItPanel() {
  const [apiKey, setApiKey] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorVariant, setErrorVariant] = useState<"destructive" | "info">("destructive");
  const [response, setResponse] = useState<VerdictResponse | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const canVerify = useMemo(
    () =>
      code.trim().length > 0 &&
      !isVerifying &&
      (demoMode || apiKey.trim().length > 0),
    [apiKey, code, isVerifying, demoMode],
  );

  const handleVerify = async () => {
    if (!canVerify) return;
    setError(null);
    setErrorVariant("destructive");
    setResponse(null);
    setIsVerifying(true);
    try {
      const result = demoMode
        ? await verifyDemoCode(code.trim())
        : await verifyCode({
            gemini_api_key: apiKey.trim(),
            code: code.trim(),
          });
      setResponse(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Check the backend is reachable and try again.";
      // 503 demo-unavailable + 429 demo-rate-limit are soft info-level
      const info = /demo mode unavailable|demo limit reached/i.test(message);
      setErrorVariant(info ? "info" : "destructive");
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section id="try" className="border-b border-border/40 py-16 lg:py-24" aria-labelledby="try-title">
      <div className="container max-w-6xl">
        <header className="max-w-2xl mb-10">
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
            Try it live
          </p>
          <h2 id="try-title" className="font-pixel-sans text-2xl lg:text-3xl text-foreground leading-tight">
            Paste code &rarr; verify in 30s.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Bring your own Gemini key or hit the shared demo key (5 calls/IP/UTC day).
            Backend lives at <code className="font-mono text-primary">api.apohara.dev</code>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ApiKeyInput
            value={apiKey}
            onChange={setApiKey}
            disabled={isVerifying}
            demoActive={demoMode}
            onToggleDemo={() => setDemoMode((prev) => !prev)}
          />
          <CodeInput value={code} onChange={setCode} disabled={isVerifying} />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <p className="text-xs text-muted-foreground max-w-xl">
            Gemini writes/audits. 9 frontier vendors adversarially attack. Apohara
            ContextForge enforces memory isolation (INV-15) between every plane.
          </p>
          <Button
            type="button"
            size="lg"
            disabled={!canVerify}
            onClick={handleVerify}
            variant="default"
            className="font-pixel-sans text-[11px] tracking-wider min-w-[180px]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Verify
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
              variant={errorVariant}
            />
          </div>
        )}

        <div className="space-y-6">
          <MemoryPlaneIndicator
            active={isVerifying}
            decision={response?.jcr_decision}
          />

          <div>
            <header className="flex items-baseline justify-between mb-3">
              <h3 className="font-pixel-sans text-sm text-foreground">Defense Plane &mdash; 9 attackers</h3>
              <p className="font-mono text-[10px] text-muted-foreground">
                {response
                  ? `${response.found_issue_count} of ${response.attacker_count} flagged an issue`
                  : "Awaiting verification"}
              </p>
            </header>
            <AttackerGrid results={response?.attackers} />
          </div>

          {response && <VerdictPanel response={response} />}
        </div>
      </div>
    </section>
  );
}
