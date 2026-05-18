# ADR-001: Rename "Apohara Inti" → "Apohara PROBANT" at the surface layer

**Date**: 2026-05-18
**Status**: Accepted

## Decision

Rename all user-visible, editorial, and documentation occurrences of "Apohara Inti" to
"Apohara PROBANT". Defer repo slug, service file, package name, DNS, and environment
variable renames to Phase 2.

## Rationale

"PROBANT" derives from Latin *probare* = to prove, test, verify. This is semantically
precise for a cross-AI code verifier that adversarially proves the safety of generated
code. "Inti" (Quechua sun-god) is poetic but opaque to a technical audience evaluating
a formal verification tool.

Sister projects (Context Forge, Guard, Aegis) retain their Quechua/Latin family names;
PROBANT fits the same naming family while making the product's purpose self-evident.

## Phase 1 scope (this ADR)

In-scope files touched: `README.md`, `packages/frontend/index.html`, all `.tsx` files
under `packages/frontend/src/`, `packages/backend/main.py` (docstring + FastAPI title),
`docs/submissions/*.md`, `docs/brand/asset-prompts.md`, `THIRD_PARTY_NOTICES.md`,
`.omc/notepad.md`.

## Phase 2 items (explicitly deferred)

- `pyproject.toml` package name (`apohara-inti-backend` stays)
- `packages/backend/main.py:~185` `allow_origin_regex` (Vercel origin pattern)
- GitHub repo URL (`github.com/SuarezPM/apohara-inti`)
- Service file name (`apohara-inti.service`)
- DNS strings (`api.apohara.dev`, `apohara.dev`)
- `.env` files and env-var names
- Log file names under `logs/`
- Python module file names (`apohara_inti_*`)
- Commit history and commit messages

Phase 2 promotion path: coordinate with GitHub repo rename + DNS TTL cutover in a
single atomic release after hackathon windows close.
