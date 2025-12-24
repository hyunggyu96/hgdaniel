import os
import sys

# Set environment variables
os.environ['NEXT_PUBLIC_SUPABASE_URL'] = 'https://jwkdxygcpfdmavxcbcfe.supabase.co'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo'

from supabase import create_client

# Create Supabase client
supabase = create_client(
    os.environ['NEXT_PUBLIC_SUPABASE_URL'],
    os.environ['SUPABASE_SERVICE_ROLE_KEY']
)

print("=== Supabase DB 확인 ===\n")

# Get total count
count_result = supabase.table('articles').select('id', count='exact').execute()
total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
print(f"총 뉴스 개수: {total_count}개\n")

# Get latest 5 news
latest_result = supabase.table('articles').select('published_at, title, main_keywords').order('published_at', desc=True).limit(5).execute()

print("최신 뉴스 5개:")
print("-" * 80)
for i, news in enumerate(latest_result.data, 1):
    pub_time = news['published_at']
    title = news['title'][:60] + '...' if len(news['title']) > 60 else news['title']
    keywords = ', '.join(news.get('main_keywords', [])[:3]) if news.get('main_keywords') else 'N/A'
    print(f"{i}. [{pub_time}] {title}")
    print(f"   키워드: {keywords}\n")
