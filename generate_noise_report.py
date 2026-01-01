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
    print("📋 최근 기사 300개 노이즈 분석 중... (시간이 다소 소요됩니다)")
    
    # 최근 300개 기사 가져오기
    res = supabase.table('articles').select('id', 'title', 'description', 'link', 'keyword').order('created_at', desc=True).limit(300).execute()
    articles = res.data
    
    import csv
    with open('noise_report_300.csv', 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['번호', 'ID', '키워드', '기사 제목', 'AI 판단', '판단 근거', '링크'])
        
        noise_candidates_count = 0
        for i, art in enumerate(articles):
            title = art['title']
            desc = art['description'] or ""
            
            # AI에게 정밀 분석 요청
            is_valid = await is_medical_news_ai(title, desc)
            
            status = "삭제 권장" if not is_valid else "보험(유지)"
            reason = ""
            if not is_valid:
                noise_candidates_count += 1
                reason = "자동차/부품" if any(kw in title for kw in ["필러", "SUV", "신차"]) else "리워드/퀴즈"
                if "캐시" in title or "퀴즈" in title: reason = "리워드/퀴즈"
                if not reason: reason = "업계 관련성 낮음"
            
            writer.writerow([i+1, art['id'], art['keyword'], title, status, reason, art['link']])
            
            if (i+1) % 10 == 0:
                print(f"   ({i+1}/300 검토 완료...)")

    print(f"\n✅ 분석 완료! 'noise_report_300.csv' 파일이 생성되었습니다.")
    print(f"🚩 삭제 권장 항목: {noise_candidates_count}개")

if __name__ == "__main__":
    asyncio.run(generate_report())
