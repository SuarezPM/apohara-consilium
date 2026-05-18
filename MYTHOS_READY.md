# Apohara PROBANT — MYTHOS-READY Architecture

> **Boundary text — verbatim, non-negotiable**:
>
> This document describes architectural readiness for Claude Mythos
> integration via the Claude for Open Source program (and/or Project
> Glasswing if invited). **Apohara has NOT been granted Mythos access
> at the time of writing.** The `mythos_attacker_slot` in the adversarial
> ensemble is reserved and inactive; it activates only upon Claude for
> Open Source program approval AND provisioning of legitimate API
> credentials.
>
> This document does not claim Anthropic endorsement, sponsorship, or
> relationship beyond Apohara's submitted Claude for Open Source
> application (or Glasswing application, if extended).

## Why "Mythos-Ready" (and not "Mythos-integrated")

Honesty about pending vs. live access is itself an Apohara discipline value
(see [`AUDIT.md`](AUDIT.md)). Our architecture is provably ready (slot
present, adapter contract conformant, audit-log field reserved, env-gate
implemented, contract test green). Access is a calendar issue, not an
engineering issue.

## Architectural readiness checklist

- [x] **Reserved slot** in `apohara-aegis/apohara_aegis/mythos_slot.py` — `MythosAttackerAdapter` subclasses `VendorAdapter` per the existing ensemble contract.
- [x] **Adapter contract conformant** — implements `_available()`, `_call_api()`, `_parse_response()` per `multi_judge.py` VendorAdapter interface.
- [x] **Env-var gate** — `_available()` returns False unless `APOHARA_MYTHOS_ENABLED=1` AND `ANTHROPIC_MYTHOS_API_KEY` (or `AWS_BEDROCK_MYTHOS_CREDS`) is present.
- [x] **Ensemble integration** — added to `make_default_adapters()` output as the 11th seat; ensemble loop handles `_available() == False` gracefully (returns `_unavailable_verdict("not_configured")`).
- [x] **Audit-log field reserved** — `CombinedVerdict.llm_verdict.vendor_votes["mythos-glasswing"]` will surface Mythos votes in the HMAC chain when active.
- [x] **Contract test** — `tests/test_mythos_slot.py` verifies adapter exists, registered in ensemble, raises correctly when disabled.

## Activation path (once Claude for Open Source approves)

1. Receive Anthropic API credential for Mythos Preview via Bedrock or Vertex AI.
2. Set environment variables on droplet:
   ```bash
   export APOHARA_MYTHOS_ENABLED=1
   export ANTHROPIC_MYTHOS_API_KEY=<provisioned-key>
   # or
   export AWS_BEDROCK_MYTHOS_CREDS=<credentials>
   ```
3. Restart `apohara-inti.service`.
4. `make_default_adapters()` now includes Mythos as 11th active seat.
5. Verdict combine in `verdict_combine.py` will receive Mythos vote in `LlmEnsembleVerdict.vendor_votes["mythos-glasswing"]` per request.
6. No code change required — pure config switch.

## Application status

We have submitted (or plan to submit) an application via the
[Claude for Open Source](https://www.anthropic.com/glasswing) program
[Project Glasswing application channel](https://www.anthropic.com/glasswing)
citing Apohara PROBANT's defensive-cybersecurity OSS profile.

**Cite**: GitHub https://github.com/SuarezPM/apohara-probant, license
Apache-2.0, ensemble + INV-15 paper Zenodo DOI 10.5281/zenodo.20277875.
