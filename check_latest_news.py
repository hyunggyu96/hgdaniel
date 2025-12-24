import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv('web/.env.local')

# Create Supabase client
supabase = create_client(
    os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Get latest news
result = supabase.table('news').select('published_at, title').order('published_at', desc=True).limit(1).execute()

if result.data:
    latest = result.data[0]
    print(f"최신 뉴스 시간: {latest['published_at']}")
    print(f"제목: {latest['title']}")
else:
    print("뉴스가 없습니다.")
