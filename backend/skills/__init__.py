"""Skill registry — imports all skill agents for use by the orchestrator."""

from .job_scam import job_scam_agent
from .phishing import phishing_agent
from .dropship import dropship_agent
from .generic import generic_agent

__all__ = [
    "job_scam_agent",
    "phishing_agent",
    "dropship_agent",
    "generic_agent",
]
