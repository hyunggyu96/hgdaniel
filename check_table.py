import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('web/.env.local')

url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(url, key)

print(f"Checking table: user_collections at {url}")

try:
    response = supabase.table('user_collections').select('*').limit(1).execute()
    print("✅ Table 'user_collections' exists.")
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nAttempting to create table via raw SQL if possible...")
    # Typically supabase python client doesn't support DDL either, 
    # but some setups allow it via postgrest if configured. 
    # Usually it's better to just tell the user.
