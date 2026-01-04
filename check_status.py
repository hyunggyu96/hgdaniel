import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('collector/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

client = create_client(url, key)
today_str = "2026-01-03" # Fixed date as per context
start_of_day = f"{today_str}T00:00:00"

print(f"🔎 Checking Data Status for {today_str}...")

try:
    # Check Raw News
    res_raw = client.table('raw_news').select('*', count='exact').gte('created_at', start_of_day).execute()
    count_raw = res_raw.count if res_raw.count is not None else len(res_raw.data)
    
    # Check Processed Articles
    res_art = client.table('articles').select('*', count='exact').gte('published_at', start_of_day).execute()
    count_art = res_art.count if res_art.count is not None else len(res_art.data)

    print(f"📊 [Result]")
    print(f"   - Raw News (Collected): {count_raw} rows")
    print(f"   - Articles (Analyzed) : {count_art} rows")
    
    if count_raw == 0:
        print("   -> DB is CLEAN. Collector SHOULD be running.")
    else:
        print("   -> DB has data. Collector might think job is done.")

except Exception as e:
    print(f"❌ Error checking DB: {e}")
