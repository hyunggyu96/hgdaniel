
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Windows console encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load env from current directory or collector
load_dotenv(".env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url:
    load_dotenv("collector/.env")
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

if not url:
    print("Error: credentials not found")
    sys.exit(1)

supabase = create_client(url, key)

def fix_gita():
    print("Fetching articles with '기타' tag...")
    
    # Fetch reasonably large number of recent articles to check
    # We can't easily do array contains '기타' via python client sometimes without correct setup, 
    # but we can fetch and filter in memory for simplicity on small datasets.
    response = supabase.table("articles").select("id, title, main_keywords, keyword").order("published_at", desc=True).limit(200).execute()
    
    count = 0
    for art in response.data:
        m_kws = art.get('main_keywords')
        search_kw = art.get('keyword')
        
        updated = False
        new_kws = []
        
        if not m_kws:
            # If empty, replace with search keyword
            if search_kw:
                new_kws = [search_kw]
                updated = True
        else:
            # Check if '기타' is in list
            if '기타' in m_kws:
                # Remove all '기타'
                temp_kws = [k for k in m_kws if k != '기타']
                
                # If we have a search keyword and it's not in the list, add it as primary
                if search_kw:
                    if search_kw not in temp_kws:
                        temp_kws.insert(0, search_kw)
                
                # If list became empty and no search_kw? (Rare)
                if not temp_kws:
                    temp_kws = ['News'] # Very fallback
                    
                new_kws = temp_kws
                updated = True
            else:
                # Also deduplicate if needed
                if len(m_kws) != len(set(m_kws)):
                    new_kws = list(dict.fromkeys(m_kws)) # preserve order
                    updated = True
                else:
                    new_kws = m_kws

        if updated:
            print(f"Fixing: {art['title'][:30]}... ({m_kws} -> {new_kws})")
            try:
                supabase.table("articles").update({"main_keywords": new_kws}).eq("id", art['id']).execute()
                count += 1
            except Exception as e:
                print(f"  Error: {e}")

    print(f"Fixed {count} articles.")

if __name__ == "__main__":
    fix_gita()
