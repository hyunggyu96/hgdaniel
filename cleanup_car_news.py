
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Windows console encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv("collector/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

CAR_FILTER_KEYWORDS = [
    "A필러", "B필러", "C필러", "자동차", "차량", "타이어", "엔진", "중고차", "전기차", "수소차", 
    "SUV", "세단", "시승", "리콜", "국토교통부", "운전", "현대차", "기아", "모빌리티", "커넥티드카",
    "휠", "주행", "운전자", "교통사고", "도로공사", "내비게이션", "블랙박스", "A-필러", "B-필러"
]

def cleanup_cars():
    print("Searching for existing car news in DB...")
    # Fetch recent articles
    response = supabase.table("articles").select("id, title, description").order("published_at", desc=True).limit(500).execute()
    
    count = 0
    for art in response.data:
        full_text = f"{art['title']} {art.get('description', '') or ''}"
        if any(car_kw in full_text for car_kw in CAR_FILTER_KEYWORDS):
            print(f"🗑️ Deleting car news: {art['title'][:40]}...")
            try:
                supabase.table("articles").delete().eq("id", art['id']).execute()
                count += 1
            except Exception as e:
                print(f"  Error deleting: {e}")
                
    print(f"Cleanup complete. Removed {count} car-related articles.")

if __name__ == "__main__":
    cleanup_cars()
