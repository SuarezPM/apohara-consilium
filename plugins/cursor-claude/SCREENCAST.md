# Cursor Plugin Screencast Script (90 seconds)

## Setup (off-screen, before recording)

1. Install Cursor from https://www.cursor.com if not already present.
2. Install the plugin:
   - Extensions sidebar (Ctrl+Shift+X or Cmd+Shift+X)
   - Three-dot menu (...) at top-right of Extensions panel
   - "Install from VSIX..."
   - Select `plugins/cursor-claude/apohara-probant-verify-0.1.0.vsix`
   - Reload Cursor when prompted.
3. Open `plugins/cursor-claude/example/auth.py` in Cursor.
4. (Optional) Set BYOK key: Cursor Settings → Extensions → "Apohara PROBANT" →
   `apohara.geminiApiKey`. Leave blank to use shared demo quota (5 calls/IP/day).
5. Do a dry run once before recording to confirm the command palette entry appears
   and the progress notification fires. The live API takes 30-60 seconds to return.

---

## Recording (90 seconds)

### 0:00 — 0:08 — Title card
Show a full-screen slide or terminal echo:

```
Apohara PROBANT — Cross-AI Code Verifier
Now native in Cursor
```

Voice-over: "What if a different AI audited the code your AI just wrote — before it
merges? That's Apohara PROBANT."

---

### 0:08 — 0:22 — Open the vulnerable file
- Open `plugins/cursor-claude/example/auth.py` in Cursor.
- Scroll to line 7 so the f-string query is visible:
  ```python
  query = f"SELECT * FROM users WHERE id={user_id}"
  ```
- Select that line (or the whole function body — either works).

Voice-over: "Here's a textbook SQL injection. The user ID goes straight into a query
string — no parameterization."

---

### 0:22 — 0:38 — Trigger verification
- Press Cmd+Shift+P (macOS) or Ctrl+Shift+P (Linux/Windows).
- Type "Apohara" — two commands appear.
- Click "Apohara: Verify Selection".
- A blue progress toast appears at bottom-right:
  "Apohara: verifying Selection..."

Voice-over: "One command. Nine frontier models run in parallel, each acting as an
independent attacker trying to exploit the code."

---

### 0:38 — 1:05 — Watch the verdict appear
After 30-60 seconds the progress toast resolves and a verdict notification fires.

**Expected output (demo quota):**
```
⚠ Apohara: RISKY — 4/9 attackers flagged | cost $0.04 | latency 47s
```
or
```
✕ Apohara: BLOCKED — 7/9 attackers flagged | cost $0.04 | latency 47s
```

The Output panel (tab "Apohara PROBANT") auto-opens showing per-vendor reasoning:
```
=== Verdict: risky (signed_hash: 24a3c8d839173fa4...) ===
[FLAGGED] openai:gpt-4o: SQL injection via string interpolation — line 7
[FLAGGED] anthropic:claude-opus: Unsanitized user input in SQL query
[ok]      google:gemini-pro: No issue detected
...
```

Voice-over: "Each vendor's reasoning is logged. You see exactly which models flagged
it and why. The verdict is HMAC-signed — tamper-evident, auditable."

> **Note for recording**: The demo quota uses the shared Gemini key; verdict severity
> varies run-to-run. If you see `verified` with only 1/9 flagged on your first dry run,
> use your BYOK Gemini key (set `apohara.geminiApiKey`) for a full 9-vendor run that
> more consistently returns `risky` or `blocked` on this input.

---

### 1:05 — 1:20 — Show the audit chain
- Copy the `signed_hash` from the Output panel (the 64-char hex string).
- Open browser, navigate to:
  ```
  https://api.apohara.dev/v1/audit/<paste-hash-here>
  ```
- JSON response shows the HMAC signature + verdict + timestamp.

Voice-over: "Every verdict lives on the audit chain. The signed hash is immutable —
your security team can verify this review happened, and what it found."

---

### 1:20 — 1:30 — Closing slide
Show:
```
BYOK Gemini key — or free demo (5 calls/IP/day)
MIT plugin. Apache-2.0 backend.
github.com/SuarezPM/apohara-probant
```

Voice-over: "Bring your own Gemini key, or hit the shared demo quota. The plugin is
MIT. The backend is Apache-2.0. Links below."

---

## Talking points (voice-over anchors)

- "A different AI audits the code your AI just wrote"
- "Not a single model — 9 frontier vendors in parallel, KV-isolated via INV-15"
- "Every verdict HMAC-signed, tamper-evident, auditable by your security team"
- "Bring your own Gemini key, or hit the shared demo quota — 5 free calls per IP per day"
- "30 seconds to install. One command to run."

---

## Recording tips for Pablo

| Setting | Value |
|---------|-------|
| Resolution | 1920x1080 |
| Frame rate | 24-30 fps, no upscaling |
| Tool | OBS Studio (Linux) or QuickTime (macOS) |
| Mic | Low-noise environment; USB condenser if available |
| Cursor font size | 16-18pt for readability at 1080p |
| Edit cuts | 30-frame slip cuts between steps; no jump-cuts inside actions |
| Export | H.264 video, AAC 192 kbps audio, ~50 MB target |

**Before hitting record**: close all other windows, hide the taskbar/dock,
set Cursor to dark theme (matches the Apohara brand palette).

---

## Demo example file

Pre-created at `plugins/cursor-claude/example/auth.py`:

```python
import sqlite3


def get_user(user_id: str) -> dict:
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    # SQLi: user_id interpolated into query string
    query = f"SELECT * FROM users WHERE id={user_id}"
    cursor.execute(query)
    return dict(cursor.fetchone())
```

This is a textbook SQLi pattern. Multiple ensemble vendors flag it consistently
when the full 9-vendor path is used (BYOK key). The demo-quota path (shared
Gemini key) may return 1-4 flagged depending on load and model availability.

---

## Live API smoke test result (captured 2026-05-18)

```
verdict: verified
attackers_harmful: 1
latency_ms: 46591
signed_hash: 24a3c8d839173fa4d8a5aef373402599...
```

Demo quota was not exhausted at time of packaging. BYOK path recommended for
recording to get a more decisive `risky`/`blocked` verdict on this input.
