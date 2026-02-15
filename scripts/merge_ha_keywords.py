from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('web/.env.local')

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

SOURCE_KW = 'hyaluronic filler'
TARGET_KW = 'HA filler'

def merge_keywords():
    print(f"Merging '{SOURCE_KW}' into '{TARGET_KW}'...")
    
    total_updated = 0
    has_more = True
    page_size = 1000
    
    while has_more:
        # Fetch rows containing the source keyword
        res = supabase.table("pubmed_papers") \
            .select("*") \
            .contains("keywords", [SOURCE_KW]) \
            .limit(page_size) \
            .execute()
            
        rows = res.data
        if not rows:
            has_more = False
            break
            
        print(f"Fetched {len(rows)} matching rows...")
        
        updates = []
        for row in rows:
            kws = row.get('keywords', [])
            if not kws: continue
            
            # Remove Source
            new_kws = [k for k in kws if k != SOURCE_KW]
            
            # Add Target if not present
            if TARGET_KW not in new_kws:
                new_kws.append(TARGET_KW)
            
            # Safe copy
            row_data = row.copy()
            row_data['keywords'] = new_kws
            
            updates.append(row_data)
            
        if updates:
            res_update = supabase.table("pubmed_papers").upsert(updates).execute()
            count = len(updates)
            total_updated += count
            print(f"  Updated {count} rows.")
            
        if len(rows) < page_size:
            has_more = False
            
    print(f"Merge complete. Total merged: {total_updated}")

if __name__ == "__main__":
    merge_keywords()
