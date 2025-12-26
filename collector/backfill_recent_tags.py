
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
from local_keyword_extractor import extract_keywords, extract_main_keyword

# Windows console encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load env from current directory (collector is cwd when running)
load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url:
    # Try looking in parent/collector
    load_dotenv("collector/.env")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

if not url:
    print("Error: credentials not found")
    sys.exit(1)

supabase = create_client(url, key)

def backfill():
    print("Fetching recent articles to check for missing tags...")
    # Fetch last 30 articles
    response = supabase.table("articles").select("*").order("published_at", desc=True).limit(200).execute()
    
    count = 0
    for art in response.data:
        title = art.get('title', '')
        desc = art.get('description', '') or ''
        current_kws = art.get('main_keywords') or []
        
        # Always re-calculate to ensure we didn't miss anything that's in the pool
        local_main = extract_main_keyword(desc, title=title)
        local_all = extract_keywords(f"{title} {desc}", top_n=10)
        
        new_kws = list(set([local_main] + local_all))
        new_kws = [k for k in new_kws if k and k != '기타']
        
        # Only update if the set of keywords has changed or grown
        if set(new_kws) != set(current_kws):
            print(f"Updating: {title[:40]}...")
            print(f"  Old: {current_kws}")
            print(f"  New: {new_kws}")
            
            # Update DB
            # Update both main_keywords (new schema) and keywords (legacy/backup)
            try:
                supabase.table("articles").update({
                    "main_keywords": new_kws,
                    "keyword": local_main,
                    "keywords": local_all 
                }).eq("id", art['id']).execute()
                print(f"  -> Set to: {new_kws}")
                count += 1
            except Exception as e:
                print(f"  Error updating: {e}")

    print(f"Backfill complete. Updated {count} articles.")

if __name__ == "__main__":
    backfill()
