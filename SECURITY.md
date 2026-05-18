# Security Policy — Apohara PROBANT

> Closes architect-flagged SOC 2 CC2.3 (Information Security Policy) gap.

## Supported versions

Active maintenance: latest commit on `main` of `SuarezPM/apohara-probant`.
Older tags receive critical-severity fixes only when feasible.

| Version | Supported |
|---|---|
| `main` (current) | ✅ active |
| 0.2.x | ✅ active |
| 0.1.x (hackathon Day-7 snapshot) | ⚠️ critical only |
| <0.1.0 (pre-hackathon) | ❌ unsupported |

## Threat model

Apohara PROBANT processes:

- **User-supplied code prompts** (highest trust risk — may contain injection attempts, secrets, PII)
- **Gemini writer output** (medium trust — known model but adversarial output channel)
- **9-vendor adversarial verdicts** (medium trust — each vendor sandboxed via INV-15 KV-cache isolation)
- **HMAC-signed verdict ledger** (highest integrity requirement — tamper-evident chain)

Out of scope: physical security of the deploy host (Vultr-managed), supply-chain attacks on Python wheels (mitigated via pyproject pinning + reproducible build).

## Reporting a vulnerability

Report security issues to: **dimensionequix+security@gmail.com**

Please include:

1. Vulnerability class (auth bypass, injection, data leak, etc.)
2. Affected file path(s) and version
3. Reproduction steps or proof-of-concept
4. Suggested remediation (optional, appreciated)
5. Your disclosure timeline preference

We commit to:

- Acknowledge receipt within **72 hours**
- Initial assessment within **7 days**
- Fix or mitigation plan within **30 days** for critical, **90 days** for medium, best-effort for low
- Public disclosure coordination — by default, 90 days from initial report or upon fix release, whichever is earlier

## Security controls in place

See [`docs/compliance/soc2-control-mapping-2026.md`](docs/compliance/soc2-control-mapping-2026.md) for the full SOC 2 TSC → control mapping. Key existing controls:

- **Prompt envelope** (`packages/backend/envelope.py`) — nonce-tagged untrusted-block delimiters defeat tag-forgery prompt injection (Hines et al. arXiv 2403.14720)
- **AST audit linter** (`packages/backend/scripts/prompt_envelope_audit.py`) — CI-gateable detection of raw f-string interpolation of untrusted attrs
- **HMAC-signed verdict ledger** (`packages/backend/verdict_vault.py`) — every `/v1/verify` response carries HMAC-SHA256 + SHA-256 chain link; `verify_chain()` detects payload + signature + key-rotation tampering
- **INV-15 KV-cache isolation** ([paper DOI 10.5281/zenodo.20277875](https://doi.org/10.5281/zenodo.20277875)) — formal Z3 SMT proof in `Apohara_Context_Forge/apohara_context_forge/safety/z3_inv15_proof.py` (PROVED 2026-05-18) complements the empirical 0/1210-violation sweep
- **Veea LobsterTrap DPI** (`packages/backend/lobstertrap_client.py` + `configs/lobstertrap-policy.example.yaml`) — subprocess pre-check on every `/v1/verify` request blocks SQL-injection + prompt-injection patterns before reaching Gemini
- **Meta Rule-of-Two CI gate** (`packages/backend/rule_of_two.py`) — destructive agentic actions blocked when running in CI without TTY and without explicit human-trust env override
- **Per-org HMAC key isolation** (`packages/backend/billing/tenant_model.py`) — multi-tenant mode (gated by `APOHARA_MULTI_TENANT=1`) rotates HMAC keys per tenant, with TOCTOU-safe quota enforcement via SQLite `BEGIN IMMEDIATE`
- **JWT-authenticated admin audit API** (`packages/backend/main.py` `/v1/admin/audit`) — `Authorization: Bearer <JWT>` required, role + org_id extracted from JWT claims, never from query parameters

## Honest disclosures (per Apohara AUDIT.md culture)

We hold ourselves to the same standard we apply to competitors:

- Enterprise mode (`APOHARA_ENTERPRISE_MODE=1`) and multi-tenant mode (`APOHARA_MULTI_TENANT=1`) are **OPT-IN, default-off**. The single-tenant + BYOK flow is the supported production posture.
- SOC 2 / ISO 27001 control mappings exist as planning artifacts (see `docs/compliance/`); we are **NOT certified**. Certification is a 6-12 month organizational + auditor engagement.
- The sister-project **Apohara Guard** (AGPL-3.0, separate repo) handles Trust & Safety / CSAM detection. Its 5-layer kernel sandbox claim is currently honest as **3 layers active + 2 layers planned** (Landlock LSM + seccomp-bpf require libseccomp bpf blob generation, scheduled Phase 3).
- LobsterTrap DPI block rates are real measured numbers with Wilson 95% CI: **SQLi 50% (n=20, CI [29.9%, 70.1%], directional only)**, prompt-injection 30% (n=10, directional), benign false-positive 9.8% (n=51). See `logs/lobstertrap_block_rate_*.json`.
- LobsterTrap policy uses LT's native `contains_injection_patterns` + `intent_category=data_access` + risk-score thresholds. Some SQL injection variants (e.g., `admin OR 1=1` without `SELECT` keyword) currently fall through with `intent_category=general` and are NOT blocked at the LT layer. The 9-vendor ensemble is the next defensive layer.

## Cryptography

- HMAC-SHA256 for verdict ledger signing (configurable via `APOHARA_LEDGER_HMAC_KEY`)
- SHA-256 for chain linking (genesis = 64 zeros)
- JWT HS256 for admin auth (configurable via `APOHARA_JWT_SECRET`)
- TLS 1.3 enforced via Caddy reverse proxy on the deploy host (Let's Encrypt auto-issued certs)
- No client-side cryptography (BYOK Gemini key is server-forwarded, never persisted)

## Dependencies + supply chain

- Backend: `pyproject.toml` pins major versions; sister-repo deps fetched via `git+https://` URLs pinned to `main` (will move to tagged releases post-hackathon)
- Frontend: `package.json` + `npm shrinkwrap` (planned for Phase 3) — currently uses `npm install` lockfile
- Static binaries: Veea LobsterTrap built from `github.com/veeainc/lobstertrap` source via `make build-static` (MIT license)
- Third-party attributions: see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)

## Contact

- Security disclosures: dimensionequix+security@gmail.com
- General contact: dimensionequix@gmail.com
- Maintainer: Pablo M. Suarez ([@SuarezPM](https://github.com/SuarezPM))
- License: Apache-2.0
