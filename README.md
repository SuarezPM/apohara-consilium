<p align="center">
  <img src="packages/frontend/public/logo.svg" alt="Apohara CONSILIUM shield" width="180">
</p>

<h1 align="center">APOHARA · CONSILIUM</h1>

<p align="center">
  <strong>The Agent Governance OS for Autonomous AI in Regulated Industries.</strong><br>
  <em>9-vendor adversarial ensemble · INV-15 formal proof (Z3 UNSAT, 10.08ms) · HMAC-SHA256 + RFC 3161 verdict chain · STIX 2.1 export · 6 compliance frameworks mapped.</em>
</p>

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.20277875"><img src="https://img.shields.io/badge/DOI-10.5281%2Fzenodo.20277875-1A73E8?style=flat-square&logo=doi&logoColor=white" alt="DOI: 10.5281/zenodo.20277875 (v3)"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-2ECC71.svg?style=flat-square" alt="License Apache 2.0"></a>
  <a href="https://github.com/SuarezPM/apohara-probant"><img src="https://img.shields.io/badge/derived--from-apohara--probant-7F7F7F.svg?style=flat-square" alt="Derived from apohara-probant"></a>
</p>

<p align="center">
  <strong>🇮🇹 Milan AI Week 2026 · Vultr track · DORA Art. 9/12/13 + EU AI Act Art. 14 Aug-2026 ready</strong>
</p>

---

## What is CONSILIUM?

**CONSILIUM** (Latin: *council / deliberation*) is a 3-tier governance platform for autonomous AI agents operating in regulated industries (finance, healthcare, legal, government).

- **Tier A — OSS entry (Apache-2.0):** 9-vendor adversarial ensemble · 78-rule deterministic judge layer (DJL) · INV-15 Z3 formal proof. Self-hosted, free, drop-in.
- **Tier B — Governance OS core ("Splunk for AI agents"):** 4-stage SOAR pipeline (DETECT → JUDGE → ENFORCE → FORENSICS) · live compliance dashboards (EU AI Act, NIST AI RMF, ISO 42001, SOC 2, GDPR, NIST 800-53) · HMAC-SHA256 verdict chain · STIX 2.1 incident export.
- **Tier D — CAICEP module (Continuous AI Compliance Evidence Platform):** RFC 3161 TSA-timestamped verdict chain · article-by-article EU AI Act dashboard · regulatory snapshot export · *roadmap to court-admissible attestation Q3 2026 via eIDAS QTSP partnership (Actalis Italia primary candidate).*

## Why now (Italian regulatory urgency)

- **DORA** (Digital Operational Resilience Act) — mandatory since **2025-01-17** for 22K+ EU financial entities. UniCredit + Intesa Sanpaolo (Italian G-SIBs) need automated ICT risk evidence at scale. Articles 9, 12, 13 require auditable records of every automated process.
- **EU AI Act Article 14** (human oversight for high-risk AI systems) — fully enforceable **2026-08-02** (~75 days). Penalties up to €35M or 7% of global annual turnover.
- **Italian regulators:** Banca d'Italia, CONSOB, IVASS, ACN (Agenzia per la Cybersicurezza Nazionale) — Garante Privacy alone has issued €45M+ in GDPR fines.

## What's in this repo

- `packages/backend/` — FastAPI service (`/v1/soar/*`, `/v1/audit/*`, `/v1/verify`), HMAC-SHA256 verdict chain, RFC 3161 TSA integration ([feature branch `feature/tsa-rfc3161`](https://github.com/SuarezPM/apohara-inti/tree/feature/tsa-rfc3161))
- `packages/frontend/` — React + Vite UI (governance dashboards)
- `packages/frontend-nextjs/` — Next.js app shell for the dashboard suite
- `scripts/` — `check_honesty_consilium.sh` (banned-string CI gate), `check_brand_fusion.sh`, `check_submission_lengths.sh`
- `docs/submissions/pitch-deck-milan/` — Milan AI Week 2026 pitch deck (B+D+A frame)
- `docs/infra/` — LiteLLM parallel deployment notes (vendor-independence roadmap)
- `docs/adr/` — Architectural decision records
- `docs/README-probant-legacy.md` — preserved historical README from the apohara-probant fork base

## Roadmap

| Timeline | Milestone |
|---|---|
| **30 days** | Migrate live LLM traffic from OpenRouter → LiteLLM (Apache-2.0, self-hosted, 8ms P95 at 1k RPS) for full vendor independence |
| **90 days** | Sign eIDAS QTSP partnership (Actalis Italia primary) to upgrade RFC 3161 timestamps to legally binding qualified timestamps under EU Regulation 910/2014 |
| **180 days** | Design partner conversations with UniCredit, Intesa Sanpaolo, BPER for CONSILIUM piloting on regulated AI agent workflows |

## Reference paper

> Suarez, P. M. (2026). *INV-15: A Formal Safety Invariant for Multi-Agent LLM Judge Pipelines.* Zenodo. [10.5281/zenodo.20277875](https://doi.org/10.5281/zenodo.20277875)

12 references, Z3 SMT proof (UNSAT 10.08ms ±0.5), MI300X-grounded benchmarks.

## License + attribution

Apache-2.0. CONSILIUM is a separate product from [Apohara PROBANT](https://github.com/SuarezPM/apohara-probant) (cross-AI code verifier, anchored at apohara.dev). Both maintained by Pablo M. Suarez (UNT, Argentina). This repository is derived from the apohara-probant codebase under Apache-2.0; the legacy PROBANT README is preserved at `docs/README-probant-legacy.md` for historical reference.

## Contact

Pablo M. Suarez — `dimensionequix@gmail.com` · GitHub [@SuarezPM](https://github.com/SuarezPM)
