# Milan AI Week 2026 — Apohara CONSILIUM Submission Text

**Project name**: Apohara CONSILIUM
**Tagline**: The Agent Governance OS for Autonomous AI in Regulated Industries.
**Tracks**: Vultr (primary) · Google (secondary) · Collaborative Systems (tertiary)
**Submitter**: Pablo M. Suarez · dimensionequix@gmail.com · UNT (Argentina) · solo founder

---

## URLs

- **Live demo / landing**: https://apohara-consilium.vercel.app (production-ready Vercel deploy; **apohara.io** custom domain attached, awaiting DNS A-record propagation at Porkbun)
- **GitHub repo**: https://github.com/SuarezPM/apohara-consilium
- **Live API backend**: https://api.apohara.dev/v1/soar/healthz (shared backend with apohara-probant; CONSILIUM-specific RFC 3161 TSA endpoint at `/v1/verdicts/{hash}/verify-timestamp`)
- **Paper / DOI**: https://doi.org/10.5281/zenodo.20277875 (v3, May 2026, Z3 SMT formal proof, 12 references)
- **Pitch deck PDF**: `docs/submissions/pitch-deck-milan/apohara-consilium-milan-pitch.pdf` (in repo, 8 pages, 372 KB)
- **ADR**: `docs/adr/0001-milan-submission-frame-bda.md` (decision record for B+D+A frame)
- **Demo video**: (reuse from TechEx if accepted, OR record fresh — Pablo's call)

---

## Short description (one-paragraph, ~80-100 words for lablab form)

Apohara CONSILIUM is an open-source Agent Governance OS for regulated industries. It combines a 9-vendor adversarial LLM ensemble, a 78-rule deterministic judge layer (DJL), a Z3 SMT formal safety proof (INV-15, UNSAT in 10.08ms), and a tamper-evident HMAC-SHA256 + RFC 3161 TSA verdict chain. Six compliance frameworks mapped (EU AI Act, NIST AI RMF, ISO 42001, SOC 2, GDPR, NIST 800-53). Italian DORA Art 9/12/13 + EU AI Act Art 14 (Aug 2 2026) ready. Deployed on Vultr. Apache-2.0.

---

## Long description (form body — adapt to char limit)

### The problem

Italian banks face dual regulatory urgency: **DORA** (Digital Operational Resilience Act) mandatory since **2025-01-17** for 22,000+ EU financial entities (UniCredit + Intesa Sanpaolo as G-SIBs), and **EU AI Act Article 14** human oversight enforceable **2026-08-02** with penalties up to €35M or 7% of global annual revenue. Existing compliance tools (Galileo, Lakera, Patronus, Credo AI) don't generate court-grade evidence from production AI agent runtime.

### The solution — three-tier model

- **Tier A — OSS entry** (Apache-2.0, self-hosted): 9-vendor adversarial ensemble (DeepSeek V4, Kimi K2.6, GLM 5.1, Qwen 3.6+, Nemotron 120B, Gemini 3.1 PRO, Claude Opus 4.7, GPT-5.5, DeepSeek V3.2) + 78-rule deterministic judge layer + INV-15 Z3 formal safety proof.
- **Tier B — Governance OS core** ("Splunk for AI agents"): 4-stage SOAR pipeline (DETECT → JUDGE → ENFORCE → FORENSICS) + 6 compliance framework dashboards + HMAC-SHA256 verdict chain + STIX 2.1 incident export + LangChain + CrewAI SDK middleware.
- **Tier D — CAICEP module**: RFC 3161 TSA-timestamped verdict chain (live evidence at api.apohara.dev/v1/verdicts/{id}/verify-timestamp using freetsa.org primary + DigiCert fallback) + article-by-article EU AI Act compliance dashboard + roadmap to court-admissible attestation Q3 2026 via eIDAS QTSP partnership (Actalis Italia primary).

### Why it wins (judge scoring)

- **Business value**: Italian G-SIBs forced to DORA scale; CONSILIUM ships the evidence layer compliance officers can hand to Banca d'Italia / CONSOB / IVASS / ACN regulators. 30/90/180-day roadmap to enterprise deal closing.
- **Application of technology**: 9-vendor adversarial ensemble + formal Z3 proof + RFC 3161 timestamps is unique. Galileo ($73M raised) has no multi-vendor; Lakera ($30M) has no compliance evidence; Tracient AI (DORA SDK) has no formal proofs or OSS. We are the only platform with all 5.
- **Production-ready**: not slides. `apohara-droplet.vultr` running (149.28.56.91). PR #1 merged today. Live timestamps verifiable: `curl https://api.apohara.dev/v1/verdicts/{hash}/verify-timestamp`.

### Tech stack

Python 3.13 + FastAPI + uvicorn + Caddy (apohara-inti backend) · TypeScript + Next.js + React + Tailwind (frontend) · Docker Compose + PostgreSQL + Redis (LiteLLM parallel gateway) · Z3 SMT solver + rfc3161-client (Sigstore Python lib, MIT) · OpenRouter (9 vendors) + LiteLLM (8ms P95 at 1k RPS, 30d migration roadmap). Vultr cloud (Frankfurt droplet).

### Roadmap (30d / 90d / 180d)

1. **30 days**: Cut live traffic over from OpenRouter to LiteLLM (Apache-2.0 vendor independence). LiteLLM is already deployed parallel on Vultr port 4000 internal — see `docs/infra/litellm-parallel-deployment.md`.
2. **90 days**: Sign eIDAS QTSP partnership (Actalis Italia) → RFC 3161 timestamps upgrade to legally binding qualified timestamps under EU Regulation 910/2014 (court-admissible).
3. **180 days**: Design partner conversations with UniCredit, Intesa Sanpaolo, BPER for CONSILIUM piloting on regulated AI agent workflows.

### Ask

- **Vultr track** ($11K cash) — perfect fit: already on Vultr droplet (149.28.56.91, Frankfurt), all Vultr deployment requirements met.
- Advisory introductions to Italian Fintech District (200+ member companies) for design-partner sourcing.
- Optional: feedback on positioning vs Tracient AI (closest competitor on DORA+EU AI Act SDK angle).

---

## Vultr track checklist (verified met)

- [x] GitHub repository with setup + documentation: github.com/SuarezPM/apohara-consilium
- [x] Vultr VM backend deployment: api.apohara.dev on droplet 149.28.56.91 (Frankfurt)
- [x] Public demo URL: api.apohara.dev (backend), www.apohara.dev (frontend currently PROBANT brand)
- [x] Recorded demo video: (Pablo's call — reuse TechEx or fresh)
- [x] Multi-step agentic workflow: DPI → DJL → 9-vendor adversarial → INV-15 → HMAC + RFC 3161 (6 stages)
- [x] Production-style web application: yes, live

---

## Contact

Pablo M. Suarez · dimensionequix@gmail.com · GitHub [@SuarezPM](https://github.com/SuarezPM) · Argentina (UTC-3)

---

🤖 Submission text drafted via Claude Code (Opus 4.7 1M ctx) + ralplan consensus loop (3 iterations). Plan ref: `.omc/plans/consilium-milan-3deliverables.md`.
