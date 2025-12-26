
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
    response = supabase.table("articles").select("*").order("published_at", desc=True).limit(30).execute()
    
    count = 0
    for art in response.data:
        # Check if main_keywords is just ['기타'] or empty or null
        main_kws = art.get('main_keywords')
        current_sub = art.get('keywords') # Check legacy too
        
        is_bad = False
        if not main_kws: # Null or empty
            is_bad = True
        elif len(main_kws) == 1 and main_kws[0] == '기타':
            is_bad = True
        elif len(main_kws) == 0:
            is_bad = True
            
        if is_bad:
            print(f"Updating: {art['title']}")
            title = art.get('title', '')
            desc = art.get('description', '') or ''
            
            # Use local extractor
            local_main = extract_main_keyword(desc, title=title)
            local_sub = extract_keywords(f"{title} {desc}")
            
            # Deduplicate
            if local_main in local_sub:
                local_sub.remove(local_main)
            
            # Construct main_keywords array: [Main, Sub1, Sub2...]
            new_main_kws = [local_main] + local_sub
            
            # Update DB
            # Update both main_keywords (new schema) and keywords (legacy/backup)
            try:
                supabase.table("articles").update({
                    "main_keywords": new_main_kws,
                    "keyword": local_main, # Also update the search 'keyword' column if logic dictates, but safe to leave or set to main
                    "keywords": local_sub 
                }).eq("id", art['id']).execute()
                print(f"  -> Set to: {new_main_kws}")
                count += 1
            except Exception as e:
                print(f"  Error updating: {e}")

    print(f"Backfill complete. Updated {count} articles.")

if __name__ == "__main__":
    backfill()
