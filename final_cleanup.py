
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

BAD_CONTEXT = ["자동차", "타이어", "엔진", "휠", "주행", "운전", "국토부", "모빌리티", "세단", "SUV", "리콜", "시승", "A필러", "B필러", "C필러"]

def find_and_delete_bad_news():
    print("Checking for irrelevant news in current DB...")
    res = supabase.table("articles").select("id, title, description").order("published_at", desc=True).limit(200).execute()
    
    to_delete = []
    for art in res.data:
        full_text = f"{art['title']} {art.get('description', '') or ''}"
        for bad in BAD_CONTEXT:
            # Special check for A필러/B필러 to avoid PLA필러 false positive
            if bad in ["A필러", "B필러", "C필러"]:
                if f" {bad}" in full_text or f"-{bad}" in full_text:
                    to_delete.append(art)
                    print(f"❌ MATCH [{bad}]: {art['title']}")
                    break
            else:
                if bad in full_text:
                    to_delete.append(art)
                    print(f"❌ MATCH [{bad}]: {art['title']}")
                    break
    
    if to_delete:
        print(f"Found {len(to_delete)} bad articles. Deleting...")
        for art in to_delete:
            supabase.table("articles").delete().eq("id", art['id']).execute()
        print("Cleanup done.")
    else:
        print("No bad articles found in recent list.")

if __name__ == "__main__":
    find_and_delete_bad_news()
