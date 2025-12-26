
import os
import re
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

PILLAR_REGEX = re.compile(r"[A-C]\s*(-|—)?\s*필러", re.IGNORECASE)

def final_cleanup():
    print("🧹 Starting Final Targeted Cleanup...")
    # Get recent articles
    res = supabase.table("articles").select("id, title, description").order("published_at", desc=True).limit(300).execute()
    
    deleted_ids = []
    # Force delete the ones from image
    force_ids = [41596, 41573]
    
    for art in res.data:
        full_text = f"{art['title']} {art.get('description', '') or ''}"
        
        should_delete = False
        if art['id'] in force_ids:
            should_delete = True
            reason = "FORCED (User reported)"
        elif PILLAR_REGEX.search(full_text):
            should_delete = True
            reason = f"Regex Pillar Match: {PILLAR_REGEX.search(full_text).group()}"
        elif "르노코리아" in full_text or "아르카나" in full_text:
            should_delete = True
            reason = "Car Brand (Renault/Arkana)"
            
        if should_delete:
            print(f"🗑️ Deleting [{reason}]: {art['title'][:50]}...")
            supabase.table("articles").delete().eq("id", art['id']).execute()
            deleted_ids.append(art['id'])
            
    print(f"✅ Cleanup complete. Removed {len(deleted_ids)} articles.")

if __name__ == "__main__":
    final_cleanup()
