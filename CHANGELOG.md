# Changelog — Apohara CONSILIUM

All notable CONSILIUM changes documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

For pre-CONSILIUM history (the [Apohara PROBANT](https://github.com/SuarezPM/apohara-probant) codebase this repo was derived from under Apache-2.0), see [`docs/README-probant-legacy.md`](docs/README-probant-legacy.md).

---

## [v0.1.0-tsa] — 2026-05-19

### Added — Milan AI Week 2026 submission

- **3-tier B + D + A frame** locked via [ADR 0001](docs/adr/0001-milan-submission-frame-bda.md): B (Splunk for AI agents / Agent Governance OS) as core, D (CAICEP RFC 3161 compliance evidence) as differentiator, A (OSS Apache-2.0) as entry tier.
- **RFC 3161 TSA-timestamped verdict chain** shipped to production `api.apohara.dev`:
  - `verdict_vault.py` extended with optional `tsa_token`, `tsa_authority`, `tsa_timestamp` fields (additive, backward-compat preserved)
  - `_request_tsa_token()` helper with Freetsa.org primary + DigiCert fallback
  - `verify_tsa_token()` method validates token integrity
  - New endpoint `GET /v1/verdicts/{signed_hash}/verify-timestamp` returns `{valid, authority, timestamp}`
  - Library: `rfc3161-client` (Sigstore Python, MIT)
  - Tests: 16/16 pre-existing pass (backward compat) + 2 minimum-to-ship Step-5a tests added
  - Live evidence: 1312-byte TimeStampToken from freetsa.org signed `2026-05-19T12:21:50+00:00`
- **LiteLLM Docker compose** deployed parallel on Vultr droplet (port 4000 internal-only, 9 vendors mapped) as Tier-A vendor-independence proof — see [`docs/infra/litellm-parallel-deployment.md`](docs/infra/litellm-parallel-deployment.md). 30-day roadmap to traffic shift.
- **Honesty CI gate** `scripts/check_honesty_consilium.sh` scoped to CONSILIUM-active content. Enforces corrections table (no inflated vendor counts, no `$1.4B Cisco` myth, no "court-admissible today" overclaim) + Zenodo v3 DOI citation.
- **Live landing** at [apohara.dev/consilium](https://www.apohara.dev/consilium) with 4 routes:
  - `/consilium` — hero, 3-tier model, Italian regulatory hook (DORA + EU AI Act)
  - `/consilium/verify` — interactive demo (paste prompt → DJL + Gemini verdict; verify 3 real TSA-signed verdicts against freetsa.org)
  - `/consilium/compliance` — 6 framework dashboard
  - `/consilium/about` — jury verification manual with OpenSSL independent-verify flow
- **Pitch deck Milan variant** at [`docs/submissions/pitch-deck-milan/apohara-consilium-milan-pitch.pdf`](docs/submissions/pitch-deck-milan/apohara-consilium-milan-pitch.pdf) (8 pages, 372 KB, B+D+A frame).
- **Cover image** at [`assets/apohara-consilium-cover.png`](assets/apohara-consilium-cover.png) (1920×1080).

### Fixed

- `cert_request(True)` → `cert_request()` (rfc3161-client API mismatch, silently caught by exception handler — discovered during prod canary).
- Vercel rewrite resolution: `fetch('/api/...')` from `apohara.dev/consilium/verify` now correctly resolves to `/consilium/api/...` (was hitting PROBANT SPA, returning HTTP 405).

### Repository hygiene

- 20 internal/draft/duplicate documents removed for Milan submission cleanliness (strategy drafts, old hackathon submission texts, internal handoff notes, brand assets, video scripts, prior-hackathon blog post).
- `docs/README-probant-legacy.md` preserved as Apache-2.0 derivative-work attribution.

---

For PROBANT-era changelog (pre-2026-05-19) see [github.com/SuarezPM/apohara-probant](https://github.com/SuarezPM/apohara-probant/blob/main/CHANGELOG.md).
