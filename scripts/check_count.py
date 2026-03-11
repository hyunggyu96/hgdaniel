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

# 1. Check total count
try:
    # count param: exact, planned, estimated
    count_res = supabase.table("pubmed_papers").select("*", count="exact").execute()
    total_count = count_res.count
    print(f"Total rows in pubmed_papers: {total_count}")

    # 2. Check keyword counts
    # 'Botulinum Toxin'
    res_title = supabase.table("pubmed_papers").select("*", count="exact").contains("keywords", ["Botulinum Toxin"]).execute()
    print(f"Count with keyword ['Botulinum Toxin']: {res_title.count}")

    # 'botulinum toxin'
    res_lower = supabase.table("pubmed_papers").select("*", count="exact").contains("keywords", ["botulinum toxin"]).execute()
    print(f"Count with keyword ['botulinum toxin']: {res_lower.count}")

except Exception as e:
    print(f"Error querying DB: {e}")
