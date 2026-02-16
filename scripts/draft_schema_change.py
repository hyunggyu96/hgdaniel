
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('web/.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, key)

# SQL to add generated column
sql = """
alter table pubmed_papers 
add column if not exists search_text text 
generated always as (
  title || ' ' || 
  coalesce(abstract, '') || ' ' || 
  array_to_string(keywords, ' ') || ' ' || 
  array_to_string(authors, ' ')
) stored;
"""

# We also want to index it for performance, but let's start with just adding it.
# Note: array_to_string is immutable so it works with generated columns.

try:
    # Supabase doesn't expose strict raw SQL exec via client easily for DDL in free tier sometimes?
    # Actually, the python client doesn't have a direct .rpc or .sql method unless we create a function.
    # But we can try using the REST API /rpc call if we have a function.
    # Or... we can use `requests` to call the SQL editor API? No.
    # Wait, the best way for a user without direct SQL access is likely not via this script if the client forbids it.
    # However, standard PostgREST doesn't allow DDL.
    # The user provided `setup_raw_news.sql` before, implying they might run SQL manually?
    # No, I should provide a tool to do it or try to run it if possible.
    # But I can't run DDL via PostgREST.
    
    # Alternative: Do it in application code (Python fetch scripts) -> Fill a `search_text` column manually on insert/update.
    # This is safer given I don't know if I have DDL access.
    # Existing rows need backfill.
    pass
except Exception:
    pass
