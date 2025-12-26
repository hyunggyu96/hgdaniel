
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Checking specific bad articles...")
res = supabase.table("articles").select("*").ilike("title", "%르노%").execute()
for art in res.data:
    print(f"ID: {art['id']} | Title: {art['title']} | Created: {art.get('created_at')}")

res2 = supabase.table("articles").select("*").ilike("title", "%에쓰씨엔지니어링%").execute()
for art in res2.data:
    print(f"ID: {art['id']} | Title: {art['title']} | Created: {art.get('created_at')}")
