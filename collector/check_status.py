import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase credentials missing from .env")
    exit(1)

def check_status():
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Count Pending
        pending = supabase.table("raw_news").select("id", count="exact").eq("status", "pending").execute()
        pending_count = pending.count if pending.count is not None else len(pending.data)
        
        # Count Processed (for context)
        # processed = supabase.table("raw_news").select("id", count="exact").eq("status", "processed").execute()
        # processed_count = processed.count if processed.count is not None else len(processed.data)
        
        print(f"-------- STATUS REPORT --------")
        print(f"⏳ Pending Analysis: {pending_count}")
        # print(f"✅ Processed Total:  {processed_count}")
        print(f"-------------------------------")
        
        if pending_count > 0:
            print(f"⚠️ There are {pending_count} news items waiting for AI analysis.")
            print("   If this number is not decreasing, the 'processor.py' script may not be running.")
        else:
            print("✅ All news items have been processed.")
            
    except Exception as e:
        print(f"❌ Error querying database: {e}")

if __name__ == "__main__":
    check_status()
