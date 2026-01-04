import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

client = create_client(url, key)

# Today target: 2026-01-03
target_date = "2026-01-03"
timestamp_filter = f"{target_date}T00:00:00"

print(f"🔥 Starting Full Cleanup for {target_date}...")

# 1. Delete from 'articles' (Processed data)
try:
    print(f"Checking 'articles' for data >= {timestamp_filter}...")
    # Using 'published_at' as primary date for logic
    res = client.table('articles').delete().gte('published_at', timestamp_filter).execute()
    print(f"✅ Deleted from 'articles' (Count not returned by API, but execution successful).")
except Exception as e:
    print(f"❌ Error deleting from 'articles': {e}")

# 2. Delete from 'raw_news' (Raw collected data)
try:
    print(f"Checking 'raw_news' for data >= {timestamp_filter}...")
    # Raw news might use 'collected_at' or 'created_at'
    # Deleting by 'created_at' to be safe for today's collection run
    client.table('raw_news').delete().gte('created_at', timestamp_filter).execute()
    print(f"✅ Deleted from 'raw_news'.")
except Exception as e:
    print(f"❌ Error deleting from 'raw_news': {e}")

print("🎉 Cleanup Finished.")
