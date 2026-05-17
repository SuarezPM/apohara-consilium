import { ExternalLink, ShieldCheck } from "lucide-react";
import { TIER_1, TIER_2, GRANITE } from "@/lib/competitorData";
import { COMPARISON_HEADER, COMPARISON_TIER2_NARRATIVE, COMPARISON_GRANITE_CALLOUT } from "@/lib/editorialCopy";
import { cn } from "@/lib/utils";

const COLS = [
  { key: "vendors" as const, label: "Vendors" },
  { key: "tests" as const, label: "Tests" },
  { key: "publicBenchmarks" as const, label: "Public benchmarks" },
  { key: "multiHardware" as const, label: "Multi-hardware" },
  { key: "formalInvariant" as const, label: "Formal invariant" },
  { key: "license" as const, label: "License" },
  { key: "cost" as const, label: "Cost" },
];

export function Comparison() {
  return (
    <section id="compare" className="border-b border-border/40 py-16 lg:py-24" aria-labelledby="compare-title">
      <div className="container max-w-6xl">
        <header className="max-w-3xl mb-10">
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
            {COMPARISON_HEADER.eyebrow}
          </p>
          <h2 id="compare-title" className="font-pixel-sans text-2xl lg:text-3xl text-foreground leading-tight">
            {COMPARISON_HEADER.title}
          </h2>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {COMPARISON_HEADER.narrative}
          </p>
        </header>

        {/* TIER 1 — Hackathon peers, full per-cell table */}
        <div className="mb-12">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
            Tier 1 &mdash; Hackathon peers (TechEx 2026 entries)
          </p>
          <div className="overflow-x-auto border border-border/40 rounded-md">
            <table className="w-full text-sm" role="table">
              <thead className="bg-card border-b border-border/40">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-card font-pixel-sans text-[10px] text-foreground text-left px-3 py-3 tracking-wider border-r border-border/40 min-w-[140px]"
                  >
                    Product
                  </th>
                  {COLS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="font-pixel-sans text-[10px] text-foreground text-left px-3 py-3 tracking-wider min-w-[140px]"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIER_1.map((row) => (
                  <tr
                    key={row.name}
                    className={cn(
                      "border-b border-border/40 last:border-b-0",
                      row.highlighted && "bg-primary/5",
                    )}
                  >
                    <th
                      scope="row"
                      className={cn(
                        "sticky left-0 z-10 px-3 py-3 text-left font-pixel-sans text-xs border-r border-border/40",
                        row.highlighted ? "bg-primary/10 text-primary" : "bg-background text-foreground",
                      )}
                    >
                      <a
                        href={row.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        {row.name}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </th>
                    {COLS.map((col) => {
                      const cell = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-3 align-top text-xs text-muted-foreground"
                          data-source={cell.source}
                        >
                          <span className={row.highlighted ? "text-foreground" : ""}>
                            {cell.value}
                          </span>
                          {cell.source && (
                            <span className="block mt-1 text-[10px] font-mono opacity-60 leading-snug">
                              {cell.source.length > 90 ? `${cell.source.slice(0, 90)}…` : cell.source}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GRANITE — Honest call-out */}
        <div className="mb-12 border border-primary/30 bg-primary/5 rounded-md p-6">
          <div className="flex items-start gap-3 mb-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-pixel-sans text-sm text-foreground tracking-wide">
                {COMPARISON_GRANITE_CALLOUT.title}
              </h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {COMPARISON_GRANITE_CALLOUT.body}
          </p>
          <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-background rounded border border-border/40">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase">Apohara</p>
              <p className="font-pixel-sans text-lg text-primary mt-1">{GRANITE.apohara}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase">Granite Guardian 4</p>
              <p className="font-pixel-sans text-lg text-muted-foreground mt-1">{GRANITE.granite}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {COMPARISON_GRANITE_CALLOUT.interpretation}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            Measurement:{" "}
            <a href={GRANITE.measurementUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              granite4_jbb_n80_20260516T164541Z.json
            </a>
            {" · "}
            <a href={GRANITE.auditUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              apohara-aegis AUDIT entry #23
            </a>
            {" (commit "}
            <code className="text-primary">{GRANITE.auditCommit}</code>
            {") · product: "}
            <a href={GRANITE.productLink.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {GRANITE.productLink.label}
            </a>
          </p>
        </div>

        {/* TIER 2 — Market context, narrative + chip list, no per-cell grading */}
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
            Tier 2 &mdash; Commercial market context
          </p>
          <div className="border border-border/40 bg-card rounded-md p-6">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {COMPARISON_TIER2_NARRATIVE}
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Commercial competitors">
              {TIER_2.map((v) => (
                <li key={v.name}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border/40 text-xs font-mono text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    {v.name}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
