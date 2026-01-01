"""삭제된 articles 데이터를 raw_news로부터 복구"""
import os
import sys
import asyncio
from supabase import create_client

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def restore():
    print("🛠️ 시스템 복구 모드 가동...")
    
    # 1. 현재 articles에 있는 링크들 가져오기
    res_art = supabase.table('articles').select('link').execute()
    existing_links = {item['link'] for item in res_art.data}
    
    # 2. raw_news에서 최근 데이터 가져오기 (복구 대상)
    # 넉넉하게 최근 500개 검토
    res_raw = supabase.table('raw_news').select('*').order('created_at', desc=True).limit(500).execute()
    raw_articles = res_raw.data
    
    restored_count = 0
    for raw in raw_articles:
        link = raw['link']
        if link not in existing_links:
            # articles에 없는 기사 발견 -> 복구 대상
            print(f"  ♻️ 복구 중: {raw['title'][:30]}...")
            
            # articles 테이블 형식에 맞춰 재구성 (필요한 최소 정보만 우선 복구)
            restore_data = {
                "title": raw['title'],
                "description": raw['description'],
                "link": raw['link'],
                "published_at": raw['published_at'],
                "source": raw.get('source', 'Naver'),
                "keyword": raw['keyword'],
                "main_keywords": [raw['keyword']], # 기본 키워드라도 복구
                "ai_summary": raw['description'][:100] if raw['description'] else ""
            }
            
            try:
                supabase.table('articles').insert(restore_data).execute()
                restored_count += 1
                existing_links.add(link) # 중복 방지
            except Exception as e:
                print(f"    ❌ 복구 실패: {e}")

    print(f"\n✅ 복구 완료! 총 {restored_count}개의 기사가 시스템에 다시 추가되었습니다.")

if __name__ == "__main__":
    asyncio.run(restore())
