"""Base factory for creating skill agents.

Every skill agent gets the browse_website tool (TinyFish) and follows
a common output contract so the orchestrator can parse results uniformly.
"""

from __future__ import annotations

from agents import Agent

from tools.tinyfish import browse_website

SKILL_OUTPUT_INSTRUCTIONS = """
IMPORTANT: When you finish your checks, output your findings as a JSON object with this exact structure:

{
  "checks": [
    {
      "check_id": "<id from the check list>",
      "name": "<human-readable name>",
      "icon": "<icon key>",
      "status": "red|yellow|green",
      "summary": "<1-2 sentence summary>",
      "details": {
        "url_visited": "<url you checked>",
        "evidence": ["<finding 1>", "<finding 2>", ...],
        "raw_data": {}
      }
    }
  ],
  "overall_assessment": "<1-2 sentence overall finding for the orchestrator>"
}

Use these status colors:
- "green" = looks legitimate, no red flags
- "yellow" = some concerns but not conclusive
- "red" = clear red flags, likely scam/fraud

Be thorough but concise. Cite specific evidence from the websites you visited.
"""


def create_skill_agent(name: str, instructions: str, model: str = "gpt-4.1") -> Agent:
    """Create a skill agent with the TinyFish browse_website tool.

    Args:
        name: Agent display name.
        instructions: Skill-specific instructions (will be appended with
            standard output format instructions).
        model: OpenAI model to use.
    """
    return Agent(
        name=name,
        instructions=instructions + "\n\n" + SKILL_OUTPUT_INSTRUCTIONS,
        tools=[browse_website],
        model=model,
    )
