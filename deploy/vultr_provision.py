#!/usr/bin/env python3
"""Vultr provisioning script for the Apohara Inti TechEx 2026 backend demo.

Provisions a single $6/mo (1 vCPU / 2 GB / 50 GB) cloud-compute instance in
the New York (``ewr``) region, attaches a cloud-init user-data script that
bootstraps Caddy + uvicorn + the Inti FastAPI backend, and prints the
public URL.

Idempotent: if an instance already exists tagged with ``TAG``
(``apohara-inti-techex2026-demo``), the script returns its existing IP
without provisioning a second box.

Usage::

    # Provision (or report existing instance).
    VULTR_API_KEY=... INTI_SSH_PUBKEY="ssh-ed25519 ..." \\
      python3 deploy/vultr_provision.py

    # Tear down (destroys the tagged instance, irreversible).
    VULTR_API_KEY=... python3 deploy/vultr_provision.py --destroy

API reference: https://www.vultr.com/api/
Auth: ``Authorization: Bearer $VULTR_API_KEY`` header on every request.

Honesty contract: this script does NOT store the API key anywhere. It
reads from the ``VULTR_API_KEY`` env var only and aborts if absent.

Security posture (Day-6 hardening, derived from apohara-aegis Day-5):
  - Root password login is disabled; root SSH is disabled.
  - A non-root sudoer ``inti`` is created with a single SSH pubkey
    read from the INTI_SSH_PUBKEY env var. If unset the provisioner
    aborts BEFORE any Vultr API call — no silent password-auth fallback.
  - Vendor API keys (OPENROUTER, OPENCODE_ZEN, MINIMAX, GROQ, NVIDIA,
    ANTHROPIC) are substituted from env at provision time and live ONLY
    in the base64-encoded user_data blob + the 0600 root:root .env file
    on the box. Empty keys propagate to the .env unchanged (the
    corresponding adapter returns path='unavailable' at runtime and the
    EnsembleJudge tally excludes it).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Optional

try:
    import requests
except ImportError:
    print(
        "ERROR: `requests` not installed. Run:\n"
        "    pip install requests\n"
        "or:\n"
        "    sudo apt install python3-requests",
        file=sys.stderr,
    )
    sys.exit(2)


# ---------------------------------------------------------------------------
# Configuration constants
# ---------------------------------------------------------------------------

API_BASE = "https://api.vultr.com/v2"

# Vultr identifiers (validated on 2026-05-14 via apohara-aegis Day-5):
#   region "ewr"  = Piscataway, NJ (New York metro)
#   plan   "vc2-1c-2gb" = 1 vCPU / 2 GB / 50 GB, ~$6/mo
#   os_id  2284  = Ubuntu 24.04 LTS x64
REGION = "ewr"
PLAN = "vc2-1c-2gb"
OS_ID = 2284

# Tag used for idempotency.
TAG = "apohara-inti-techex2026-demo"
LABEL = "apohara-inti-demo"
HOSTNAME = "inti-demo"


# ---------------------------------------------------------------------------
# Vultr API helpers
# ---------------------------------------------------------------------------


def _auth_headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _api(
    method: str,
    path: str,
    api_key: str,
    *,
    json_body: Optional[dict] = None,
    expect_status: tuple[int, ...] = (200, 201, 202, 204),
) -> dict[str, Any]:
    """Call the Vultr API. Returns parsed JSON or empty dict on 204."""
    url = f"{API_BASE}{path}"
    resp = requests.request(
        method,
        url,
        headers=_auth_headers(api_key),
        data=json.dumps(json_body) if json_body is not None else None,
        timeout=30,
    )
    if resp.status_code not in expect_status:
        raise RuntimeError(
            f"Vultr API {method} {path} returned {resp.status_code}:\n"
            f"{resp.text}"
        )
    if resp.status_code == 204 or not resp.text:
        return {}
    return resp.json()


def find_instance_by_tag(api_key: str, tag: str) -> Optional[dict]:
    """Return the first instance carrying ``tag``, else None."""
    data = _api("GET", "/instances", api_key)
    for inst in data.get("instances", []):
        tags = inst.get("tags") or []
        if tag in tags:
            return inst
    return None


def _mask(secret: str) -> str:
    """Redacted preview of a secret for logging (first 4 + last 4)."""
    if not secret:
        return "<empty>"
    if len(secret) <= 8:
        return "*" * len(secret)
    return f"{secret[:4]}...{secret[-4:]} ({len(secret)} chars)"


# ---------------------------------------------------------------------------
# Cloud-init substitution
# ---------------------------------------------------------------------------

# Hard-required: would lock the operator out of the box.
HARD_REQUIRED_ENVS = ("INTI_SSH_PUBKEY",)

# Soft-required: deploy still serves /health but the 9-vendor ensemble
# degrades to fewer active members for any unset key.
SOFT_REQUIRED_ENVS = (
    "OPENROUTER_API_KEY",
    "OPENCODE_ZEN_API_KEY",
    "MINIMAX_API_KEY",
    "ANTHROPIC_API_KEY",
)

# Optional: secondary-tier adapters; empty is acceptable.
OPTIONAL_ENVS = ("GROQ_API_KEY", "NVIDIA_API_KEY")


def load_user_data() -> str:
    """Read deploy/cloud-init.yaml and substitute operator env vars.

    Returns the substituted YAML as a string. Aborts if INTI_SSH_PUBKEY
    is unset (the only hard-required envvar — without it the box
    locks the operator out).

    Empty vendor keys propagate to the .env file unchanged; the
    backend's fail-open path ensures the deploy stays serviceable but
    the ensemble is honestly degraded.
    """
    path = Path(__file__).resolve().parent / "cloud-init.yaml"
    if not path.exists():
        raise FileNotFoundError(
            f"cloud-init.yaml not found at {path}. "
            f"This script expects it next to itself."
        )

    raw = path.read_text(encoding="utf-8")

    pubkey = os.environ.get("INTI_SSH_PUBKEY", "").strip()
    if not pubkey:
        raise RuntimeError(
            "INTI_SSH_PUBKEY env var is not set. The cloud-init template "
            "disables root login + password auth, so without an SSH "
            "pubkey you would lock yourself out of the box.\n"
            "Fix:\n"
            "    export INTI_SSH_PUBKEY=\"$(cat ~/.ssh/id_ed25519.pub)\"\n"
            "Then re-run this script."
        )

    # Resolve all vendor keys (soft + optional). Empty is allowed.
    vendor_keys: dict[str, str] = {}
    for env in SOFT_REQUIRED_ENVS:
        vendor_keys[env] = os.environ.get(env, "").strip()
    for env in OPTIONAL_ENVS:
        vendor_keys[env] = os.environ.get(env, "").strip()

    # CORS origins for the deployed Vercel/Netlify frontend. Honored
    # by main.py via the APOHARA_INTI_CORS_ORIGINS env var.
    cors_origins = os.environ.get(
        "APOHARA_INTI_CORS_ORIGINS",
        "https://apohara-inti.vercel.app,https://apohara-inti.netlify.app",
    ).strip()

    # Honesty log: mask every secret. The operator can verify
    # "all 4 frontier keys present" without leaking the literals.
    print("Vendor key inventory (masked):", file=sys.stderr)
    print(f"  ssh_pubkey   : {_mask(pubkey)}", file=sys.stderr)
    for env in SOFT_REQUIRED_ENVS:
        marker = "" if vendor_keys[env] else " [MISSING — adapter degrades]"
        print(f"  {env.lower():14s}: {_mask(vendor_keys[env])}{marker}",
              file=sys.stderr)
    for env in OPTIONAL_ENVS:
        marker = "" if vendor_keys[env] else " [optional, empty]"
        print(f"  {env.lower():14s}: {_mask(vendor_keys[env])}{marker}",
              file=sys.stderr)
    print(f"  cors_origins : {cors_origins}", file=sys.stderr)

    # Substitute. Order doesn't matter — placeholders are unique.
    raw = raw.replace("INTI_SSH_PUBKEY_PLACEHOLDER", pubkey)
    for env, val in vendor_keys.items():
        raw = raw.replace(f"{env}_PLACEHOLDER", val)
    raw = raw.replace(
        "APOHARA_INTI_CORS_ORIGINS_PLACEHOLDER",
        cors_origins,
    )
    return raw


def create_instance(api_key: str) -> dict:
    """Create the demo instance. Returns the Vultr API response body."""
    import base64

    user_data_b64 = base64.b64encode(
        load_user_data().encode("utf-8")
    ).decode("ascii")

    body = {
        "region": REGION,
        "plan": PLAN,
        "os_id": OS_ID,
        "label": LABEL,
        "hostname": HOSTNAME,
        "tags": [TAG],
        "user_data": user_data_b64,
        "enable_ipv6": False,
        "backups": "disabled",
        "ddos_protection": False,
        "activation_email": False,
    }
    resp = _api("POST", "/instances", api_key, json_body=body)
    return resp.get("instance") or resp


def destroy_instance(api_key: str, instance_id: str) -> None:
    _api("DELETE", f"/instances/{instance_id}", api_key)


def wait_for_ip(api_key: str, instance_id: str, timeout_s: int = 300) -> str:
    """Poll until ``main_ip`` is non-empty."""
    t0 = time.time()
    while time.time() - t0 < timeout_s:
        data = _api("GET", f"/instances/{instance_id}", api_key)
        inst = data.get("instance", {})
        ip = inst.get("main_ip", "")
        if ip and ip != "0.0.0.0":
            return ip
        time.sleep(8)
    raise TimeoutError(
        f"Instance {instance_id} did not receive an IP within {timeout_s}s"
    )


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def cmd_provision(api_key: str) -> int:
    existing = find_instance_by_tag(api_key, TAG)
    if existing:
        ip = existing.get("main_ip", "")
        iid = existing.get("id", "?")
        status = existing.get("status", "?")
        print(f"Existing instance found (tag={TAG}):")
        print(f"  id     : {iid}")
        print(f"  ip     : {ip}")
        print(f"  status : {status}")
        if ip and ip != "0.0.0.0":
            print(f"  ssh    : ssh inti@{ip}")
            print(f"  url    : https://{ip}.nip.io/")
            print(f"  health : https://{ip}.nip.io/health")
        print("(re-run with --destroy to tear down)")
        return 0

    print(f"Provisioning new instance (region={REGION}, plan={PLAN}, "
          f"os_id={OS_ID})...")
    inst = create_instance(api_key)
    iid = inst.get("id", "")
    if not iid:
        print(
            f"ERROR: Vultr API did not return an instance id. Response: {inst}",
            file=sys.stderr,
        )
        return 1

    print(f"  id     : {iid}")
    print("Waiting for IP assignment (typically 30-90 s)...")
    try:
        ip = wait_for_ip(api_key, iid)
    except TimeoutError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        print(f"Instance {iid} was created. Check the Vultr panel.")
        return 1

    print(f"  ip     : {ip}")
    print(f"  ssh    : ssh inti@{ip}")
    print(f"  url    : https://{ip}.nip.io/")
    print(f"  health : https://{ip}.nip.io/health")
    print()
    print("Cloud-init is now running on the box. It will:")
    print("  1. apt install caddy + python3.12-venv + git + ufw")
    print("  2. git clone apohara-inti, build venv, install backend deps")
    print("  3. systemctl start apohara-inti.service (uvicorn :8000)")
    print("  4. Caddy auto-provisions TLS via Let's Encrypt for *.nip.io")
    print("Expected total time: 4-7 minutes from provision to live URL.")
    return 0


def cmd_destroy(api_key: str) -> int:
    existing = find_instance_by_tag(api_key, TAG)
    if not existing:
        print(f"No instance tagged '{TAG}' found. Nothing to destroy.")
        return 0
    iid = existing.get("id", "")
    ip = existing.get("main_ip", "")
    print(f"Destroying instance {iid} (ip={ip}, tag={TAG})...")
    destroy_instance(api_key, iid)
    print("Destroyed.")
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument(
        "--destroy",
        action="store_true",
        help="Tear down the tagged instance instead of provisioning",
    )
    args = p.parse_args(argv)

    api_key = os.environ.get("VULTR_API_KEY", "").strip()
    if not api_key:
        print(
            "ERROR: VULTR_API_KEY env var is not set.\n"
            "Export it with:\n"
            "    export VULTR_API_KEY='<your-key>'\n"
            "Then re-run. The key is NEVER read from any file by design.",
            file=sys.stderr,
        )
        return 2

    if args.destroy:
        return cmd_destroy(api_key)
    return cmd_provision(api_key)


if __name__ == "__main__":
    sys.exit(main())
