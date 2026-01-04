from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('collector/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

client = create_client(url, key)

# Supabase management API is restricted, but we can infer table existence by simple select attempts 
# or if user knows tables. 
# Based on user request, there's `articles` table. Let's inspect it.

potential_tables = ['raw_news', 'articles', 'news', 'processed_news']

print("Checking tables for today's news (2026-01-03)...")
for t in potential_tables:
    try:
        res = client.table(t).select('count', count='exact').limit(1).execute()
        print(f"[Table: {t}] Exists. Total rows: {res.count}")
    except Exception as e:
        print(f"[Table: {t}] Not accessible or does not exist.")
