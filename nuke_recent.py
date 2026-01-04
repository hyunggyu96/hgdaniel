import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

if not url or not key:
    print("Error: Supabase credentials not found in collector/.env")
    exit(1)

client = create_client(url, key)

print("🔍 Fetching last 10 news items...")
# Try 'created_at' first (standard Supabase field)
try:
    res = client.table('raw_news').select('id, title').order('created_at', desc=True).limit(10).execute()
except:
    # Fallback if schema differs (though unlikely for created_at)
    res = client.table('raw_news').select('id, title').limit(10).execute()

if res.data:
    ids = [item['id'] for item in res.data]
    titles = [item.get('title', 'No Title')[:20] + '...' for item in res.data]
    
    print(f"🗑️ Deleting {len(ids)} items:")
    for t in titles:
        print(f" - {t}")
        
    client.table('raw_news').delete().in_('id', ids).execute()
    print("✅ DELETED. Collector will now re-fetch these.")
else:
    print("🤷 No news found to delete.")
