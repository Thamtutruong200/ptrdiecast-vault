import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root if it exists
base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / ".env"
load_dotenv(dotenv_path=env_path)

# Supabase Credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() 
    or os.getenv("SUPABASE_KEY", "").strip() 
    or os.getenv("SUPABASE_ANON_KEY", "").strip()
)
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "diecast-photos").strip()

# AI Vision API Credentials
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()

# App Settings
APP_ENV = os.getenv("APP_ENV", "development").strip()
IS_SUPABASE_CONFIGURED = bool(SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL)
