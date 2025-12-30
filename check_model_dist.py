import os
from dotenv import load_dotenv
from supabase import create_client

env_path = os.path.join('collector', '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

res = supabase.table('articles').select('title, model').order('created_at', desc=True).limit(10).execute()

print("\n🤖 [Recent 10 Articles Analysis Models]")
print("-" * 60)
for i, art in enumerate(res.data, 1):
    model = art.get('model', 'Unknown')
    print(f"{i}. [{model}] {art['title'][:40]}...")
print("-" * 60)
