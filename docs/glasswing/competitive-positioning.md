<!-- SPDX-License-Identifier: Apache-2.0 -->
# Competitive Positioning — Apohara PROBANT

> Comparative analysis of Apohara PROBANT against the four main
> competitors documented in our private competitor intel
> (`CLAUDE.local.md`). Public references are cited where available;
> private intel observations are paraphrased.

---

## vs PLAYBOOK SOAR

PLAYBOOK SOAR positions itself as the "first NIST-aligned agentic
SOAR." Public repository inspection shows the NIST-first claim is
unbacked by prior-art evidence, the ensemble is single-vendor
(Gemini), and the `tests/` directory is empty.

Apohara's contrast:

- **Z3-proven INV-15** (negation UNSAT in 10.08 ms, paper v3.0,
  Zenodo DOI [10.5281/zenodo.20114594](https://doi.org/10.5281/zenodo.20114594))
  vs an unbacked alignment claim.
- **14-vendor adversarial ensemble** vs single Gemini vendor.
- **500/500 fusion-test pass** + 5 STIX export tests + 22 inti
  SOAR-route tests + 130 parametrized DJL tests vs an empty
  `tests/`.
- **Real CSA Agentic Profile alignment** with publishable prior-art
  doc:
  [`docs/research/prior-art-nist-agentic-profile.md`](../research/prior-art-nist-agentic-profile.md)
  cites the CSA Agentic Profile (draft March 2026), Microsoft AGT
  base RMF 1.0, and the NIST official Q4 2026 release window. The
  honesty CI gate Rule 2 enforces that any "first implementation"
  language must trace to this file.

---

## vs Pantheon

Pantheon
([github.com/umairyousif239/Pantheon](https://github.com/umairyousif239/Pantheon))
is an AI Agent SOC dashboard by a junior developer; the repo was
created 2026-05-11 (6 days before this writing), has 73 commits, 1
star, 0 forks, single-vendor Gemini 2.5 Flash, 0 tests, 0 benchmarks,
0 measurement JSONs, no paper, and a license inconsistency (README
says MIT, no `LICENSE` file present).

Apohara's contrast: hardware-validated on AMD Instinct MI300X (192
GB HBM3, ROCm 7.2.0), paper v3.0 published on Zenodo,
clean Apache-2.0 license with corresponding `LICENSE` file, 500/500
fusion-tests green, 15+ measurement JSONs committed to
[`apohara-aegis/logs/`](https://github.com/SuarezPM/apohara-aegis/tree/main/logs)
and
[`apohara-inti/logs/`](https://github.com/SuarezPM/apohara-inti/tree/main/logs).

---

## vs Vela

Vela ([github.com/proresin382-cpu/vela](https://github.com/proresin382-cpu/vela)
+ [tryvela.io](https://tryvela.io)) is an operations platform for
AI agencies by a junior solo founder. Repo created 2026-05-09 (8
days), 12 commits, 0 stars, single-vendor Gemini 2.5 Flash, no
license file, "© 2026 GitHub, Inc." footer artifact (an
unprofessional template residue), 3-tier sales pricing
($49 / $99 / $199 per month), 0 tests, 0 benchmarks, 0 papers, 0
testimonials.

Apohara's contrast: clean Apache-2.0 LICENSE file plus
`THIRD_PARTY_NOTICES.md`, real PyPI-publishable middleware
([`apohara-langchain`](https://github.com/SuarezPM/apohara-aegis/tree/main/integrations/apohara-langchain)
and
[`apohara-crewai`](https://github.com/SuarezPM/apohara-aegis/tree/main/integrations/apohara-crewai)),
AGPL-licensed runtime governance bridge
([Apohara-Guard](https://github.com/SuarezPM/Apohara-Guard)), and a
substance-first README that links the paper, the verdict-vault
chain, and the latency logs rather than a pricing table.

---

## vs Trusyn

Trusyn ([github.com/Trusyn-AI/trusyn-ai](https://github.com/Trusyn-AI/trusyn-ai)
+ [trusyn-public.vercel.app](https://trusyn-public.vercel.app)) is a
runtime trust layer for autonomous AI by an anonymous organization
(0 public members). Repo created 2026-05-13 (4 days), 5 commits on
`master`, the most polished structure of the four competitors
(CHANGELOG, ROADMAP, SECURITY, CODE_OF_CONDUCT, CONTRIBUTING,
NOTICE, RELEASE_NOTES_v0.1.0.md), Apache-2.0 license clean — but
the ensemble is Gemini multi-variant single-vendor, with 0 stars,
0 forks, 0 issues, 0 PRs, 0 visible tests, 0 benchmarks, 0
measurement data, and 0 papers.

Apohara's contrast: real multi-vendor adversarial defense (14
seats across 10+ providers including Gemini, Claude, GPT, DeepSeek,
Mistral, Grok, Perplexity, Kimi, GLM, Qwen, Nemotron, Big Pickle —
plus the reserved Mythos seat). Measured benchmarks back every
latency and accuracy claim
([`apohara-aegis/logs/`](https://github.com/SuarezPM/apohara-aegis/tree/main/logs)).
Paper on Zenodo with formal Z3 proof. Public Apache-2.0 history
and a verdict_vault HMAC chain that any reviewer can audit.

---

## The Mythos differential

None of the four competitors has a reserved adversarial seat for any
frontier model — they all run single-vendor or single-lineage
ensembles. **Activating Apohara's reserved Mythos slot would make
Apohara the only OSS defensive system in which Anthropic's latest
model adversarially reviews its own writer output inside a
multi-vendor consensus, bound by a formally proven judge-isolation
invariant.** That combination — interpretability signal (Claude
auditing Claude reasoning), adversarial heterogeneity (14 other
vendors voting alongside), and formal safety substrate
(INV-15 Z3-UNSAT) — is the strongest agentic safety signal
currently buildable in the open. The substrate is in place;
activation is a credentials issue, not an engineering one.
