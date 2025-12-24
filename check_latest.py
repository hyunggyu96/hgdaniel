import os
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime

# Load env variables
load_dotenv()

# Helper to get env with warning
def get_env(key):
    val = os.getenv(key)
    if not val:
        print(f"⚠️ Warning: {key} is missing")
    return val

supabase = create_client(
    get_env('NEXT_PUBLIC_SUPABASE_URL') or '',
    get_env('SUPABASE_SERVICE_ROLE_KEY') or ''
)

# Get latest news
result = supabase.table('articles').select('published_at, title, main_keywords').order('published_at', desc=True).limit(10).execute()

print("=== 최신 뉴스 10개 ===\n")
for i, article in enumerate(result.data, 1):
    # Convert UTC to KST
    utc_time = article['published_at']
    title = article['title']
    keywords = article.get('main_keywords', [])
    
    print(f"{i}. {utc_time}")
    print(f"   {title}")
    print(f"   키워드: {keywords[:3] if keywords else 'N/A'}\n")
