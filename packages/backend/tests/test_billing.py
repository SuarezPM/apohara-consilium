"""Tests for SaaS billing scaffold."""
import os
import sqlite3
import tempfile
from pathlib import Path

import pytest

from billing.tenant_model import (
    PLAN_QUOTAS, init_schema, create_tenant, get_tenant, check_quota, link_stripe_customer
)


@pytest.fixture
def tmp_db(tmp_path: Path) -> Path:
    return tmp_path / "test_tenants.db"


def test_create_tenant_returns_full_record(tmp_db: Path):
    t = create_tenant("Acme Corp", "free", tmp_db)
    assert t["org_name"] == "Acme Corp"
    assert t["plan"] == "free"
    assert t["monthly_quota"] == PLAN_QUOTAS["free"]
    assert len(t["hmac_key"]) == 64  # 32 bytes hex
    assert t["used_calls_this_month"] == 0


def test_get_tenant_returns_none_when_missing(tmp_db: Path):
    init_schema(tmp_db)
    assert get_tenant("nonexistent-uuid", tmp_db) is None


def test_check_quota_decrements(tmp_db: Path):
    t = create_tenant("Acme", "free", tmp_db)
    org_id = t["org_id"]
    allowed, remaining = check_quota(org_id, tmp_db)
    assert allowed
    assert remaining == PLAN_QUOTAS["free"] - 1


def test_check_quota_blocks_when_exhausted(tmp_db: Path):
    t = create_tenant("Tiny", "free", tmp_db)
    org_id = t["org_id"]
    # Consume all
    for _ in range(PLAN_QUOTAS["free"]):
        check_quota(org_id, tmp_db)
    allowed, remaining = check_quota(org_id, tmp_db)
    assert not allowed
    assert remaining == 0


def test_hmac_keys_isolated_between_tenants(tmp_db: Path):
    a = create_tenant("Org A", "free", tmp_db)
    b = create_tenant("Org B", "free", tmp_db)
    assert a["hmac_key"] != b["hmac_key"]


def test_link_stripe_customer_updates_record(tmp_db: Path):
    t = create_tenant("Pro Co", "pro", tmp_db)
    org_id = t["org_id"]
    link_stripe_customer(org_id, "cus_test_xyz", tmp_db)
    refreshed = get_tenant(org_id, tmp_db)
    assert refreshed["stripe_customer_id"] == "cus_test_xyz"


def test_invalid_plan_raises(tmp_db: Path):
    with pytest.raises(ValueError, match="unknown plan"):
        create_tenant("Bad", "ultra-mega-plan-not-real", tmp_db)


def test_stripe_scaffold_unconfigured_returns_false():
    from billing.stripe_scaffold import is_configured
    # Without STRIPE_TEST_SECRET, should return False
    os.environ.pop("STRIPE_TEST_SECRET", None)
    assert not is_configured()


def test_check_quota_no_overquota_under_concurrency(tmp_db: Path):
    """Two concurrent threads + a 1-quota tenant must not both succeed."""
    import threading
    from billing.tenant_model import create_tenant, check_quota, init_schema
    init_schema(tmp_db)
    t = create_tenant("ConcurrencyTest", "free", tmp_db)
    org_id = t["org_id"]
    # Manually set quota=1 to force collision
    conn = sqlite3.connect(str(tmp_db))
    try:
        conn.execute(
            "UPDATE tenants SET monthly_quota = 1, used_calls_this_month = 0 WHERE org_id = ?",
            (org_id,),
        )
        conn.commit()
    finally:
        conn.close()

    results = []
    barrier = threading.Barrier(8)

    def attempt():
        barrier.wait()  # release all threads simultaneously
        results.append(check_quota(org_id, tmp_db))

    threads = [threading.Thread(target=attempt) for _ in range(8)]
    for th in threads:
        th.start()
    for th in threads:
        th.join()
    # Exactly ONE thread should have succeeded (allowed=True); 7 should have failed
    allowed_count = sum(1 for allowed, _ in results if allowed)
    assert allowed_count == 1, f"Expected exactly 1 allowed under concurrency, got {allowed_count}"
