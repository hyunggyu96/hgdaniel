
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

print("Testing authors ilike search...")
try:
    # Try to search directly on authors column with ilike
    # Note: supabase-py doesn't expose strict raw 'or' string nicely for complex types sometimes
    # But let's try via the postgrest syntax style `.or`
    
    # We want rows where authors (array) matches a string pattern? 
    # Usually this fails.
    
    res = supabase.table("pubmed_papers").select("*").or_("authors.ilike.%Kim%").limit(1).execute()
    print("Success:", res.data)
except Exception as e:
    print("Failed:", e)
