import { FileCode, ShieldCheck, Swords } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: FileCode,
    title: "Submit",
    body: "Paste a PR URL, code diff, or natural-language task. BYOK Gemini key (free tier covers hundreds of runs) or the shared demo key (5/IP/day).",
  },
  {
    n: "02",
    icon: Swords,
    title: "12 attackers + INV-15",
    body: "Gemini writes a review. In parallel, 12 frontier vendors adversarially probe both inputs. Each attacker runs in an isolated KV-cache — formal invariant INV-15 enforced by Apohara ContextForge.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "SHA-256 verdict",
    body: "Aggregate harmful-count → verdict (verified / risky / blocked). Signed into an append-only ledger chain. Every verdict has a fetchable audit_id pointing at the exact attacker outputs.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-b border-border/40 py-16 lg:py-24" aria-labelledby="how-title">
      <div className="container max-w-6xl">
        <header className="max-w-2xl mb-12">
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 id="how-title" className="font-pixel-sans text-2xl lg:text-3xl text-foreground leading-tight">
            Write &rarr; attack &rarr; sign.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Three stages. No fluff. Every step is observable in the signed ledger.
          </p>
        </header>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative p-6 border border-border/40 bg-card rounded-md hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="font-pixel-sans text-3xl text-primary/80">{s.n}</span>
                <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-pixel-sans text-sm text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
