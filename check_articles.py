"""Supabase articles 테이블 확인"""
import os
from supabase import create_client

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"

client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 60)
print("📊 Supabase articles 테이블 (웹사이트 표시용)")
print("=" * 60)

# 최신 10개
result = client.table('articles').select('title, published_at').order('published_at', desc=True).limit(10).execute()

print("\n[최신 10개 뉴스]")
for r in result.data:
    pub = r['published_at'][:16].replace('T', ' ') if r['published_at'] else "N/A"
    print(f"  📰 [{pub}] {r['title'][:45]}...")

# 1월 1일 데이터 개수
jan1_result = client.table('articles').select('id', count='exact').gte('published_at', '2026-01-01').execute()
print(f"\n[2026-01-01 이후 데이터]: {jan1_result.count}개")

print("=" * 60)
