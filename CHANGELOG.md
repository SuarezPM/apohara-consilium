# Changelog — Apohara PROBANT

All notable changes documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/). Older day-by-day
measurements live in [`AUDIT.md`](AUDIT.md).

The companion library [`apohara-aegis`](https://github.com/SuarezPM/apohara-aegis)
keeps its own [`CHANGELOG.md`](https://github.com/SuarezPM/apohara-aegis/blob/main/CHANGELOG.md);
this file tracks the inti backend / frontend / submission surface only.

## [Unreleased]

### Added — Fusion Sprint Tier-1 (2026-05-18, US-69 → US-86)

- **SOAR HTTP surface** (`packages/backend/fastapi_soar_routes.py`,
  US-79): 10 endpoints under `/v1/soar/*`:
  - `GET /v1/soar/healthz` (counts: DJL rules / incident codes / templates / NIST controls / compliance frameworks / mythos slot reserved)
  - `GET /v1/soar/incidents/types` (16 incident codes — AGT-PI/EXF/MIS/FIN/PII/GOV)
  - `GET /v1/soar/incidents/recent?limit=N` (HMAC-chained ledger feed)
  - `POST /v1/soar/judge/evaluate` (DJL + LLM ensemble combine via US-77 verdict\_combine)
  - `GET /v1/soar/templates` and `GET /v1/soar/templates/{name}` (6 industry templates)
  - `GET /v1/soar/compliance/frameworks` (5 frameworks + OWASP LLM 2026 = 6)
  - `POST /v1/soar/compliance/report` (per-incident control mapping)
  - `GET /v1/soar/mythos/status` (Glasswing-pending boundary text)
  - `GET /v1/soar/metrics` (Prometheus text format, 6 gauges)
- **Dashboard layout shell** (US-81): `SidebarNav` + `DashboardLayout`
  + react-router-dom@7.15.1 + 11 page routes (`/dashboard`, `/incidents`,
  `/live-feed`, `/judge-layer`, `/compliance`, `/agent-health`,
  `/simulator`, `/policy-builder`, `/analytics`, `/review-queue`,
  `/settings`). Landing route `/` untouched.
- **Six Tier-1 dashboard sections** (US-82): `IncidentsPage` (16-type
  table with severity badges + category filters), `LiveFeedPage`
  (5 s scroll feed), `JudgeLayerPage` (dual-panel DJL+LLM evaluate +
  last-5 scrollback), `CompliancePage` (clickable framework cards
  with inline control mapping), `AgentHealthPage` (3-agent stub
  cards), and `Dashboard.tsx` extension with a 4-tile metrics panel
  parsing `/v1/soar/metrics` Prometheus output.
- **Mythos UI integration** (US-83): `MythosBadge.tsx` (lime border /
  ink background, hover tooltip, click-open modal fetching
  `/v1/soar/mythos/status`, keyboard nav + ARIA). Wired into
  `SidebarNav` bottom slot and `Hero` badge row.
- **Submission surface refresh** (US-83):
  - 4 paste-ready submission variants (`docs/submissions/{techex,milan}-aiweek-2026-submission.{9,12}vendor.md`)
    gain the MYTHOS-READY sentence inside the long-description; all
    four pass `scripts/check_submission_lengths.sh` (≤2000 chars).
  - `docs/submissions/JUDGE-FAQ.md` gains explicit Mythos Q&A
    (3-paragraph honest answer; cites `mythos_slot.py`, env-var gate,
    contract test, and `/v1/soar/mythos/status`).
  - `docs/submissions/PABLO-HANDOFF.md` Section 5: judge-facing
    talking-point bullets + boundary text path + cross-link to
    `docs/research/mythos-integration.md`.
- **Honesty discipline (4 new rules)** — `scripts/check_honesty_fusion.sh`:
  1. Mythos boundary language present and forbidden access-claim
     phrases absent.
  2. "First implementation" claims must trace to a `prior-art-*.md`.
  3. Test-count consistency (placeholder for Tier-2).
  4. No "v2" labels in user-facing docs (single-product directive).
- **Brand discipline** — `scripts/check_brand_fusion.sh` greps for
  the 10-hex PLAYBOOK SOAR teal palette and rejects any contamination.
- **Brand tokens source-of-truth** — `scripts/brand-tokens-source.json`
  pins lime `#25B13F`, dark `#2A2D3A`, bone `#EDEFF0`, ink `#0E1010`,
  red `#B8262A` (canonical post-US-FE-7c desaturation).
- **MYTHOS_READY.md** (new) — boundary text contract describing
  architectural readiness for Claude Mythos via Project Glasswing /
  Claude for Open Source program. Explicit "Apohara has NOT been
  granted Mythos access" disclaimer; no Anthropic endorsement claim.
- **README badge** — `🔱 Built for Claude Mythos · MYTHOS-READY architecture
  · [details](MYTHOS_READY.md)` in line 3.
- **Research docs** under `docs/research/`:
  `prior-art-nist-agentic-profile.md` (US-70),
  `incident-taxonomy.md` (US-74), `industry-templates.md` (US-75),
  `nist-mapping.md` (US-75), `compliance-suite.md` (US-76),
  `mythos-integration.md` (US-78).

### Changed

- `packages/frontend/src/components/MythosBadge.tsx`: switched from
  relative `/v1/soar/mythos/status` to absolute
  `https://api.apohara.dev/v1/soar/mythos/status` (Vercel SPA-rewrite
  catch-all would 404 the relative path). Matches the
  `const BASE = "https://api.apohara.dev"` convention used across
  the other US-82 sections.
- `packages/frontend/vercel.json`: `VITE_API_URL` flipped from the
  IP-based nip.io domain (149.28.56.91.nip.io) to `api.apohara.dev`
  per Pablo's "URL debe ser apohara.dev" directive. Same droplet,
  cleaner URL surface.
- `packages/frontend-nextjs/.gitignore`: expanded from `.vercel`-only
  (8 bytes) to a minimal Next.js stanza
  (`node_modules/`, `.next/`, `.vercel/`, `out/`, `dist/`, `*.log`,
  `.env*.local`) to stop `.next/` build artefacts leaking into
  `git status`.

### Verified live (smoke 2026-05-18T22:14Z)

- `https://www.apohara.dev` → HTTP/2 200 (Vercel deploy
  `dpl_ADPvhhCVGwVQBCREEf77hrbETRug`, aliased)
- `https://apohara.dev` → 308 → `www.apohara.dev` (Vercel apex default)
- `https://api.apohara.dev/v1/soar/healthz` →
  `{djl_rules_loaded: 62, incident_codes_loaded: 16, industry_templates_loaded: 6, nist_controls_loaded: 35, compliance_frameworks_loaded: 6, mythos_slot: {enabled: false, reserved: true, status: "pending_glasswing_application"}}`
- `https://api.apohara.dev/v1/soar/judge/evaluate` → DJL BLOCK on
  "ignore all previous instructions" in 0.077 ms via rule `DJL-PI-001`
- Legacy `/health` unchanged (version `0.1.0`, deps `aegis` +
  `contextforge` loaded) — zero regression on the existing 12-vendor
  LIVE production surface.

### Notes — not yet shipped (Tier-2 backlog)

Pablo's M5 Option C-prime decision allocates the remaining ~96 h of
the 5-day window to Tier-2 stretch goals before the Glasswing
application is filed:

- US-87 — Tier-2 views A: Simulator + Policy Builder
- US-88 — Tier-2 views B: Analytics + Review Queue + Settings
- US-89 — 1-click Compliance Report via Gemini
- US-90 — STIX 2.1 incident export
- US-91 — SDK middleware (LangChain + CrewAI)
- US-92 — Glasswing application package draft (timing: post-Tier-2
  complete, per Pablo's "esperamos a tier 2 completo como evidencia")
