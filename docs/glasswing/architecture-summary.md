<!-- SPDX-License-Identifier: Apache-2.0 -->
# Architecture Summary — Apohara PROBANT

> Technical companion to [`cover-letter.md`](cover-letter.md). All
> numerical claims trace to a committed log file or paper section.

---

## High-level data flow

```
                  ┌────────────────────────────────────────────────┐
                  │   Hero / BYOK demo  (www.apohara.dev landing)  │
                  └───────────────────────┬────────────────────────┘
                                          │ prompt + writer trace
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │  POST /v1/verify   (legacy 12-vendor verifier) │
                  │  POST /v1/soar/judge/evaluate  (Fusion Tier-1) │
                  └───────────────────────┬────────────────────────┘
                                          │ asyncio.gather
                  ┌───────────────────────┼────────────────────────┐
                  ▼                                                ▼
       ┌────────────────────────┐                  ┌──────────────────────────┐
       │  Layer A: DJL          │                  │  Layer B: LLM ensemble   │
       │  62 regex rules        │                  │  14 seats + Mythos slot  │
       │  Zero-LLM, prompt-     │                  │  (10 Day-4 frontier      │
       │  injection-immune      │                  │   + 3 Phase-3 OpenRouter │
       │  p99 0.114 ms          │                  │   + 1 MythosAttacker     │
       │  TPR/TNR = 1.000       │                  │   slot, INACTIVE)        │
       │  Wilson95 [.9962,1.0]  │                  │  per-vendor verdicts     │
       └───────────┬────────────┘                  └──────────────┬───────────┘
                   │ DjlVerdict                       LlmEnsembleVerdict
                   └────────────────┬──────────────────────────────┘
                                    ▼
                  ┌────────────────────────────────────────────────┐
                  │ verdict_combine.combine()   safe-merge policy: │
                  │   BLOCK ∨ BLOCK = BLOCK                        │
                  │   ALLOW ∧ ALLOW = ALLOW                        │
                  │   else REVIEW                                  │
                  │ Both layers equal veto power.                  │
                  └───────────────────────┬────────────────────────┘
                                          │ CombinedVerdict
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │  SOAR pipeline:                                │
                  │    DETECT → JUDGE → ENFORCE → FORENSICS        │
                  │    4 async stages, p99 10.6 ms (19× < 200 ms)  │
                  └───────────────────────┬────────────────────────┘
                                          │ signed verdict + incident
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │  HMAC-SHA256 verdict_vault   (tamper-evident   │
                  │  chained ledger; signed_hash forwarded to STIX │
                  │  external_references for chain-of-custody)     │
                  └───────────────────────┬────────────────────────┘
                                          │
              ┌───────────────────────────┼────────────────────────┐
              ▼                           ▼                        ▼
      Prometheus metrics       /v1/soar/incidents/{id}/stix     Compliance
      (6 gauges, Prom text)    (6 SDOs: identity / indicator /  per-incident
                                sighting / observed-data /      report
                                course-of-action / note)        (49 controls,
                                                                 6 frameworks)
```

---

## Component contract

### Layer A — Deterministic Judge Layer (DJL)

- Module:
  [`apohara-aegis/apohara_aegis/djl.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/djl.py)
- 62 frozen regex rules across 6 categories: PI (20), SQLi (6), XSS
  (6), PII (10), EXF (5), MIS (10), POL (5).
- Verdict: `DjlVerdict(decision=BLOCK|ALLOW, rule_id, latency_ms)`.
- **Why Zero-LLM**: the DJL is immune to prompt-injection because no
  model interprets the input — it is matched against a frozen rule
  set.
- **Latency budget**: 5 ms. **Measured**: p99 0.114 ms (headline,
  AUDIT.md §12; live JSON has p99 0.0911 ms on the most recent
  refresh — both are well under budget). 44× under headline budget.
  Backing log:
  [`logs/djl_latency.json`](https://github.com/SuarezPM/apohara-aegis/blob/main/logs/djl_latency.json).

### Layer B — LLM ensemble

- Module:
  [`apohara-aegis/apohara_aegis/multi_judge.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/multi_judge.py)
- `make_default_adapters()` returns **14 seats**: 10 Day-4 frontier
  `FallbackVendorAdapter` wrappers + 3 Phase-3 OpenRouter additions
  (Mistral Large 2411, Grok-2 1212, Perplexity Sonar 128k) + 1
  reserved `MythosAttackerAdapter` at index 13.
- Threshold ladder: `_scale_thresholds_for_adapter_count(14) =
  {high: 14, med: 10, human_review: 4}` (CHANGELOG.md Changed
  section; AUDIT.md §12 table).
- All 14 active adapters dispatched via `asyncio.gather`; per-vendor
  votes surface in `LlmEnsembleVerdict.vendor_votes`.

### Combine — `verdict_combine.combine()`

- Module:
  [`apohara-aegis/apohara_aegis/verdict_combine.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/verdict_combine.py)
- Frozen dataclass `CombinedVerdict(djl_verdict, llm_verdict,
  final_decision, rationale)`.
- Both layers run in parallel via `asyncio.gather`; safe-merge:
  `BLOCK ∨ BLOCK = BLOCK`, `ALLOW ∧ ALLOW = ALLOW`, else `REVIEW`.
- Both layers retain **independent veto**. This is not a "DJL is
  the primary gate" design — every gate has equal cancel power.

### SOAR pipeline

- Module:
  [`apohara-aegis/apohara_aegis/soar_pipeline.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/soar_pipeline.py)
- 4 async stages: DETECT → JUDGE → ENFORCE → FORENSICS, with inline
  `_HMACChain` byte-compatible with `verdict_vault.VerdictVault`.
- **Lifecycle budget**: 200 ms. **Measured**: p99 10.6 ms (live
  log p99 10.76 ms, p50 10.53 ms — both ≈19× under budget). Backing
  log:
  [`logs/lifecycle_latency.json`](https://github.com/SuarezPM/apohara-aegis/blob/main/logs/lifecycle_latency.json).
  The log carries a `framing_note`: LLM calls are mocked to a fixed
  10 ms stub; real vendor latencies live in `logs/baseline_*`.

### Mythos slot — reserved, inactive

- Module:
  [`apohara-aegis/apohara_aegis/mythos_slot.py`](https://github.com/SuarezPM/apohara-aegis/blob/main/apohara_aegis/mythos_slot.py)
  (aegis commit `f7a712d`).
- `MythosAttackerAdapter(VendorAdapter)` — subclass of
  `VendorAdapter` (not `FallbackVendorAdapter`, which is a routing
  wrapper unsuitable for a single-endpoint reserved seat).
- Env-gate: `_available()` returns `False` unless
  `APOHARA_MYTHOS_ENABLED=1` AND
  (`ANTHROPIC_MYTHOS_API_KEY` OR `AWS_BEDROCK_MYTHOS_CREDS`).
- Inactive path: ensemble driver at `multi_judge.py:347` calls
  `_unavailable_verdict("not_configured")` cleanly (no raise).
- Active path: `_call_api()` and `_parse_response()` are stubs
  raising `NotImplementedError` until credentials and Bedrock /
  Vertex AI client glue are added — an honest stub, by design.
- Audit-log field reserved:
  `CombinedVerdict.llm_verdict.vendor_votes["mythos-glasswing"]`.

### INV-15 — formal safety invariant

- Code:
  [`Apohara_Context_Forge/apohara_context_forge/safety/z3_inv15_proof.py`](https://github.com/SuarezPM/Apohara_Context_Forge/blob/main/apohara_context_forge/safety/z3_inv15_proof.py).
- Paper: `paper/inv15_paper.pdf` v3.0, 12 references, MI300X-grounded.
- Result: negation of INV-15 is **UNSAT** in **10.08 ms** on a
  single MI300X core (paper §5; cited in
  [`README.md`](../../README.md#251) and
  [`SECURITY.md`](../../SECURITY.md#54)).
- Zenodo DOI:
  [10.5281/zenodo.20114594](https://doi.org/10.5281/zenodo.20114594).

---

## HTTP surface

10 endpoints under `/v1/soar/*` (inti commit `b60933a`):
`healthz`, `incidents/types`, `incidents/recent`, `judge/evaluate`,
`templates` (+ `/templates/{name}`), `compliance/frameworks`,
`compliance/report`, `mythos/status`, `metrics` (Prometheus text),
and STIX export at `incidents/{id}/stix` (inti commit `3d57667`,
US-90). Legacy 12-vendor `/v1/verify` and `/health` endpoints
remain unchanged — zero regression on the existing LIVE production
surface (smoke 2026-05-18T22:14Z).
