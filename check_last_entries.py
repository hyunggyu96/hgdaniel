
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

res = supabase.table("articles").select("*").order("id", desc=True).limit(5).execute()
for r in res.data:
    mk = r.get('main_keywords', [])
    print(f"ID: {r.get('id')} | Model: {mk[0] if mk else 'N/A'}")
    print(f"Included: {mk[1:] if len(mk) > 1 else []}")
    print(f"Title: {r['title'][:100]}\n")
