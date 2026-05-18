# SPDX-License-Identifier: Apache-2.0
"""
FastAPI router for the Apohara PROBANT SOAR module endpoints.

Mounted at /v1/soar/* on the existing /v1 namespace.

Endpoints:
  GET  /v1/soar/healthz                  -- liveness + module inventory
  GET  /v1/soar/incidents/types          -- 16-code incident taxonomy
  GET  /v1/soar/incidents/recent         -- recent incidents from ledger (stub)
  POST /v1/soar/judge/evaluate           -- DJL + optional LLM ensemble
  GET  /v1/soar/templates                -- 6 industry templates
  GET  /v1/soar/templates/{name}         -- single template by name
  GET  /v1/soar/compliance/frameworks    -- 6 compliance frameworks
  POST /v1/soar/compliance/report        -- per-incident compliance evidence
  GET  /v1/soar/mythos/status            -- Glasswing slot readiness
  GET  /v1/soar/metrics                  -- Prometheus text/plain gauge dump

Part of the Apohara PROBANT Fusion Sprint (2026-05-18) — US-79.
"""
from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Imports from apohara_aegis.
# On the production droplet PYTHONPATH includes /opt/apohara-aegis.
# Locally: PYTHONPATH=.:/path/to/apohara-aegis
# ---------------------------------------------------------------------------
from apohara_aegis.djl import DjlEngine, DjlVerdict  # noqa: F401
from apohara_aegis.taxonomy import IncidentCode, DEFINITIONS as TAXONOMY
from apohara_aegis.templates import TEMPLATES
from apohara_aegis.nist_mapping import CONTROLS as NIST_CONTROLS
from apohara_aegis.compliance import FRAMEWORKS as COMPLIANCE_FRAMEWORKS, generate as compliance_generate
from apohara_aegis.verdict_combine import combine as verdict_combine, CombinedVerdict  # noqa: F401
from apohara_aegis.mythos_slot import MythosAttackerAdapter

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/v1/soar", tags=["soar"])

# ---------------------------------------------------------------------------
# Module-level singletons (stateless; thread-safe)
# ---------------------------------------------------------------------------

_DJL_ENGINE = DjlEngine()
_MYTHOS_ADAPTER = MythosAttackerAdapter()

# ---------------------------------------------------------------------------
# /v1/soar/healthz
# ---------------------------------------------------------------------------


class SoarHealthResponse(BaseModel):
    status: str
    djl_rules_loaded: int
    incident_codes_loaded: int
    industry_templates_loaded: int
    nist_controls_loaded: int
    compliance_frameworks_loaded: int
    mythos_slot: dict


@router.get("/healthz", response_model=SoarHealthResponse)
async def healthz() -> SoarHealthResponse:
    """Liveness probe + SOAR module inventory."""
    return SoarHealthResponse(
        status="ok",
        djl_rules_loaded=len(_DJL_ENGINE.rules),
        incident_codes_loaded=len(list(IncidentCode)),
        industry_templates_loaded=len(TEMPLATES),
        nist_controls_loaded=len(NIST_CONTROLS),
        compliance_frameworks_loaded=len(COMPLIANCE_FRAMEWORKS),
        mythos_slot={
            "enabled": _MYTHOS_ADAPTER._available(),
            "reserved": True,
            "status": (
                "active"
                if _MYTHOS_ADAPTER._available()
                else "pending_glasswing_application"
            ),
        },
    )


# ---------------------------------------------------------------------------
# /v1/soar/incidents/types
# ---------------------------------------------------------------------------


class IncidentTypeDTO(BaseModel):
    code: str
    name: str
    description: str
    severity: int
    detection_signals: list[str]
    default_djl_rule_ids: list[str]
    default_compliance_refs: list[str]


@router.get("/incidents/types", response_model=list[IncidentTypeDTO])
async def list_incident_types() -> list[IncidentTypeDTO]:
    """Return all 16 incident type definitions from the taxonomy."""
    return [
        IncidentTypeDTO(
            code=str(code),
            name=defn.name,
            description=defn.description,
            severity=defn.severity,
            detection_signals=list(defn.detection_signals),
            default_djl_rule_ids=list(defn.default_djl_rule_ids),
            default_compliance_refs=list(defn.default_compliance_refs),
        )
        for code, defn in TAXONOMY.items()
    ]


# ---------------------------------------------------------------------------
# /v1/soar/incidents/recent
# ---------------------------------------------------------------------------


class IncidentRecentDTO(BaseModel):
    ts: float
    incident_code: str
    severity: int
    verdict: str
    signed_hash: str


@router.get("/incidents/recent", response_model=list[IncidentRecentDTO])
async def recent_incidents(limit: int = 50) -> list[IncidentRecentDTO]:
    """Return recent incidents from the HMAC ledger.

    Stub implementation: returns empty list until the verdict_vault
    integration is wired (US-84 / future sprint).
    """
    return []


# ---------------------------------------------------------------------------
# /v1/soar/judge/evaluate
# ---------------------------------------------------------------------------


class EvaluateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)
    context: Optional[dict] = None
    layer: Literal["djl", "llm", "both"] = "both"


class EvaluateResponse(BaseModel):
    decision: Literal["ALLOW", "REVIEW", "BLOCK"]
    decision_reason: str
    djl_verdict: dict
    llm_verdict: Optional[dict] = None
    total_latency_ms: float


@router.post("/judge/evaluate", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest) -> EvaluateResponse:
    """Evaluate a prompt through DJL and/or LLM ensemble layers."""
    if req.layer == "djl":
        djl_v = _DJL_ENGINE.evaluate(req.prompt, req.context)
        return EvaluateResponse(
            decision=djl_v.decision,
            decision_reason=f"djl_only_{djl_v.decision.lower()}",
            djl_verdict={
                "decision": djl_v.decision,
                "matched_rules": list(djl_v.matched_rules),
                "latency_ms": djl_v.latency_ms,
            },
            llm_verdict=None,
            total_latency_ms=djl_v.latency_ms,
        )

    if req.layer == "llm":
        # LLM-only path: ensemble setup requires live vendor API keys.
        # Stubbed until make_default_adapters is wired here (future sprint).
        return EvaluateResponse(
            decision="REVIEW",
            decision_reason="llm_only_mode_requires_ensemble_setup",
            djl_verdict={"decision": "—", "matched_rules": [], "latency_ms": 0},
            llm_verdict={
                "decision": "REVIEW",
                "vendor_votes": {},
                "block_count": 0,
                "review_count": 0,
                "allow_count": 0,
                "latency_ms": 0,
            },
            total_latency_ms=0,
        )

    # layer == "both": DJL + optional LLM via verdict_combine
    combined: CombinedVerdict = await verdict_combine(
        req.prompt, req.context, _DJL_ENGINE, llm_ensemble_fn=None
    )
    return EvaluateResponse(
        decision=combined.decision,
        decision_reason=combined.decision_reason,
        djl_verdict={
            "decision": combined.djl_verdict.decision,
            "matched_rules": list(combined.djl_verdict.matched_rules),
            "latency_ms": combined.djl_verdict.latency_ms,
        },
        llm_verdict=(
            None
            if combined.llm_verdict is None
            else {
                "decision": combined.llm_verdict.decision,
                "vendor_votes": dict(combined.llm_verdict.vendor_votes),
                "latency_ms": combined.llm_verdict.latency_ms,
            }
        ),
        total_latency_ms=combined.total_latency_ms,
    )


# ---------------------------------------------------------------------------
# /v1/soar/templates
# ---------------------------------------------------------------------------


class TemplateDTO(BaseModel):
    name: str
    regulatory_refs: list[str]
    default_djl_rule_subset: list[str]
    mandatory_incident_codes: list[str]
    default_compliance_report_sections: list[str]
    description: str


@router.get("/templates", response_model=list[TemplateDTO])
async def list_templates() -> list[TemplateDTO]:
    """Return all 6 industry deployment templates."""
    return [
        TemplateDTO(
            name=tpl.name,
            regulatory_refs=list(tpl.regulatory_refs),
            default_djl_rule_subset=list(tpl.default_djl_rule_subset),
            mandatory_incident_codes=[str(c) for c in tpl.mandatory_incident_codes],
            default_compliance_report_sections=list(
                tpl.default_compliance_report_sections
            ),
            description=tpl.description,
        )
        for tpl in TEMPLATES.values()
    ]


@router.get("/templates/{name}", response_model=TemplateDTO)
async def get_template(name: str) -> TemplateDTO:
    """Return a single industry template by name (case-insensitive)."""
    name_l = name.lower()
    if name_l not in TEMPLATES:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Template '{name}' not found. "
                f"Available: {list(TEMPLATES.keys())}"
            ),
        )
    tpl = TEMPLATES[name_l]
    return TemplateDTO(
        name=tpl.name,
        regulatory_refs=list(tpl.regulatory_refs),
        default_djl_rule_subset=list(tpl.default_djl_rule_subset),
        mandatory_incident_codes=[str(c) for c in tpl.mandatory_incident_codes],
        default_compliance_report_sections=list(
            tpl.default_compliance_report_sections
        ),
        description=tpl.description,
    )


# ---------------------------------------------------------------------------
# /v1/soar/compliance/frameworks
# ---------------------------------------------------------------------------


class FrameworkDTO(BaseModel):
    name: str
    version: str
    description: str
    control_count: int
    source_url: str


@router.get("/compliance/frameworks", response_model=list[FrameworkDTO])
async def list_frameworks() -> list[FrameworkDTO]:
    """Return all compliance frameworks with their control counts."""
    return [
        FrameworkDTO(
            name=fw.name,
            version=fw.version,
            description=fw.description,
            control_count=len(fw.controls),
            source_url=fw.source_url,
        )
        for fw in COMPLIANCE_FRAMEWORKS.values()
    ]


# ---------------------------------------------------------------------------
# /v1/soar/compliance/report
# ---------------------------------------------------------------------------


class ReportRequest(BaseModel):
    incident_code: str
    framework_names: Optional[list[str]] = None


@router.post("/compliance/report")
async def compliance_report(req: ReportRequest) -> dict:
    """Generate a per-incident compliance evidence report."""
    try:
        code = IncidentCode(req.incident_code)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown incident_code: '{req.incident_code}'. "
                   f"Valid values: {[str(c) for c in IncidentCode]}",
        )
    return compliance_generate(code, req.framework_names)


# ---------------------------------------------------------------------------
# /v1/soar/mythos/status
# ---------------------------------------------------------------------------


class MythosStatusResponse(BaseModel):
    enabled: bool
    reserved: bool
    status: str
    activation_path: str
    boundary_text_ref: str


@router.get("/mythos/status", response_model=MythosStatusResponse)
async def mythos_status() -> MythosStatusResponse:
    """Return the readiness state of the reserved Mythos/Glasswing adapter seat."""
    enabled = _MYTHOS_ADAPTER._available()
    return MythosStatusResponse(
        enabled=enabled,
        reserved=True,
        status="active" if enabled else "pending_glasswing_application",
        activation_path=(
            "Set APOHARA_MYTHOS_ENABLED=1 + ANTHROPIC_MYTHOS_API_KEY "
            "OR AWS_BEDROCK_MYTHOS_CREDS"
        ),
        boundary_text_ref=(
            "https://github.com/SuarezPM/apohara-probant/blob/main/MYTHOS_READY.md"
        ),
    )


# ---------------------------------------------------------------------------
# /v1/soar/metrics
# ---------------------------------------------------------------------------


@router.get("/metrics", response_class=PlainTextResponse)
async def metrics() -> str:
    """Prometheus-style gauge dump (text/plain)."""
    lines = [
        "# HELP apohara_soar_djl_rules_total Number of DJL rules loaded",
        "# TYPE apohara_soar_djl_rules_total gauge",
        f"apohara_soar_djl_rules_total {len(_DJL_ENGINE.rules)}",
        "# HELP apohara_soar_incident_codes_total Number of incident types defined",
        "# TYPE apohara_soar_incident_codes_total gauge",
        f"apohara_soar_incident_codes_total {len(list(IncidentCode))}",
        "# HELP apohara_soar_industry_templates_total Number of industry templates",
        "# TYPE apohara_soar_industry_templates_total gauge",
        f"apohara_soar_industry_templates_total {len(TEMPLATES)}",
        "# HELP apohara_soar_nist_controls_total NIST AI RMF Agentic Profile controls mapped",
        "# TYPE apohara_soar_nist_controls_total gauge",
        f"apohara_soar_nist_controls_total {len(NIST_CONTROLS)}",
        "# HELP apohara_soar_compliance_frameworks_total Compliance frameworks loaded",
        "# TYPE apohara_soar_compliance_frameworks_total gauge",
        f"apohara_soar_compliance_frameworks_total {len(COMPLIANCE_FRAMEWORKS)}",
        "# HELP apohara_soar_mythos_slot_active Mythos slot 1=active 0=reserved",
        "# TYPE apohara_soar_mythos_slot_active gauge",
        f"apohara_soar_mythos_slot_active {1 if _MYTHOS_ADAPTER._available() else 0}",
    ]
    return "\n".join(lines) + "\n"
