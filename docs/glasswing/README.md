<!-- SPDX-License-Identifier: Apache-2.0 -->
# `docs/glasswing/` — Project Glasswing / Claude for Open Source application package

> Drafted **after** Fusion Sprint Tier-2 completion (US-92), per
> Pablo's directive: "esperamos a tier 2 completo como evidencia"
> (we wait for Tier-2 complete as evidence).

## Files in this package

| File | ~Words | Purpose |
|------|-------:|---------|
| [`cover-letter.md`](cover-letter.md) | 600 | Pablo's narrative pitch to the Claude for Open Source program. Quotes the verbatim `MYTHOS_READY.md` disclaimer. Submit the body of this file via the application portal. |
| [`architecture-summary.md`](architecture-summary.md) | 800 | Pure technical content with one ASCII data-flow diagram. Hero → ensemble → DJL → SOAR → verdict_vault → STIX. Mythos slot contract. INV-15 Z3 proof citation. |
| [`evidence-pack.md`](evidence-pack.md) | 700 | Verifiable claims table. Public URLs (live smoke), repos, test counts, latency logs, commit SHAs, Zenodo DOI, CI gate exit codes. Anthropic reviewers can verify in <5 min. |
| [`competitive-positioning.md`](competitive-positioning.md) | 500 | Apohara PROBANT vs PLAYBOOK SOAR, Pantheon, Vela, Trusyn. Closes on the Mythos differential. |
| `README.md` (this file) | 200 | Index. |

## How to use this package

1. Open the [Claude for Open Source application portal](https://www.anthropic.com/glasswing).
2. Paste the body of [`cover-letter.md`](cover-letter.md) into the
   application narrative field.
3. Link the three supporting files as references:
   [`architecture-summary.md`](https://github.com/SuarezPM/apohara-probant/blob/main/docs/glasswing/architecture-summary.md),
   [`evidence-pack.md`](https://github.com/SuarezPM/apohara-probant/blob/main/docs/glasswing/evidence-pack.md),
   [`competitive-positioning.md`](https://github.com/SuarezPM/apohara-probant/blob/main/docs/glasswing/competitive-positioning.md).
4. Cite the Zenodo DOI [10.5281/zenodo.20114594](https://doi.org/10.5281/zenodo.20114594)
   in the project-publications field.
5. Cite the [`MYTHOS_READY.md`](../../MYTHOS_READY.md) boundary
   contract verbatim in the "honesty about access status" field.
