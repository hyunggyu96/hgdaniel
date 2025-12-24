
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

res = supabase.table("articles").select("count", count="exact").execute()
print(f"Total articles in DB: {res.count}")
