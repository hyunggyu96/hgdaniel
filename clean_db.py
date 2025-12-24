
import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

async def clean_noise_data():
    # Noise keywords to delete
    NOISE_KEYWORDS = ['PLA', '레이저', '고주파', 'RF']
    
    print("🧹 Starting DB Cleanup...")
    total_deleted = 0
    
    for kw in NOISE_KEYWORDS:
        try:
            # First count
            res = supabase.table("articles").select("*", count="exact").eq("keyword", kw).execute()
            count = res.count
            if count > 0:
                print(f"   found {count} articles for '{kw}'. Deleting...")
                # Delete
                supabase.table("articles").delete().eq("keyword", kw).execute()
                print(f"   ✅ Deleted {count} entries for '{kw}'.")
                total_deleted += count
            else:
                print(f"   ✨ No entries found for '{kw}'.")
                
        except Exception as e:
            print(f"   ❌ Error deleting '{kw}': {e}")
            
    print(f"\n🎉 Cleanup Complete! Total {total_deleted} noise articles removed.")

if __name__ == "__main__":
    asyncio.run(clean_noise_data())
