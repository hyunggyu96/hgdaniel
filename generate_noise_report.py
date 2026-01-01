"""기존 articles 테이블에서 노이즈 의심 항목 보고서 생성 (HTML + CSV)"""
import os
import sys
import asyncio
import pandas as pd
from supabase import create_client

# 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'collector'))
from collector.processor import is_medical_news_ai

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def generate_advanced_report():
    print("📋 [고성능 모드] 최근 300개 기사 분석 시작...")
    
    # 300개 기사 로드
    res = supabase.table('articles').select('id', 'title', 'description', 'link', 'keyword').order('created_at', desc=True).limit(300).execute()
    articles = res.data
    
    results = []
    for i, art in enumerate(articles):
        title = art['title']
        desc = art['description'] or ""
        
        # AI 정밀 재검증 (프롬프트 강화)
        is_valid = await is_medical_news_ai(title, desc)
        
        # 판단 근거 정교화
        status = "❌ 삭제 권장 (노이즈)" if not is_valid else "✅ 유지 (전문 뉴스)"
        
        # 수동 분류 로직 보완
        reason = "자동차/기계 부품" if any(kw in title for kw in ["SUV", "신차", "전기차", "A-필러"]) else "리워드/퀴즈"
        if not is_valid and "캐시" not in title and "퀴즈" not in title and "SUV" not in title:
            reason = "단순 거시경제/업계외 뉴스"
        elif is_valid:
            reason = "의료/바이오 전문 정보"

        results.append({
            "No": i+1,
            "ID": art['id'],
            "키워드": art['keyword'],
            "판단": status,
            "사유": reason,
            "기사 제목": title,
            "링크": art['link']
        })
        if (i+1) % 10 == 0: print(f"   ({i+1}/300 분석 완료...)")

    # 데이터프레임 생성
    df = pd.DataFrame(results)
    
    # 1. CSV 저장 (UTF-8-SIG는 엑셀 한글 깨짐 방지용)
    df.to_csv('advanced_report_300.csv', index=False, encoding='utf-8-sig') or print("CSV 저장 완료")
    
    # 2. HTML 저장 (가장 읽기 편한 형태)
    html_content = df.to_html(classes='table table-striped', render_links=True, escape=False)
    with open('advanced_report_300.html', 'w', encoding='utf-8') as f:
        f.write(f"<html><head><meta charset='utf-8'><link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'></head><body><div class='container-fluid'><h2>📰 뉴스 데이터 정밀 분석 리포트 (V4.2)</h2>{html_content}</div></body></html>")

    print("\n[V] 분석 완료! HTML과 CSV 파일이 생성되었습니다.")

if __name__ == "__main__":
    asyncio.run(generate_advanced_report())
