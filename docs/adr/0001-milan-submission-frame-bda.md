# ADR 0001 — Milan AI Week 2026 submission framing: B + D + A híbrido

**Date:** 2026-05-19
**Status:** Accepted (Pablo, 2026-05-19 via ralplan consensus loop)
**Authors:** Pablo M. Suarez (decision owner); plan via ralplan Planner+Architect+Critic consensus

---

## Decision

Submit **Apohara CONSILIUM** to Milan AI Week 2026 (AI Agent Olympics Hackathon, Vultr track + Google secondary + Collaborative Systems tertiary) as a **NEW product separate from PROBANT** (TechEx submission, frozen).

Framing strategy: **B + D + A híbrido**:

- **B (tronco)** — *"Splunk for AI agents" / Agent Governance OS* — pitch core. 4-stage SOAR pipeline + 6 framework compliance dashboards + HMAC-SHA256 verdict chain + STIX 2.1.
- **D (módulo diferenciador)** — *CAICEP RFC 3161 evidence module* — tamper-evident verdict timestamps, roadmap to court-admissible attestation via eIDAS QTSP partnership Q3 2026 (Actalis Italia primary candidate).
- **A (tier de entrada)** — *OSS Apache-2.0 self-hosted box* — 9-vendor adversarial ensemble + 78-rule DJL + INV-15 Z3 formal proof. PLG funnel for B + D upsell.

Italian regulatory hook (deck slide 2): **DORA mandatory since 2025-01-17** (UniCredit + Intesa Sanpaolo G-SIBs) + **EU AI Act Art 14 enforceable 2026-08-02** (~75 days, penalties up to €35M / 7% global revenue).

---

## Drivers

1. **TechEx Apohara PROBANT** at apohara.dev is judging-frozen; cannot reuse the same brand surface for Milan without crossing the directive *"PROBANT brand stays anchored at apohara.dev; CONSILIUM separate product at apohara.io"*.
2. **Italian Milan jury** values DORA + EU AI Act applicability for regulated industries; Italian banking (UniCredit + Intesa) is the clearest enterprise-impact narrative.
3. **Honesty floor** (Apohara CLAUDE.md §3.3) requires shipping verified numbers (9-vendor adversarial, 6 frameworks mapped) — not inflated aspirational counts. The Perplexity strategic report's *$1.4B Cisco/Robust Intelligence* reference was caught in pre-flight fact-check as actually ~$350M (451 Research); removed from deck.
4. **10h hard budget** forces reuse: fork apohara-probant as base + adapt TechEx deck cover/slides 1-4 + 6 + 10 + 11 + 12 (preserve 5, 7, 8, 9 architecture/test-count content).
5. **Vendor independence (LiteLLM)** + **court-grade evidence (RFC 3161 TSA)** are roadmap differentiators worth platform investment now (LiteLLM parallel-deployed live + TSA additive field shipped to api.apohara.dev v0.1.0-tsa).

---

## Alternatives considered

| Alternative | Reason rejected |
|---|---|
| Submit Apohara PROBANT as-is to Milan | Same submission to two events = lazy + violates Pablo's "separate product" directive. Also TechEx judging still in progress. |
| Submit Apohara Context Forge | Theme fit weak (infra, not autonomous agents). Milan theme is "autonomous agents driving enterprise impact" — Context Forge is multi-agent infrastructure, not autonomous agents themselves. |
| Build new product from scratch in 10h | Guaranteed deadline miss; throws away vetted assets (PROBANT deck slides 5, 7, 8, 9 + SOAR pipeline + DJL + Z3 proof). |
| Vision A alone (Galileo+Lakera+INV-15 OSS box) | Too tactical — limits to "yet another OSS guardrail". Galileo launched Free Agent Reliability Platform Jul 2025 attacking this space frontally. Need more ambition. |
| Vision C alone (OS for multi-agent enterprises moonshot) | Too vague for jury in 5-min demo. Diligence already rankes #5 with concrete "adversarial five-agent pipeline" — concrete beats moonshot in hackathon context. |
| Vision D alone (CAICEP compliance-evidence pivot) | 3 regulatory trap-doors caught in critique: (1) eIDAS QTSP accreditation needed for "court-admissible" claim — 6-12 months + €50K-200K; (2) attestation-service structurally requires separate legal entity (auditor independence rules); (3) Tracient AI already moves in this exact space with SDK + DORA evidence pack — competitive pressure. |

---

## Why B+D+A híbrido chosen

- **Maximizes honest evidence-per-hour**. Each deliverable maps to a specific jury concern: deck = market framing (DORA+EU AI Act urgency), LiteLLM parallel = vendor independence roadmap (real, not vapor), TSA = court-grade evidence differentiation (live freetsa.org timestamps).
- **Covers 3 buyer tiers**: A (DevSecOps PLG funnel), B (CISO+CAIO+CCO joint buy), D (Chief Compliance Officer + General Counsel).
- **Italian-specific resonance**: DORA + EU AI Act + UniCredit/Intesa/Banca d'Italia/CONSOB/IVASS/ACN named in deck slide 2.
- **Honesty discipline preserved**: zero inflated claims (9-vendor canonical, 6 frameworks / 14 mapped controls, "tamper-evident + roadmap to court-admissible" not "court-admissible today", no $1.4B Cisco myth).

---

## Consequences

### Positive

- CONSILIUM exists as a real shipping product after 2026-05-19 (not vapor): GitHub repo, Apache-2.0 LICENSE, live PDF deck, RFC 3161 TSA shipped to api.apohara.dev v0.1.0-tsa, LiteLLM Docker compose parallel on droplet.
- apohara.io domain anchored as separate brand surface from apohara.dev (PROBANT).
- TSA capability lives in apohara-inti permanently — benefits future Apohara products too.
- LiteLLM Docker config tested + documented for future 30-day migration milestone.
- ADR + plan + progress.txt persist the decision context for future Pablo + future Claude sessions.

### Negative

- Two repos to maintain (apohara-consilium fork + ongoing apohara-probant patches). Fork drift if PROBANT evolves.
- LiteLLM Docker adds runtime complexity to droplet (4th process: postgres + redis + litellm; existing apohara-inti + Caddy already running).
- api.apohara.dev now serves CONSILIUM-flavored TSA endpoint despite being PROBANT brand surface — accepted shared-backend trade-off (Pablo's strategic choice during US-004 gate).

---

## Follow-ups (post-Milan)

| Timeline | Action |
|---|---|
| **30 days** | Migrate live LLM traffic OpenRouter → LiteLLM (vendor independence becomes live, not roadmap). |
| **60 days** | Add TSA Prometheus metrics dashboard panel. Evaluate Sectigo as second QTSP fallback. |
| **90 days** | Pursue eIDAS QTSP partnership (Actalis Italia primary candidate) for true court-admissible attestation. |
| **180 days** | Design partner conversations with UniCredit / Intesa Sanpaolo / BPER on CONSILIUM piloting. |
| **Tech debt** | Decide if apohara-probant + apohara-consilium share a common library or remain forks; if shared, extract `apohara-core` package. |
| **Operational** | Pablo rotate SSH passphrase + Vultr root password (per CLAUDE.local.md security-incident note). |

---

## Plan + artifacts

- **Plan**: `/home/linconx/Documentos/Apohara_Context_Forge/.omc/plans/consilium-milan-3deliverables.md` (RALPLAN-DR deliberate mode, 3 iterations Planner→Architect→Critic)
- **PRD**: `/home/linconx/Documentos/Apohara_Context_Forge/.omc/state/sessions/e42af5db-3ad3-42e5-ba05-b86b8120850b/prd.json` (6 user stories US-001..US-006)
- **Progress log**: `/home/linconx/Documentos/Apohara_Context_Forge/.omc/ralph/progress.txt`
- **Deck PDF**: `apohara-consilium/docs/submissions/pitch-deck-milan/apohara-consilium-milan-pitch.pdf`
- **LiteLLM deployment doc**: `apohara-consilium/docs/infra/litellm-parallel-deployment.md`
- **TSA tag**: `v0.1.0-tsa` (merge commit `c6907208`)

🤖 Drafted via Claude Code (Opus 4.7 1M ctx) ralplan + Ralph orchestration.
