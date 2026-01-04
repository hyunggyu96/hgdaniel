
import aiohttp
import asyncio
import os

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
# Service Role Key (Admin)
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"

async def run_sql():
    sql = "ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text DEFAULT '기타';"
    url = f"{SUPABASE_URL}/rest/v1/"
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }

    print(f"🚀 Sending SQL to Supabase via REST API...")
    # SQL can't be easily run via PostgREST directly without an RPC function.
    # So I will check if I can use a simpler approach or tell the user to use the dashboard SQL editor.
    # WAIT: I can use the 'supabase-py' client if it has a way, but usually it's limited to CRUD.
    
    print("REST API doesn't support raw SQL 'ALTER TABLE' directly for security.")
    print("I will try one more trick via a temporary table creation if possible,")
    print("BUT the most standard and fastest way for YOU right now is:")
    print("\n1. Supabase Dashboard > SQL Editor")
    print(f"2. Paste this: {sql}")
    print("3. Click 'Run'")

if __name__ == "__main__":
    asyncio.run(run_sql())
