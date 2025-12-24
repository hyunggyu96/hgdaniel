
import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

async def check_recent():
    print("Checking recent articles in DB...")
    res = supabase.table("articles").select("published_at, title").order("published_at", desc=True).limit(10).execute()
    for item in res.data:
        print(f"[{item['published_at']}] {item['title']}")

if __name__ == "__main__":
    asyncio.run(check_recent())
