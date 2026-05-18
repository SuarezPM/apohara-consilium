import type { Vendor } from "./types";

/**
 * The 12 attacker vendors that adversarially review the user-submitted code.
 * Order is load-bearing: it defines how the grid populates.
 *
 * Live status (2026-05-18 smoke): 7 producing votes (claude, gpt, deepseek, glm,
 * qwen, nemotron, mistral) + 5 fail-open (opencode_zen × 2 routing, kimi parse,
 * grok 404, perplexity 404). See JUDGE-FAQ.md Q1 for the honest disclosure.
 */
export const ATTACKER_VENDORS: Vendor[] = [
  {
    name: "Claude Opus 4.7",
    model: "anthropic/claude-opus-4-7",
    gateway: "opencode Zen",
    badge: "CL",
    seat: "claude-opus-47-seat",
  },
  {
    name: "GPT-5.5",
    model: "openai/gpt-5.5",
    gateway: "opencode Zen",
    badge: "GP",
    seat: "gpt-55-seat",
  },
  {
    name: "DeepSeek V4 Pro",
    model: "deepseek/deepseek-v4-pro",
    gateway: "OpenRouter",
    badge: "DS",
    seat: "deepseek-v4-seat",
  },
  {
    name: "MiniMax M2.7",
    model: "minimax/minimax-m2-7",
    gateway: "direct",
    badge: "MM",
    seat: "minimax-m27-seat",
  },
  {
    name: "Kimi K2.6",
    model: "moonshot/kimi-k2-6",
    gateway: "opencode Zen",
    badge: "KI",
    seat: "kimi-k26-seat",
  },
  {
    name: "GLM 5.1",
    model: "zhipu/glm-5-1",
    gateway: "opencode Zen",
    badge: "GL",
    seat: "glm-51-seat",
  },
  {
    name: "Qwen3.6 Plus",
    model: "qwen/qwen3-6-plus",
    gateway: "OpenRouter",
    badge: "QW",
    seat: "qwen36-plus-seat",
  },
  {
    name: "Nemotron 3 Super 120B",
    model: "nvidia/nemotron-3-super-120b",
    gateway: "OpenRouter",
    badge: "NV",
    seat: "nemotron-3-super-seat",
  },
  {
    name: "Big Pickle",
    model: "bigpickle/big-pickle",
    gateway: "opencode Zen",
    badge: "BP",
    seat: "big-pickle-seat",
  },
  {
    name: "Mistral Large 2411",
    model: "mistralai/mistral-large-2411",
    gateway: "OpenRouter",
    badge: "MT",
    seat: "mistral-large-seat",
  },
  {
    name: "Grok 2",
    model: "x-ai/grok-2-1212",
    gateway: "OpenRouter",
    badge: "GK",
    seat: "grok-2-seat",
  },
  {
    name: "Perplexity Sonar Large",
    model: "perplexity/llama-3.1-sonar-large-128k-online",
    gateway: "OpenRouter",
    badge: "PS",
    seat: "perplexity-sonar-seat",
  },
];
