// SPDX-License-Identifier: Apache-2.0
// US-88 — Settings Page (Apohara PROBANT Fusion Sprint 2026-05-18)
// Single-column form persisted to localStorage:
//   apohara.settings.apiUrl     — API URL override (default: https://api.apohara.dev)
//   apohara.settings.pollMs     — Polling interval ms
//   apohara.settings.byokGeminiKey — BYOK Gemini key (TryItPanel only)
// Theme: Apohara default only (locked).
// No new npm dependencies.
import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "./DashboardLayout";

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const KEY_API_URL = "apohara.settings.apiUrl";
const KEY_POLL_MS = "apohara.settings.pollMs";
const KEY_BYOK = "apohara.settings.byokGeminiKey";

const DEFAULT_API_URL = "https://api.apohara.dev";
const DEFAULT_POLL_MS = "30000";

// ---------------------------------------------------------------------------
// Poll interval options
// ---------------------------------------------------------------------------

const POLL_OPTIONS: { label: string; value: string }[] = [
  { label: "5 s", value: "5000" },
  { label: "15 s", value: "15000" },
  { label: "30 s (default)", value: "30000" },
  { label: "60 s", value: "60000" },
  { label: "Manual", value: "0" },
];

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div
      className="fixed bottom-6 right-6 px-4 py-2 rounded font-mono text-[11px] transition-opacity"
      style={{
        backgroundColor: "var(--apohara-lime)",
        color: "var(--apohara-dark)",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded border p-5"
      style={{
        borderColor: "hsl(var(--border))",
        backgroundColor: "var(--apohara-bg-raised)",
      }}
    >
      <p
        className="font-pixel-sans text-[10px] mb-4"
        style={{ color: "var(--apohara-lime)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field label
// ---------------------------------------------------------------------------

function FieldLabel({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="mb-1.5">
      <p
        className="font-mono text-[11px]"
        style={{ color: "var(--apohara-bone)" }}
      >
        {label}
      </p>
      {sublabel && (
        <p
          className="font-mono text-[10px]"
          style={{ color: "var(--apohara-bone)", opacity: 0.45 }}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [pollMs, setPollMs] = useState(DEFAULT_POLL_MS);
  const [byokKey, setByokKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setApiUrl(localStorage.getItem(KEY_API_URL) ?? DEFAULT_API_URL);
    setPollMs(localStorage.getItem(KEY_POLL_MS) ?? DEFAULT_POLL_MS);
    setByokKey(localStorage.getItem(KEY_BYOK) ?? "");
  }, []);

  function showToast(msg: string) {
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2500);
    // We don't actually use msg in state — we hardcode in the Toast node below.
    // Keep this param for future extension.
    void msg;
  }

  function handleSave() {
    localStorage.setItem(KEY_API_URL, apiUrl.trim() || DEFAULT_API_URL);
    localStorage.setItem(KEY_POLL_MS, pollMs);
    if (byokKey.trim()) {
      localStorage.setItem(KEY_BYOK, byokKey.trim());
    } else {
      localStorage.removeItem(KEY_BYOK);
    }
    showToast("Saved");
  }

  function handleReset() {
    localStorage.removeItem(KEY_API_URL);
    localStorage.removeItem(KEY_POLL_MS);
    localStorage.removeItem(KEY_BYOK);
    setApiUrl(DEFAULT_API_URL);
    setPollMs(DEFAULT_POLL_MS);
    setByokKey("");
    showToast("Reset");
  }

  return (
    <DashboardLayout title="Settings">
      <div className="p-6">
        <div className="mb-6">
          <h2
            className="font-pixel-sans text-sm mb-1"
            style={{ color: "var(--apohara-bone)" }}
          >
            Dashboard Settings
          </h2>
          <p
            className="font-mono text-xs"
            style={{ color: "var(--apohara-bone)", opacity: 0.5 }}
          >
            Persisted to{" "}
            <code>localStorage</code> — never sent to any server.
          </p>
        </div>

        <div className="max-w-xl space-y-5">
          {/* API URL override */}
          <Section title="API Endpoint">
            <FieldLabel
              label="API URL"
              sublabel="Override the base URL for all dashboard API calls."
            />
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={DEFAULT_API_URL}
              className="w-full font-mono text-[11px] px-3 py-2 rounded border bg-transparent outline-none"
              style={{
                borderColor: "hsl(var(--border))",
                color: "var(--apohara-bone)",
              }}
            />
            <p
              className="font-mono text-[10px] mt-1"
              style={{ color: "var(--apohara-bone)", opacity: 0.35 }}
            >
              Key: <code>{KEY_API_URL}</code> · default:{" "}
              <code>{DEFAULT_API_URL}</code>
            </p>
          </Section>

          {/* Polling interval */}
          <Section title="Polling Interval">
            <FieldLabel
              label="Poll every…"
              sublabel="Controls how often dashboard sections refresh from the API."
            />
            <div className="flex flex-wrap gap-2">
              {POLL_OPTIONS.map((opt) => {
                const active = pollMs === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPollMs(opt.value)}
                    className="rounded border px-3 py-1.5 font-mono text-[11px] transition-colors"
                    style={{
                      borderColor: active
                        ? "var(--apohara-lime)"
                        : "hsl(var(--border))",
                      backgroundColor: active
                        ? "rgba(37,177,63,0.10)"
                        : "transparent",
                      color: active
                        ? "var(--apohara-lime)"
                        : "var(--apohara-bone)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p
              className="font-mono text-[10px] mt-2"
              style={{ color: "var(--apohara-bone)", opacity: 0.35 }}
            >
              Key: <code>{KEY_POLL_MS}</code> · current: {pollMs} ms
              {pollMs === "0" ? " (manual refresh only)" : ""}
            </p>
          </Section>

          {/* Theme (locked) */}
          <Section title="Theme">
            <FieldLabel label="Color theme" />
            <div
              className="flex items-center gap-3 px-3 py-2 rounded border"
              style={{
                borderColor: "hsl(var(--border))",
                backgroundColor: "var(--apohara-bg-mid)",
              }}
            >
              <span
                className="font-mono text-[11px]"
                style={{ color: "var(--apohara-bone)" }}
              >
                Apohara default
              </span>
              <span
                className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  backgroundColor: "var(--apohara-bg-raised)",
                  color: "var(--apohara-bone)",
                  opacity: 0.5,
                }}
              >
                locked
              </span>
            </div>
            <p
              className="font-mono text-[10px] mt-1"
              style={{ color: "var(--apohara-bone)", opacity: 0.35 }}
            >
              Multi-theme coming in v1.1
            </p>
          </Section>

          {/* BYOK Gemini key */}
          <Section title="BYOK — Gemini API Key">
            <FieldLabel
              label="Gemini API key"
              sublabel="Used by the Hero TryItPanel only. Optional."
            />
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={byokKey}
                onChange={(e) => setByokKey(e.target.value)}
                placeholder="AIza…"
                className="w-full font-mono text-[11px] px-3 py-2 rounded border bg-transparent outline-none pr-16"
                style={{
                  borderColor: "hsl(var(--border))",
                  color: "var(--apohara-bone)",
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] px-2 py-0.5 rounded"
                style={{
                  color: "var(--apohara-bone)",
                  opacity: 0.5,
                }}
              >
                {showKey ? "hide" : "show"}
              </button>
            </div>
            <div
              className="mt-2 px-3 py-2 rounded font-mono text-[10px]"
              style={{
                backgroundColor: "rgba(180,83,9,0.08)",
                color: "#b45309",
                border: "1px solid rgba(180,83,9,0.3)",
              }}
            >
              Security: stored in <code>localStorage</code> only — never sent
              to <code>apohara.dev</code> servers. Used solely for client-side
              Gemini calls from TryItPanel.
              <br />
              Key: <code>{KEY_BYOK}</code>
            </div>
          </Section>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 rounded py-2.5 font-pixel-sans text-[11px] transition-colors"
              style={{
                backgroundColor: "var(--apohara-lime)",
                color: "var(--apohara-dark)",
              }}
            >
              Save settings
            </button>
            <button
              onClick={handleReset}
              className="rounded px-4 py-2.5 font-pixel-sans text-[11px] border transition-colors"
              style={{
                borderColor: "hsl(var(--border))",
                color: "var(--apohara-bone)",
                backgroundColor: "transparent",
              }}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>

      <Toast message="Saved" visible={toastVisible} />
    </DashboardLayout>
  );
}
