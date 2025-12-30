
import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv('collector/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

res = supabase.table('articles').select('title, created_at').order('created_at', desc=True).limit(5).execute()

print("--- 최근 분석된 기사 5개 ---")
for r in res.data:
    # UTC to KST (+9h)
    dt = datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')) + timedelta(hours=9)
    print(f"[{dt.strftime('%Y-%m-%d %H:%M:%S')}] {r['title'][:50]}...")
