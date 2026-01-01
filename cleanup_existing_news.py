"""기존 articles 테이블을 전수 조사하여 노이즈(자동차, 퀴즈 등) 삭제"""
import os
import asyncio
from supabase import create_client
from collector.processor import is_medical_news_ai

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def cleanup():
    print("🧹 기존 데이터 노이즈 청소 시작...")
    
    # 1. 모든 기사 가져오기
    res = supabase.table('articles').select('id', 'title', 'description', 'link').execute()
    articles = res.data
    print(f"📊 총 {len(articles)}개 기사 검토 중...")
    
    deleted_count = 0
    for i, art in enumerate(articles):
        title = art['title']
        desc = art['description'] or ""
        
        # 최신 AI 로직으로 재검증
        is_valid = await is_medical_news_ai(title, desc)
        
        if not is_valid:
            print(f"  🗑️ 노이즈 발견 및 삭제: [{art['id']}] {title[:30]}...")
            supabase.table('articles').delete().eq('id', art['id']).execute()
            deleted_count += 1
        
        if (i+1) % 50 == 0:
            print(f"   ({i+1}/{len(articles)} 완료...)")
            
    print(f"\n✅ 청소 완료! 총 {deleted_count}개의 노이즈 기사를 제거했습니다.")

if __name__ == "__main__":
    asyncio.run(cleanup())
