import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Try to load from .env.local (root), web/.env.local, or collector/.env
if os.path.exists('.env.local'):
    load_dotenv('.env.local')
elif os.path.exists('web/.env.local'):
    load_dotenv('web/.env.local')
elif os.path.exists('collector/.env'):
    load_dotenv('collector/.env')
else:
    load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase credentials not found in environment variables.")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print(f"🚀 Checking News Dashboard Status...\n")

try:
    # 1. Check Total Article Count
    count_res = supabase.table('articles').select('id', count='exact').execute()
    total_count = count_res.count if hasattr(count_res, 'count') else len(count_res.data)
    print(f"📊 Total Articles: {total_count}")

    # 2. Check Raw News Queue (Pending)
    raw_res = supabase.table('raw_news').select('id', count='exact').eq('status', 'pending').execute()
    pending_count = raw_res.count if hasattr(raw_res, 'count') else len(raw_res.data)
    print(f"⏳ Pending Raw News: {pending_count}\n")

    # 3. List Latest 5 Articles
    print("📰 Latest 5 Published Articles:")
    print("-" * 60)
    
    latest_res = supabase.table('articles').select('published_at, title, main_keywords').order('published_at', desc=True).limit(5).execute()
    
    if not latest_res.data:
        print("   (No articles found)")
    else:
        for i, article in enumerate(latest_res.data, 1):
            # Parse UTC string and convert to KST
            from datetime import datetime, timedelta
            
            utc_str = article['published_at']
            # Handle standard ISO format variations
            if 'T' in utc_str:
                dt_utc = datetime.fromisoformat(utc_str.replace('Z', '+00:00'))
            else:
                dt_utc = datetime.strptime(utc_str, "%Y-%m-%d %H:%M:%S+00:00")
                
            # Add 9 hours for KST
            dt_kst = dt_utc + timedelta(hours=9)
            pub_date = dt_kst.strftime("%Y-%m-%d %H:%M")
            title = article['title']
            keywords = article.get('main_keywords', [])
            if isinstance(keywords, list) and len(keywords) > 0:
                kw_str = f"[{keywords[0]}]"
            else:
                kw_str = "[]"
            
            print(f"{i}. {pub_date} | {kw_str} {title[:50]}...")

    print("-" * 60)
    print("\n✅ System seems operational.")

except Exception as e:
    print(f"\n❌ Error checking database: {e}")

