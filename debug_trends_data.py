
import os
import sys
import datetime
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def debug_trends():
    # 30 days ago
    start = (datetime.datetime.utcnow() - datetime.timedelta(days=30)).isoformat()
    
    res = supabase.table("articles").select("keyword, published_at").gte("published_at", start).order("published_at", desc=True).limit(5000).execute()
    articles = res.data
    
    print(f"Total articles found: {len(articles)}")
    
    trend_map = {}
    for art in articles:
        # Interpret as UTC
        pub = art['published_at']
        try:
            dt = datetime.datetime.fromisoformat(pub.replace("Z", "+00:00"))
            # Shift to KST
            kst = dt + datetime.timedelta(hours=9)
            date_str = kst.strftime("%Y-%m-%d")
        except:
            date_str = pub[:10]
            
        kw = art['keyword'] or '기타'
        if date_str not in trend_map:
            trend_map[date_str] = {}
        trend_map[date_str][kw] = trend_map[date_str].get(kw, 0) + 1

    sorted_dates = sorted(trend_map.keys(), reverse=True)
    for d in sorted_dates[:5]:
        print(f"Date: {d} | Counts: {trend_map[d]}")

if __name__ == "__main__":
    debug_trends()
