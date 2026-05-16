# AUDIT.md — Apohara Inti

Public accountability log. Every entry traces a claim to file:line evidence.
Status legend: 🟢 closed / 🟡 in progress / 🟠 partial / 🔴 open.

---

## 1. 🟢 Repo bootstrap (2026-05-16, Day-6 US-005)

Initial scaffold of `github.com/SuarezPM/apohara-inti`, the unified product
fusing apohara-aegis (security plane) and apohara-context-forge (memory plane)
under one cross-AI verification pitch.

### (a) Pitch sentence committed verbatim

The hero subtitle is the elected pitch sentence, identical character-for-character
to the PRD-approved phrasing:

> A different AI reviews the code your AI just wrote, while your agent memory stays isolated.

Evidence: `README.md:3`.

### (b) Dependency strategy — git-installable from main

Backend depends on the two Apohara repos via PEP-508 git URLs pinned to `main`:

- `apohara-aegis @ git+https://github.com/SuarezPM/apohara-aegis.git@main`
- `apohara-context-forge @ git+https://github.com/SuarezPM/Apohara_Context_Forge.git@main`

Evidence: `packages/backend/pyproject.toml:11-12`.

Rationale: both upstream repos are pre-PyPI; pinning to `main` lets US-006/US-007
develop against tip while we cut a PyPI release later in the sprint.

### (c) Absent dependencies (installed by later stories)

- `npm install` for `packages/frontend/` — deferred to **US-007** (Tauri + React UI).
- `pip install -e packages/backend/[dev]` — deferred to **US-006** (FastAPI `/verify` endpoint).
- Rust toolchain + `cargo tauri init` — deferred to US-007.

Nothing in this bootstrap commit imports a third-party library at runtime;
`packages/backend/main.py:1-2` is a 2-line FastAPI stub and runs nothing.

### (d) README scaffold sections

Five sections, total under 300 words:

1. Hero title + pitch subtitle quote — `README.md:1-8`.
2. Sanity check (6 questions, one-line answers) — `README.md:14-19`.
3. Install placeholder — `README.md:23-25`.
4. Coming soon (US-006, US-007, US-008, US-011, featured integration) — `README.md:29-35`.
5. License — `README.md:39-41`.

Heavier content (comparison table, BENCHMARKS section, ContextForge featured
narrative) is deferred to US-008 and US-011 per PRD scope ordering.
