"""Tests for the orchestrator agent configuration and routing logic."""

import pytest
from unittest.mock import patch

# Mock config before imports
with patch.dict("os.environ", {
    "TINYFISH_API_KEY": "test-key",
    "OPENAI_API_KEY": "test-key",
}):
    import sys
    if "config" in sys.modules:
        del sys.modules["config"]

    import config
    config.TINYFISH_API_KEY = "test-key"
    config.OPENAI_API_KEY = "test-key"

    from orchestration.orchestrator import orchestrator
    from skills import job_scam_agent, phishing_agent, dropship_agent, generic_agent


def test_orchestrator_has_correct_name():
    assert orchestrator.name == "AntiFishy Orchestrator"


def test_orchestrator_has_four_skill_tools():
    """Orchestrator should have exactly 4 skill agent tools."""
    assert len(orchestrator.tools) == 4


def test_orchestrator_tool_names():
    """Verify the tool names match what we expect."""
    tool_names = {t.name for t in orchestrator.tools}
    expected = {"verify_job_scam", "verify_phishing", "verify_dropship", "verify_generic"}
    assert tool_names == expected


def test_orchestrator_uses_gpt4_1():
    assert orchestrator.model == "gpt-4.1"


def test_orchestrator_instructions_contain_key_elements():
    """Instructions should mention classification, follow-up, verdict, and output rules."""
    instructions = orchestrator.instructions
    assert "classification" in instructions.lower()
    assert "follow_up" in instructions.lower() or "follow-up" in instructions.lower()
    assert "verdict" in instructions.lower()
    assert "done" in instructions.lower()
    assert "JSON" in instructions


def test_skill_agents_have_browse_tool():
    """Each skill agent should have the browse_website tool."""
    for agent in [job_scam_agent, phishing_agent, dropship_agent, generic_agent]:
        tool_names = [t.name for t in agent.tools]
        assert "browse_website" in tool_names, f"{agent.name} missing browse_website tool"


def test_skill_agents_have_output_instructions():
    """Each skill agent's instructions should include the output format spec."""
    for agent in [job_scam_agent, phishing_agent, dropship_agent, generic_agent]:
        assert '"checks"' in agent.instructions
        assert '"status"' in agent.instructions
        assert "red|yellow|green" in agent.instructions or "red" in agent.instructions


def test_job_scam_agent_checks():
    """Job scam agent instructions should mention all required check IDs."""
    checks = ["company_website", "job_listing_match", "domain_trust", "salary_check", "linkedin_presence", "reviews_reputation"]
    for check in checks:
        assert check in job_scam_agent.instructions, f"Missing check: {check}"


def test_phishing_agent_checks():
    checks = ["url_analysis", "domain_trust", "ssl_check", "page_content", "known_brand_match"]
    for check in checks:
        assert check in phishing_agent.instructions, f"Missing check: {check}"


def test_dropship_agent_checks():
    checks = ["source_price_check", "seller_price_check", "seller_reputation", "domain_trust"]
    for check in checks:
        assert check in dropship_agent.instructions, f"Missing check: {check}"


def test_generic_agent_checks():
    checks = ["domain_trust", "contact_verification", "content_analysis"]
    for check in checks:
        assert check in generic_agent.instructions, f"Missing check: {check}"
