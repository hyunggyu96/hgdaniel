
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("articles").select("*").ilike("title", "%제테마%").order("published_at", desc=True).limit(5).execute()
for art in res.data:
    print(f"ID: {art['id']}")
    print(f"Title: {art['title']}")
    print(f"Keywords: {art['main_keywords']}")
    print("-" * 20)
