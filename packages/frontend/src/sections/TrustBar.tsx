const ATTACKERS = [
  "claude-opus-4.7",
  "gpt-5.5",
  "deepseek-v4-pro",
  "kimi-k2.6",
  "glm-5.1",
  "qwen3.6-plus",
  "nemotron-3-super-120b",
  "minimax-m2.7",
  "big-pickle",
];

export function TrustBar() {
  return (
    <section
      aria-label="9 vendor compatibility"
      className="border-b border-border/40 py-6 bg-card/30"
    >
      <div className="container max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest shrink-0">
            9 vendor ensemble &mdash;
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center sm:justify-start">
            {ATTACKERS.map((name) => (
              <li
                key={name}
                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
