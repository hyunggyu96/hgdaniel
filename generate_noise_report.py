"""기존 articles 테이블에서 노이즈 의심 항목 보고서 생성 (삭제 안함)"""
import os
import sys
import asyncio
from supabase import create_client

# 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'collector'))
from collector.processor import is_medical_news_ai

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def generate_report():
    print("📋 노이즈 의심 항목 분석 중...")
    
    # 최근 100개 기사 가져오기
    res = supabase.table('articles').select('id', 'title', 'description', 'link').order('created_at', desc=True).limit(100).execute()
    articles = res.data
    
    noise_candidates = []
    
    for art in articles:
        title = art['title']
        desc = art['description'] or ""
        
        # AI에게 물어보기
        is_valid = await is_medical_news_ai(title, desc)
        
        if not is_valid:
            # 왜 노이즈라고 생각하는지 간단한 추정 이유 추가
            reason = "자동차 부품 추정" if any(kw in title for kw in ["필러", "SUV", "신차"]) else "리워드/퀴즈 추정"
            if "캐시" in title or "퀴즈" in title: reason = "리워드/퀴즈 추정"
            
            noise_candidates.append({
                "id": art['id'],
                "title": title,
                "reason": reason,
                "link": art['link']
            })

    # 결과 출력 (Markdown 테이블 형식으로)
    print("\n### 🚩 AI 선정 삭제 후보 리스트 (최신 100개 중)")
    print("| 번호 | 기사 제목 | AI 판단 근거 | 링크 |")
    print("|---|---|---|---|")
    for i, item in enumerate(noise_candidates):
        print(f"| {i+1} | {item['title'][:40]}... | {item['reason']} | [링크]({item['link']}) |")
    
    print(f"\n총 {len(noise_candidates)}개의 의심 항목을 찾았습니다.")

if __name__ == "__main__":
    asyncio.run(generate_report())
