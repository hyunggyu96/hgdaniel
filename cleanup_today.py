import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv('collector/.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: credentials not found.")
    exit(1)

client = create_client(url, key)

today_str = datetime.now().strftime("%Y-%m-%d") # 2026-01-03
start_of_day = f"{today_str}T00:00:00"

print(f"🔥 DELETING all news since {start_of_day}...")

try:
    # First, select to verify
    res = client.table('raw_news').select('*', count='exact').gte('created_at', start_of_day).execute()
    count = res.count
    
    if count and count > 0:
        print(f"Found {count} records. Wiping them out...")
        client.table('raw_news').delete().gte('created_at', start_of_day).execute()
        print("✅ SUCCESS: Data wiped clean.")
    else:
        print("🤷 No data found for today.")

except Exception as e:
    print(f"❌ Error: {e}")
