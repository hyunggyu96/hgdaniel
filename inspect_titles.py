
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("articles").select("id, title").order("published_at", desc=True).limit(30).execute()
with open("current_titles.txt", "w", encoding="utf-8") as f:
    for art in res.data:
        f.write(f"[{art['id']}] {art['title']}\n")
