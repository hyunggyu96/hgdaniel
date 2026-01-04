import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client

# 1. Load Environment
load_dotenv('collector/.env')
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: Credentials missing in collector/.env")
    exit(1)

client = create_client(url, key)
today_str = "2026-01-03" # User specified "today" related to previous context

print(f"🔥 [Cleanup] Deleting data for {today_str}...")

# 2. Delete from Supabase (Primary Source)
try:
    # Check count first
    res = client.table('raw_news').select('*', count='exact').gte('created_at', f'{today_str}T00:00:00').execute()
    count = res.count
    
    if count and count > 0:
        print(f"   - Found {count} records in Supabase. Deleting...")
        client.table('raw_news').delete().gte('created_at', f'{today_str}T00:00:00').execute()
        print("   - ✅ Supabase data deleted.")
    else:
        print("   - ⚠ No data found in Supabase for today.")

except Exception as e:
    print(f"   - ❌ Supabase Error: {e}")

# Note: Google Sheets deletion is complex via script due to row shifting risks. 
# Since 'Collector' checks Supabase for duplicates, clearing Supabase is sufficient to trigger re-collection.
print("✅ Cleanup Complete. Ready to restart Tablet process.")
