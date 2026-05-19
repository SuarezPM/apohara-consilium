# LiteLLM Parallel Deployment — Vendor Independence Roadmap

> **US-003** · Milan AI Week 2026 · Plan ref: `.omc/plans/consilium-milan-3deliverables.md`

LiteLLM (Apache-2.0, [github.com/BerriAI/litellm](https://github.com/BerriAI/litellm)) is deployed **in parallel** to the existing OpenRouter integration on the Apohara CONSILIUM production droplet. Traffic is NOT routed through it yet — this is a vendor-independence proof-of-architecture for the 30-day roadmap milestone.

## Why parallel-only (not traffic shift today)

Pablo's directive + Architect's "demo safety > narrative purity" principle (RALPLAN-DR Principle 2). The Milan AI Week demo critical path runs through the existing OpenRouter integration at `api.apohara.dev/v1/soar/*`. LiteLLM stays internal-only (port 4000 bound to 127.0.0.1, no Caddy route) so:

- Zero regression risk on the live demo
- Vendor-independence narrative is real and live (`docker compose ps` is evidence)
- Migration to LiteLLM-primary is a 30-day follow-up (planned, not rushed under deadline)

## What's deployed

| Component | Image | Pinned tag | Purpose |
|---|---|---|---|
| LiteLLM proxy | `ghcr.io/berriai/litellm` | `main-v1.78.5-stable` | OpenAI-compatible gateway for 9 vendors |
| Postgres | `postgres:16.4-alpine` | 16.4 | Spend tracking, virtual keys, audit log |
| Redis | `redis:7.4.1-alpine` | 7.4.1 | Rate-limit state shared across workers |

All on isolated Docker network `litellm-net`. Port 4000 bound to `127.0.0.1` only — NOT exposed via Caddy, NOT in the public reverse proxy.

## 9 vendor mappings

Same canonical list as the existing apohara-aegis OpenRouter integration:

| Model name | OpenRouter route |
|---|---|
| `deepseek-v4-pro` | `openrouter/deepseek/deepseek-v4-pro` |
| `kimi-k2.6` | `openrouter/moonshotai/kimi-k2.6` |
| `glm-5.1` | `openrouter/z-ai/glm-5.1` |
| `qwen3.6-plus` | `openrouter/qwen/qwen3.6-plus` |
| `nemotron-3-super-120b` | `openrouter/nvidia/nemotron-3-super-120b-a12b` |
| `gemini-3.1-pro-preview` | `openrouter/google/gemini-3.1-pro-preview` |
| `claude-opus-4.7-fast` | `openrouter/anthropic/claude-opus-4.7-fast` |
| `gpt-5.5` | `openrouter/openai/gpt-5.5` |
| `deepseek-v3.2-speciale` | `openrouter/deepseek/deepseek-v3.2-speciale` |

## File layout on droplet

```
/opt/apohara-litellm/
├── docker-compose.yml      # 3 services, pinned tags, healthchecks
├── litellm-config.yaml     # 9 model mappings + router settings
└── .env                    # secrets (chmod 600, NOT in git)
```

## Verify

```bash
ssh apohara-droplet
cd /opt/apohara-litellm
docker compose ps                           # all 3 healthy
curl -sS http://127.0.0.1:4000/health       # 200 OK
docker compose logs litellm | tail -20      # no errors
```

Existing critical path unaffected:

```bash
curl -sS https://api.apohara.dev/v1/soar/health    # 200 OK with baseline payload
```

## Rollback (zero impact on critical path)

```bash
ssh apohara-droplet
cd /opt/apohara-litellm
docker compose down -v        # stops + removes containers + postgres volume
```

Removes the parallel stack entirely. The `apohara-inti.service` (running at `127.0.0.1:8000`, proxied by Caddy to `api.apohara.dev`) is on a separate Docker network and separate systemd unit — completely isolated.

## 30-day migration plan (post-Milan)

1. Week 1: Route 5% of traffic through LiteLLM via per-vendor adapter shim in `apohara_aegis.openrouter_adapters`; measure latency parity vs direct OpenRouter calls.
2. Week 2: Increase to 25%; enable LiteLLM spend tracking dashboard for finance team.
3. Week 3: 50%; enable LiteLLM guardrails layer for prompt-injection defense overlap with existing DJL.
4. Week 4: 100% on LiteLLM; OpenRouter remains fallback in `router_settings.fallbacks`. End of 30-day milestone.

## References

- LiteLLM docs: https://docs.litellm.ai/
- LiteLLM benchmarks: 8ms P95 latency at 1k RPS (LiteLLM published, [berriai.github.io/litellm](https://berriai.github.io/litellm/))
- Apache-2.0 license: [github.com/BerriAI/litellm/blob/main/LICENSE](https://github.com/BerriAI/litellm/blob/main/LICENSE)
