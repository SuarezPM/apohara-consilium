<!-- SPDX-License-Identifier: Apache-2.0 -->
# Evidence Pack — Apohara PROBANT (Project Glasswing application)

> Anthropic reviewers: every claim below is verifiable in under 5
> minutes via the URLs and commit hashes provided. Latency numbers
> trace to committed JSON logs; test counts to file paths;
> infrastructure claims to live smoke endpoints.

---

## 1. Public URLs (live, smoke 2026-05-18T22:14Z)

| URL | Purpose | Last verified |
|-----|---------|---------------|
| <https://www.apohara.dev> | Dashboard + BYOK demo landing (HTTP/2 200, Vercel `dpl_ADPvhhCVGwVQBCREEf77hrbETRug`) | 2026-05-18T22:14Z |
| <https://apohara.dev> | Apex (308 → `www.apohara.dev`, Vercel default) | 2026-05-18T22:14Z |
| <https://api.apohara.dev/v1/soar/healthz> | Fusion Sprint Tier-1 health (`{djl_rules_loaded: 62, incident_codes_loaded: 16, industry_templates_loaded: 6, nist_controls_loaded: 35, compliance_frameworks_loaded: 6, mythos_slot: {enabled: false, reserved: true, status: "pending_glasswing_application"}}`) | 2026-05-18T22:09Z |
| <https://api.apohara.dev/v1/soar/judge/evaluate> | Dual-layer DJL+LLM evaluate (DJL BLOCK on "ignore all previous instructions" in 0.077 ms via `DJL-PI-001`) | 2026-05-18T22:09Z |
| <https://api.apohara.dev/v1/soar/mythos/status> | Boundary text contract surface | 2026-05-18T22:09Z |
| <https://api.apohara.dev/health> | Legacy 12-vendor verifier (`version 0.1.0`, deps `aegis` + `contextforge` loaded — no regression) | 2026-05-18T22:14Z |

---

## 2. Source repositories (Apache-2.0 / AGPL where noted)

| Repo | Role | License |
|------|------|---------|
| [SuarezPM/apohara-probant](https://github.com/SuarezPM/apohara-probant) | Backend + frontend + submission surface | Apache-2.0 |
| [SuarezPM/apohara-aegis](https://github.com/SuarezPM/apohara-aegis) | 14-seat ensemble + DJL + SOAR pipeline + Mythos slot + SDK middleware | Apache-2.0 |
| [SuarezPM/Apohara_Context_Forge](https://github.com/SuarezPM/Apohara_Context_Forge) | INV-15 paper + Z3 proof + KV-cache coordination | Apache-2.0 |
| [SuarezPM/Apohara-Guard](https://github.com/SuarezPM/Apohara-Guard) | Runtime governance bridge | AGPL-3.0 |

---

## 3. Test counts and CI gates

| Surface | Count | Path |
|---------|-------|------|
| aegis fusion-test suite | 500 / 500 passing (1 skipped, pre-existing) | `apohara-aegis/tests/test_{djl_latency,djl_rules,soar_pipeline,soar_routes,verdict_combine,mythos_slot,ensemble,compliance,incident_taxonomy,industry_templates,nist_mapping,agent_health,simulator,stix_export}.py` |
| inti backend SOAR-route tests | 22 | `apohara-inti/packages/backend/tests/` (per CHANGELOG.md Tier-1) |
| Z3 INV-15 formal proof | UNSAT in 10.08 ms (MI300X) | `Apohara_Context_Forge/apohara_context_forge/safety/z3_inv15_proof.py`; paper §5 |
| STIX 2.1 export tests (Tier-2) | 5 | `apohara-aegis/tests/test_stix_export.py` |
| Honesty CI gate | exit 0 (4 rules) | `apohara-inti/scripts/check_honesty_fusion.sh` |
| Brand CI gate | exit 0 (14 forbidden teal hexes) | `apohara-inti/scripts/check_brand_fusion.sh` |

---

## 4. Latency claims and backing logs

| Claim | Measured | Budget | Log file |
|-------|---------:|-------:|----------|
| DJL p99 latency | 0.114 ms (AUDIT.md §12 headline; live JSON shows p99 0.0911 ms on most recent refresh) | 5 ms | [`apohara-aegis/logs/djl_latency.json`](https://github.com/SuarezPM/apohara-aegis/blob/main/logs/djl_latency.json) |
| DJL TPR / TNR | 1.000 / 1.000 | n/a | same |
| DJL Wilson 95% accuracy CI | [0.9962, 1.0000] on 124-prompt corpus × 1000 iters | n/a | same |
| SOAR lifecycle p99 (orchestration, LLM mocked to 10 ms) | 10.6 ms headline; live log p99 10.76 ms | 200 ms | [`apohara-aegis/logs/lifecycle_latency.json`](https://github.com/SuarezPM/apohara-aegis/blob/main/logs/lifecycle_latency.json) |
| INV-15 Z3 proof UNSAT | 10.08 ms on a single MI300X core | n/a | paper §5; cited in [`README.md`](../../README.md) line 251, [`SECURITY.md`](../../SECURITY.md) line 54 |

The lifecycle log includes a `framing_note` clarifying the LLM-call
mock; **real vendor latencies live in
`apohara-aegis/logs/baseline_aegis-ensemble-*.json`**. We do not
launder mocked numbers as production figures.

---

## 5. Key commits to crawl

| Commit | Repo | What landed |
|--------|------|-------------|
| AUDIT.md §12 (latest entry on `main`) | apohara-inti | Fusion Sprint Tier-1 evidence table, 16 stories, smoke logs |
| CHANGELOG.md `## [Unreleased]` | apohara-inti | Tier-1 surface delta (10 endpoints, dashboard, badge, brand gates, MYTHOS_READY.md) |
| `f7a712d` | apohara-aegis | `MythosAttackerAdapter` reserved slot (US-78) |
| `3d1b341` | apohara-inti | `MYTHOS_READY.md` + `docs/research/mythos-integration.md` + README badge (US-78) |
| `b60933a` | apohara-inti | FastAPI `/v1/soar/*` router (US-79) |
| `c3c78b8` | apohara-aegis | STIX 2.1 export (US-90) |
| `3d57667` | apohara-inti | `GET /v1/soar/incidents/{id}/stix` endpoint (US-90) |
| `baa9ae2` | apohara-aegis | SDK middleware: `apohara-langchain` + `apohara-crewai` under `integrations/` (US-91) |
| `f30326a` | apohara-aegis | `verdict_combine.combine()` safe-merge (US-77) |
| `cde6da4` | apohara-aegis | DJL implementation (US-72) |
| `1c37030` | apohara-aegis | 4-stage SOAR pipeline (US-73) |
| `7353a8c` | apohara-aegis | 5-framework compliance suite (US-76) |

---

## 6. Paper and DOI

- Paper: `paper/inv15_paper.pdf` v3.0, 12 references, MI300X-grounded
- Zenodo DOI: <https://doi.org/10.5281/zenodo.20114594>
- Formal result: ¬INV-15 is **UNSAT in 10.08 ms** (Z3, single MI300X core)
- Hardware label honesty: `"rocm-hip:6.2.41133:AMD Instinct MI300X VF"` (not `"cuda"`)

---

## 7. Honesty discipline (CI-enforced)

[`scripts/check_honesty_fusion.sh`](../../scripts/check_honesty_fusion.sh) runs four rules
on every commit (exit 0 as of inti `be0f60b`):

1. **Mythos boundary language** — bans the four access-claim
   phrases enumerated inside the gate script (kept out of literal
   text here so the rule does not trip itself); requires the
   verbatim `MYTHOS_READY.md` disclaimer to ship.
2. **First-implementation claims** must trace to
   `docs/research/prior-art-*.md`.
3. **Test-count consistency** — placeholder for the full Tier-2
   reconciliation between code, AUDIT, and CHANGELOG counts.
4. **Single-product naming** — enforces Pablo's directive (no
   secondary-version labels in user-facing docs).

[`scripts/check_brand_fusion.sh`](../../scripts/check_brand_fusion.sh)
blocks the 14-hex teal palette used by the competitor PLAYBOOK SOAR
(`#0EA5A0`, `#14B8A6`, `#0D9488`, etc.) across `packages/frontend`
and `packages/frontend-nextjs`. Both gates exit 0 as of the latest
commit on `main`.
