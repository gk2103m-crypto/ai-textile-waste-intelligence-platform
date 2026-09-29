import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Local env Variables load 
load_dotenv(override=False)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
# Prefer SERVICE_ROLE_KEY for backend bypass of RLS if needed, or ANON_KEY
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_KEY is missing. Supabase Client not initialized.")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Frontend & UI connectivity function (Mocking DB session injection)
def get_db():
    try:
        yield supabase
    finally:
        pass