import { WHY_THIS_MATTERS } from "@/lib/editorialCopy";

const PARAS = [
  WHY_THIS_MATTERS.multiVendor,
  WHY_THIS_MATTERS.inv15,
  WHY_THIS_MATTERS.multiHardware,
];

export function WhyThisMatters() {
  return (
    <section id="why" className="border-b border-border/40 py-16 lg:py-24" aria-labelledby="why-title">
      <div className="container max-w-4xl">
        <header className="mb-10">
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
            {WHY_THIS_MATTERS.eyebrow}
          </p>
          <h2 id="why-title" className="font-pixel-sans text-2xl lg:text-3xl text-foreground leading-tight">
            {WHY_THIS_MATTERS.title}
          </h2>
        </header>

        <div className="space-y-10">
          {PARAS.map((p) => (
            <article key={p.heading}>
              <h3 className="font-pixel-sans text-base text-foreground tracking-wide mb-3">
                {p.heading}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
