<!-- SPDX-License-Identifier: Apache-2.0 -->
# Cover Letter — Claude for Open Source / Project Glasswing

**From**: Pablo M. Suarez, solo founder, Apohara PROBANT
**Affiliation**: Universidad Nacional de Tucumán (UNT), Argentina
**Date**: 2026-05-18
**Project URL**: <https://www.apohara.dev>
**Source**: <https://github.com/SuarezPM/apohara-probant>
**License**: Apache-2.0
**Paper / DOI**: <https://doi.org/10.5281/zenodo.20277875>

---

## Who

I am a solo open-source developer based in Argentina, building Apohara
PROBANT as an independent project. The work has been
hardware-validated on AMD Instinct MI300X (192 GB HBM3, ROCm 7.2.0)
through the AMD AI Dev Cloud, and is published as Apache-2.0 across
four public repositories
([apohara-probant](https://github.com/SuarezPM/apohara-probant),
[apohara-aegis](https://github.com/SuarezPM/apohara-aegis),
[Apohara_Context_Forge](https://github.com/SuarezPM/Apohara_Context_Forge),
[Apohara-Guard](https://github.com/SuarezPM/Apohara-Guard)).

## What

Apohara PROBANT is a defensive cybersecurity layer for AI-generated
code: a 14-vendor adversarial ensemble (plus a 15th reserved Mythos
seat, see below) audits LLM output before it ships. Every verdict
flows through a dual-layer judge (deterministic Zero-LLM regex layer
plus an LLM ensemble combined by safe-merge), then through a 4-stage
SOAR pipeline (DETECT → JUDGE → ENFORCE → FORENSICS), and is signed
into an HMAC-chained verdict vault that exports to STIX 2.1 on
demand. The safety invariant under the ensemble is **INV-15**
(judge-isolation in KV-cache reuse). It is proven formally with Z3:
the negation of INV-15 is **UNSAT in 10.08 ms** on a single MI300X
core (paper v3.0, Zenodo DOI
[10.5281/zenodo.20277875](https://doi.org/10.5281/zenodo.20277875)).

## Why now

In the last 96 hours I shipped **Fusion Sprint Tier-1** (16 of 18
user stories US-69 → US-86, all live and smoke-verified — see
[`AUDIT.md` §12](../../AUDIT.md)):

- Zero-LLM Deterministic Judge Layer (DJL): **62 regex rules, p99
  0.114 ms** (44× under a 5 ms budget), TPR/TNR 1.000, Wilson 95%
  accuracy CI [0.9962, 1.0000]
  ([`logs/djl_latency.json`](https://github.com/SuarezPM/apohara-aegis/blob/main/logs/djl_latency.json)).
- 4-stage SOAR pipeline, **p99 10.6 ms** (19× under the 200 ms
  budget,
  [`logs/lifecycle_latency.json`](https://github.com/SuarezPM/apohara-aegis/blob/main/logs/lifecycle_latency.json)).
- **6 industry templates** (Finance / Healthcare / Government /
  Retail / Manufacturing / Energy), **6 compliance frameworks** (EU
  AI Act, NIST AI RMF, NIST SP 800-53, SOC 2, ISO 27001, OWASP LLM
  2026 — 49 controls total), and **16 incident codes** (AGT-PI /
  EXF / MIS / FIN / PII / GOV).
- Dual-layer verdict combine via `asyncio.gather` with safe-merge
  policy (`BLOCK ∨ BLOCK = BLOCK`, `ALLOW ∧ ALLOW = ALLOW`, else
  `REVIEW`): both layers retain equal veto power.

Tier-2 is also already live: **STIX 2.1 export** (US-90, aegis
`c3c78b8` + inti `3d57667`) and **SDK middleware** (US-91, aegis
`baa9ae2` ships
[`apohara-langchain`](https://github.com/SuarezPM/apohara-aegis/tree/main/integrations/apohara-langchain)
and
[`apohara-crewai`](https://github.com/SuarezPM/apohara-aegis/tree/main/integrations/apohara-crewai)
under `integrations/`).

The full Fusion Sprint pass: **500/500 aegis fusion tests green**
(1 skipped, pre-existing), backend smoke 2026-05-18T22:09Z, frontend
deploy `dpl_ADPvhhCVGwVQBCREEf77hrbETRug`.

## What Mythos would unlock

The 15th ensemble seat is reserved as the
[`MythosAttackerAdapter`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/mythos_slot.py)
subclass of `VendorAdapter`. Activated, it becomes the **only seat
in the 14+1 ensemble that can read the writer's full reasoning
trace** — the strongest possible adversarial review signal in an
agentic system: Anthropic's latest model arguing against itself,
inside a multi-vendor consensus, under a formally proven judge
isolation invariant.

## Honesty

Quoted verbatim from
[`MYTHOS_READY.md`](../../MYTHOS_READY.md):

> Apohara has NOT been granted Mythos access at the time of writing.
> The `mythos_attacker_slot` in the adversarial ensemble is reserved
> and inactive; it activates only upon Claude for Open Source program
> approval AND provisioning of legitimate API credentials.
>
> This document does not claim Anthropic endorsement, sponsorship, or
> relationship beyond Apohara's submitted Claude for Open Source
> application (or Glasswing application, if extended).

The adapter ships **INACTIVE**: `_available()` returns `False`
unless both `APOHARA_MYTHOS_ENABLED=1` and a credential env var
(`ANTHROPIC_MYTHOS_API_KEY` or `AWS_BEDROCK_MYTHOS_CREDS`) are
present. Until that, the ensemble runs as a 14-seat configuration
and the Mythos seat returns
`_unavailable_verdict("not_configured")` cleanly. The disclosure
discipline is enforced in CI by
[`scripts/check_honesty_fusion.sh`](../../scripts/check_honesty_fusion.sh)
Rule 1 (which bans the four forbidden access-claim phrases).

## Ask

I am applying to the **Claude for Open Source** program with a
request that the Project Glasswing 40-slot cohort consider Apohara
PROBANT. The substrate is in place: the slot, the adapter contract,
the env-gate, the audit-log field, the boundary contract, and the
contract test all exist today. Activation requires program approval
plus credential provisioning — zero code changes after that.

Thank you for considering this application.

— Pablo M. Suarez
