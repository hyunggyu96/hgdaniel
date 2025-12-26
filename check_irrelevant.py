
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Windows console encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("articles").select("id, title, main_keywords").order("published_at", desc=True).limit(20).execute()
for art in res.data:
    print(f"[{art['id']}] {art['title']} | Keywords: {art['main_keywords']}")
