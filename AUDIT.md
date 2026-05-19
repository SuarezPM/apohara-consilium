# AUDIT.md — Apohara CONSILIUM

Public accountability log. Every claim in code, README, deck, or submission text traces to a file:line reference, a log file, a public source, or a runnable verification command.

Status legend: 🟢 verified · 🟡 partial · 🟠 advisory · 🔴 open

For pre-CONSILIUM accountability (Apohara PROBANT era), see [github.com/SuarezPM/apohara-probant/blob/main/AUDIT.md](https://github.com/SuarezPM/apohara-probant/blob/main/AUDIT.md).

---

## 🟢 Vendor count canonical = 9

- **Claim**: 9-vendor adversarial ensemble across the CONSILIUM Milan submission.
- **Evidence**: [`apohara-aegis/openrouter_adapters.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/openrouter_adapters.py) — 9 confirmed subclasses (DeepSeek V4 Pro, Kimi K2.6, GLM 5.1, Qwen 3.6+, Nemotron 3 Super 120B, Gemini 3.1 Pro, Claude Opus 4.7 Fast, GPT-5.5, DeepSeek V3.2 Speciale).
- **Honesty CI rule**: `scripts/check_honesty_consilium.sh` Rule 2 fails the build if `12-vendor` / `13-vendor` / `14-vendor` appears in CONSILIUM-active content.

## 🟢 6 compliance frameworks mapped (14 unique controls referenced)

- **Claim**: EU AI Act · NIST AI RMF · ISO 42001 · SOC 2 · GDPR · NIST 800-53.
- **Evidence**: [`apohara-aegis/taxonomy.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/taxonomy.py) — `default_compliance_refs` returns 14 unique control identifiers across the 6 frameworks.
- **Earlier overclaim corrected**: README and deck previously said "49 compliance controls" (inflated). Now read "14 mapped controls".

## 🟢 Z3 SMT formal proof — INV-15 UNSAT in 10.08 ms ±0.5

- **Claim**: A formal safety invariant (INV-15) for the multi-agent LLM judge layer is verified by Z3 SMT solver, returning `UNSAT` on the negation in ~10 ms.
- **Evidence**: [`Apohara_Context_Forge/safety/z3_inv15_proof.py`](https://github.com/SuarezPM/Apohara_Context_Forge/blob/main/apohara_context_forge/safety/z3_inv15_proof.py) + paper [DOI 10.5281/zenodo.20277875](https://doi.org/10.5281/zenodo.20277875) v3.

## 🟢 RFC 3161 TSA verdict chain live on api.apohara.dev

- **Claim**: every CONSILIUM verdict can be signed with an RFC 3161 TimeStampToken from Freetsa.org (DigiCert fallback) and verified via `GET /v1/verdicts/{signed_hash}/verify-timestamp`.
- **Live evidence**: 3 production verdicts signed `2026-05-19T13:12:05+00:00` with valid freetsa.org tokens. Verify:
  ```bash
  curl https://api.apohara.dev/v1/verdicts/7407ec9763cd436c569a7f3e5201e5f4ffc8e78c132c043ce82afb9e68b3f7ee/verify-timestamp
  # → {"valid":true,"authority":"freetsa","timestamp":"2026-05-19T13:12:05+00:00"}
  ```
- **Verifiable independently** at [`apohara.dev/consilium/about`](https://www.apohara.dev/consilium/about) (OpenSSL flow against `freetsa-ca.pem`).

## 🟢 "Tamper-evident + roadmap to court-admissible" — NOT "court-admissible today"

- **Claim**: RFC 3161 timestamps are tamper-evident but not yet legally binding qualified timestamps under EU Regulation 910/2014.
- **Roadmap**: Q3 2026 eIDAS QTSP partnership (Actalis Italia primary candidate) to upgrade to **qualified** timestamps — at that point and only then can the word "court-admissible" apply.
- **Honesty CI rule**: Rule 1 bans the phrase "court-admissible today" in CONSILIUM-active content.

## 🟢 Cisco–Robust Intelligence acquisition value ≈ $350M (not $1.4B)

- **Claim**: the Cisco–Robust Intelligence acquisition (Aug 2024) is referenced as the category exit precedent at ~$350M.
- **Source**: [451 Research estimate via SiliconANGLE](https://siliconangle.com/2024/08/27/cisco-snaps-ai-model-data-security-startup-robust-intelligence/). Cisco did not disclose terms. The "$1.4B" number that circulates in some 2026 strategy reports has no primary-source basis and is **explicitly banned** by the honesty CI.

## 🟢 16/16 verdict_vault tests pass — backward compatibility preserved

- **Claim**: the RFC 3161 TSA addition to `verdict_vault.py` is additive only; existing verdicts without `tsa_token` continue to verify.
- **Evidence**: `python -m pytest packages/backend/tests/test_verdict_vault.py -v` → 16 passed. Plus new `test_tsa.py` Step-5a tests (`test_tsa_optional_field_backward_compat` + `test_tsa_token_roundtrip_freetsa`).

## 🟢 LiteLLM parallel deploy live on droplet — vendor independence is real

- **Claim**: vendor independence is not vapor; LiteLLM Docker compose (3 services: postgres + redis + litellm) is deployed and healthy on the Vultr droplet at `127.0.0.1:4000` internal-only.
- **Evidence**: [`docs/infra/litellm-parallel-deployment.md`](docs/infra/litellm-parallel-deployment.md). Image pinned to `ghcr.io/berriai/litellm:main-v1.78.5-stable`. Roadmap: 30-day traffic shift OpenRouter → LiteLLM.

## 🟡 apohara.io DNS propagation in progress

- **Claim**: the custom domain `apohara.io` is configured in Vercel for the CONSILIUM landing.
- **Status**: domain attached to project; DNS A-record at Porkbun pending propagation. The unified demo URL `https://www.apohara.dev/consilium/*` covers the use case in the meantime.

---

CONSILIUM is a separate product from [Apohara PROBANT](https://github.com/SuarezPM/apohara-probant) at apohara.dev. Both maintained by Pablo M. Suarez (UNT, Argentina). This audit log inherits the honesty discipline of the PROBANT codebase (Apache-2.0 derivative).
