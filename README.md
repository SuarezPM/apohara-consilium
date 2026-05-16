# Apohara Inti

> A different AI reviews the code your AI just wrote, while your agent memory stays isolated.

Open-source defense-in-depth for AI-generated code. Gemini writes and audits the
code, then 9 frontier vendors adversarially attack the output before merge,
while [Apohara ContextForge](https://github.com/SuarezPM/Apohara_Context_Forge)
enforces `INV-15` memory isolation between the writer agent and every attacker.

---

## Sanity check

- **What is it?** — Cross-AI code reviewer where Gemini writes/audits and 9 frontier vendors adversarially attack the output before merge.
- **For whom?** — Engineering teams using AI-assisted code generation (Cursor, Claude Code, Cline, Copilot) who need pre-merge verification.
- **Why now?** — EU AI Act Article 14 fully applicable 2026-08-02 (78 days); OWASP LLM 2026 elevated Tool Poisoning to LLM02.
- **What does it replace?** — Single-AI self-review (Cursor /best-of-n is same-model parallel, not cross-vendor) and trust-the-LLM-output workflows.
- **Cost to use?** — Free OSS Apache-2.0; user provides 1 Gemini API key (BYOK); 9 attackers run on Apohara's pre-funded credit pool.
- **Next step after install?** — `apohara verify <github-pr-url>` returns signed JSON `verdict: verified|risky|blocked` with INV-15-verified ContextForge audit id.

---

## Install

Coming in US-006 / US-007. Not yet installable.

---

## Coming soon

- **US-006** — FastAPI backend with `/verify` endpoint, Gemini writer, 9-vendor attacker ensemble.
- **US-007** — Tauri + React desktop client with PR-URL verification UI.
- **US-008** — Side-by-side comparison vs Cursor /best-of-n, GitHub Copilot Reviews, and trust-only workflows.
- **US-011** — BENCHMARKS.md grounded in `logs/` evidence files.
- **Featured integration** — Apohara ContextForge audit ids on every verdict, surfacing INV-15 memory isolation between Gemini-writer and the 9 attackers.

---

## License

Apache-2.0. See [LICENSE](LICENSE).
