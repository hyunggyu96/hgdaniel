from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('web/.env.local')

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

keywords_to_check = [
    'HA filler',
    'ha filler',
    'HA Filler',
    'hyaluronic filler',
    'Hyaluronic filler',
    'hyaluronic acid filler',
    'Hyaluronic acid filler',
    'Hyaluronic Acid Filler'
]

print("Checking counts for filler keywords...")

for kw in keywords_to_check:
    try:
        res = supabase.table("pubmed_papers").select("*", count="exact").contains("keywords", [kw]).execute()
        print(f"[{kw}]: {res.count}")
    except Exception as e:
        print(f"[{kw}]: Error {e}")
