
import os
import json
from supabase import create_client
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv(os.path.join(os.path.dirname(__file__), 'collector', '.env'))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

def check_data():
    print("🔍 Checking raw data for Jan 3rd & 4th...")
    
    # 최근 100개만 가져와서 날짜와 카테고리 확인
    res = supabase.table("articles").select("published_at, title, category").order("published_at", desc=True).limit(20).execute()
    
    print(f"✅ Retrieved {len(res.data)} rows.")
    for item in res.data:
        print(f"📅 Time: [{item['published_at']}] | 🏷️ Cat: [{item['category']}] | 📰 {item['title'][:15]}...")

if __name__ == "__main__":
    check_data()
