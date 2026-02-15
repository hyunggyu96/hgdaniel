from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('web/.env.local')

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Supabase config missing")
    exit(1)

supabase = create_client(url, key)

OLD_KW = 'Botulinum Toxin'
NEW_KW = 'botulinum toxin'

def normalize_keywords():
    print(f"Normalizing '{OLD_KW}' to '{NEW_KW}'...")
    
    # Fetch all records with the old keyword
    # We can handle this in chunks
    
    total_updated = 0
    has_more = True
    page_size = 1000
    
    while has_more:
        # Fetch rows containing the old keyword
        # We need all columns to satisfy NOT NULL constraints for UPSERT
        res = supabase.table("pubmed_papers") \
            .select("*") \
            .contains("keywords", [OLD_KW]) \
            .limit(page_size) \
            .execute()
            
        rows = res.data
        if not rows:
            has_more = False
            break
            
        print(f"Fetched {len(rows)} rows to update...")
        
        updates = []
        for row in rows:
            kws = row.get('keywords', [])
            if not kws: continue
            
            # Replace
            new_kws = [NEW_KW if k == OLD_KW else k for k in kws]
            new_kws = list(set(new_kws))
            
            # Use full row data for upsert
            row_data = row.copy()
            row_data['keywords'] = new_kws
            
            updates.append(row_data)
            
        if updates:
            # Perform upsert
            res_update = supabase.table("pubmed_papers").upsert(updates).execute()
            count = len(updates) # approximate, real count in res?
            total_updated += count
            print(f"  Updated {count} rows.")
            
        if len(rows) < page_size:
            has_more = False
            
    print(f"Normalization complete. Total updated: {total_updated}")

if __name__ == "__main__":
    normalize_keywords()
