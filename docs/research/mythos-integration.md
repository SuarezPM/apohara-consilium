# Mythos Integration — Technical Architecture

> **Cross-reference**: See [`MYTHOS_READY.md`](../../MYTHOS_READY.md) for the
> boundary statement. This document does not claim Anthropic endorsement or
> Mythos access. The terminology "Mythos-Ready" is Apohara's coinage for its
> own architectural readiness state; Anthropic does not use this terminology.

## Overview

This document describes the technical architecture for the reserved Claude
Mythos slot in the Apohara PROBANT adversarial ensemble. The slot was
implemented in US-78 (Fusion Sprint, 2026-05-18) as part of the Architect+Critic
reviewed fusion plan. Apohara has NOT been granted Mythos access; this
document describes the engineering design for when access is provisioned.

---

## Slot interaction with the ensemble

### Adapter hierarchy

`MythosAttackerAdapter` subclasses `VendorAdapter` directly (defined at
`apohara_aegis/multi_judge.py:313`). This choice was made per the
Architect+Critic review: Mythos is NOT wrapped in `FallbackVendorAdapter`
(line 1111 — that class is a routing wrapper for primary+backup chains, not
appropriate for a single-endpoint reserved slot with no backup).

### Ensemble loop mechanics

The ensemble's `asyncio.gather` call in `EnsembleJudge.evaluate()` iterates
all 11 adapters in parallel. For each adapter, the driver at
`multi_judge.py:345-371` calls `_available()` before issuing `_call_api()`:

```
async def evaluate(self, prompt: str) -> JudgeVerdict:
    if not self._available():                         # line 347
        return self._unavailable_verdict("not_configured")
    ...
    response_obj, usage = await self._call_api(prompt)
```

When `APOHARA_MYTHOS_ENABLED` is absent or the credential env var is not
set, `MythosAttackerAdapter._available()` returns `False` and the ensemble
receives `JudgeVerdict(path="unavailable", is_harmful=False, confidence=0.0)`.
The active-adapter tally excludes unavailable vendors, so the 10-vendor
frontier thresholds continue to govern the vote. The Mythos seat contributes
zero harmful votes and does not distort the consensus score.

### FallbackVendorAdapter placement

The Day-5 ensemble wraps each of its 10 active seats in `FallbackVendorAdapter`
(a primary+ordered-backup routing chain). The Mythos slot is intentionally
placed AFTER the 10 `FallbackVendorAdapter` seats in the `make_default_adapters()`
return list, as a plain `MythosAttackerAdapter()` instance. This preserves the
existing seat ordering (indices 0-9 are the 10 Day-5 frontier seats; index 10
is the Mythos reserved slot).

Vote thresholds auto-scale via `_scale_thresholds_for_adapter_count(11)`:
- `high` = 11 (unanimous), `med` = 8 (ceil(2/3 × 11)), `human_review` = 3.
- The canonical Day-4 `DEFAULT_VOTE_THRESHOLDS` (`{high: 10, med: 6, human_review: 3}`)
  remains unchanged as the 10-seat reference constant.

---

## Activation flow on approval

Once the Claude for Open Source program (or Project Glasswing, if extended)
provisions an API credential, the activation requires zero code changes:

1. **Credential receipt** — Anthropic provisions a Mythos Preview API key
   accessible via Amazon Bedrock, Vertex AI, or Azure AI Foundry.
2. **Environment configuration** on the Apohara PROBANT droplet:
   ```bash
   export APOHARA_MYTHOS_ENABLED=1
   export ANTHROPIC_MYTHOS_API_KEY=<key>   # or AWS_BEDROCK_MYTHOS_CREDS
   ```
3. **Service restart** — `systemctl restart apohara-inti.service`.
4. **`_call_api()` implementation** — the stub in `mythos_slot.py` raises
   `NotImplementedError` until it is replaced with the real Bedrock/Vertex AI
   call. The implementation follows the same `(response_obj, usage_dict)` return
   contract as all other `VendorAdapter` subclasses; `_parse_response()` converts
   the raw body to a `JudgeVerdict`.
5. **Ensemble activation** — `make_default_adapters()` returns 11 active seats;
   the threshold ladder auto-scales to `{high: 11, med: 8, human_review: 3}`.

The `_call_api()` implementation (step 4) requires approximately 30-50 lines
following the `_coerce_json_dict` pattern already in `VendorAdapter`, plus a
Bedrock/Vertex client call using the `anthropic` SDK's Bedrock transport.

---

## Audit-log fields recorded for Mythos provenance

When active, each `EnsembleJudge.evaluate()` call produces:

```json
{
  "vendor_votes": {
    "mythos-glasswing": {
      "is_harmful": true,
      "confidence": 0.97,
      "category": "prompt_injection",
      "model": "anthropic/claude-mythos-preview",
      "vendor": "anthropic-glasswing",
      "latency_ms": 312.4,
      "path": "primary",
      "error": null
    }
  }
}
```

This vote is included in the HMAC-SHA256 chained ledger via `forensics.py`,
ensuring every Mythos classification is tamper-evident. The `vendor` field
is `"anthropic-glasswing"` (not `"cuda"` or any other label) — honesty
discipline per `AUDIT.md`.

The `badge` attribute (`"MY"`) appears in the dissent-summary UI as a
two-letter seat identifier alongside the existing badges (GE, CL, GP, DS,
MM, KI, GL, QW, NV, BP).

---

## Ethical framing

Mythos is positioned as an adversarial-attacker seat in the ensemble — it
joins the other 10 vendors in independently classifying prompts as harmful
or benign. This matches Anthropic's responsible deployment principles:
heterogeneous judgment from multiple frontier models reduces the risk that a
single training lineage's blind spots go undetected.

The adversarial ensemble does not replace human review. The Article-14
human-oversight band (`human_review` threshold) is preserved regardless of
ensemble size: when fewer than `human_review` vendors agree, the pipeline
routes to the Lobster Trap human-in-the-loop queue rather than
auto-deciding.

Mythos's classification does NOT carry more weight than any other vendor
vote. It casts one vote out of N in the ensemble. Adding a Claude Mythos
seat does not shift the policy decisions made by the ensemble architecture
— it adds one more independent signal to the consensus.

---

## Pricing reference

Anthropic Mythos Preview pricing (public Anthropic pricing page, 2026-05):

| Route | Input | Output |
|---|---|---|
| Bedrock | $25 / M tokens | $125 / M tokens |
| Vertex AI | $25 / M tokens | $125 / M tokens |
| Azure AI Foundry | $25 / M tokens | $125 / M tokens |

At the ensemble's typical prompt size (~90 input + ~80 output tokens per
call), one Mythos classification costs approximately $0.0125 per call
($0.00225 input + $0.010 output). This is the highest per-call cost in the
ensemble (for reference: the cheapest seat, Nemotron 3 Super, costs ~$0.0002).

The Apohara cost-cap machinery (`cost_caps_usd` in `EnsembleJudge.__init__`)
can gate the Mythos seat per-instance if budget constraints require it.

---

## Why Claude for Open Source, not direct Glasswing

Project Glasswing is Anthropic's invite-only program for a small cohort of
elite organizations. Apohara PROBANT is an independent open-source project
by a solo developer; it is not in the Glasswing cohort and we do not claim
to be.

The [Claude for Open Source](https://www.anthropic.com/glasswing) program is
the appropriate application path: it is designed for OSS projects that
integrate Claude in a substantive, publicly available way. Apohara PROBANT
qualifies as:

- Apache-2.0 open-source, publicly on GitHub.
- Defensive cybersecurity tooling (AI code review defense-in-depth).
- Built around Claude Opus 4.7 as one of the 10 frontier judges.
- Academic-quality safety invariant documentation (INV-15, Zenodo DOI
  `10.5281/zenodo.20277875`).

If Anthropic extends a Glasswing invitation later, the same `MythosAttackerAdapter`
slot activates — no architecture change required.

---

## Honest disclosures

1. **"Mythos-Ready" is Apohara's terminology**, not Anthropic's. Anthropic does
   not use or endorse this phrasing.
2. **No Mythos access has been granted** as of the time this document was written
   (2026-05-18). The `mythos_attacker_slot` is a stub.
3. **`_call_api()` is not implemented** — the current code raises `NotImplementedError`.
   This is intentional and honest. The stub prevents accidental production use
   before credentials and a real implementation are in place.
4. **Program approval is not guaranteed**. The Claude for Open Source application
   is pending; this document describes what Apohara WILL do if approved, not what
   it currently does.
