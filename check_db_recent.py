
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Windows console encoding fix
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv("collector/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(url, key)

try:
    print("Fetching last 5 articles...")
    response = supabase.table("articles").select("title, published_at, created_at").order("published_at", desc=True).limit(5).execute()
    
    for item in response.data:
        print(f"[{item['published_at']}] {item['title']} (Created: {item['created_at']})")

    print("\nFetching last 5 raw_news...")
    response = supabase.table("raw_news").select("title, pub_date, status").order("pub_date", desc=True).limit(5).execute()
    for item in response.data:
        print(f"[{item['pub_date']}] {item['title']} (Status: {item['status']})")
        
except Exception as e:
    print(f"Error: {e}")
