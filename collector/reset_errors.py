import os
from dotenv import load_dotenv
from supabase import create_client

def reset_ai_errors():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Supabase URL or Key missing in .env")
        return

    sb = create_client(url, key)
    # ai_error 상태인 것들을 pending으로 변경
    res = sb.table("raw_news").update({"status": "pending"}).eq("status", "ai_error").execute()
    
    count = len(res.data) if hasattr(res, 'data') else 0
    print(f"✅ Reset {count} items from 'ai_error' to 'pending'.")

if __name__ == "__main__":
    reset_ai_errors()
