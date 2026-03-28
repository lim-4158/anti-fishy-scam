"""Pydantic models matching the API contract."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────────────────────

class AnalyzeContext(BaseModel):
    channel: str | None = None
    contact: str | None = None
    company: str | None = None
    product_url: str | None = None
    original_url: str | None = None


class AnalyzeRequest(BaseModel):
    message: str = Field(..., description="User's raw input (URL, pasted message, etc.)")
    session_id: str | None = None
    context: AnalyzeContext | None = None


# ── SSE Event payloads ───────────────────────────────────────────────────────

class ClassificationEvent(BaseModel):
    type: str = "classification"
    scam_type: str
    confidence: float
    summary: str


class FollowUpQuestion(BaseModel):
    field: str
    label: str
    input_type: str = "text"
    options: list[str] | None = None


class FollowUpEvent(BaseModel):
    type: str = "follow_up"
    questions: list[FollowUpQuestion]


class CheckStartedEvent(BaseModel):
    type: str = "check_started"
    check_id: str
    name: str
    icon: str


class CheckProgressEvent(BaseModel):
    type: str = "check_progress"
    check_id: str
    message: str
    browser_url: str | None = None


class CheckCompleteEvent(BaseModel):
    type: str = "check_complete"
    check_id: str
    status: str  # "red" | "yellow" | "green"
    summary: str
    details: dict[str, Any] | None = None


class CheckSummaryItem(BaseModel):
    check_id: str
    name: str
    status: str
    one_liner: str


class VerdictEvent(BaseModel):
    type: str = "verdict"
    overall: str  # "likely_safe" | "suspicious" | "likely_scam"
    score: float
    summary: str
    checks_summary: list[CheckSummaryItem]


class ErrorEvent(BaseModel):
    type: str = "error"
    message: str


class DoneEvent(BaseModel):
    type: str = "done"
