import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load env
if os.path.exists('.env.local'):
    load_dotenv('.env.local')
else:
    load_dotenv()

url = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')

if not url:
    print("No URL")
    exit()

supabase = create_client(url, key)

# Get count for last 24 hours
pst_24h = datetime.utcnow() - timedelta(hours=24)
res = supabase.table("articles").select("id", count="exact").gte("created_at", pst_24h.isoformat()).execute()

print(f"Recent Count: {res.count}")
