"""Application configuration — loads .env from project root."""

import os
from pathlib import Path

from dotenv import load_dotenv

# .env lives one level above backend/
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

TINYFISH_API_KEY: str = os.environ.get("TINYFISH_API_KEY", "")
OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
TINYFISH_BASE_URL: str = "https://agent.tinyfish.ai/v1/automation"
TINYFISH_TIMEOUT: int = int(os.environ.get("TINYFISH_TIMEOUT", "90"))

# Validation
if not TINYFISH_API_KEY:
    raise RuntimeError("TINYFISH_API_KEY not set — check .env file")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set — check .env file")
