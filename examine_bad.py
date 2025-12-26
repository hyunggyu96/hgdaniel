
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

ids = [41596, 41573]
res = supabase.table("articles").select("*").in_("id", ids).execute()
for art in res.data:
    print(f"--- ID: {art['id']} ---")
    print(f"Title: {art['title']}")
    print(f"Keyword: {art['keyword']}")
    print(f"Main Keywords: {art['main_keywords']}")
    print(f"Description: {art['description']}")
    print("-" * 30)
