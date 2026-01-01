"""판다스 없이 HTML 보고서 생성 (태블릿 호환용)"""
import os
import sys
import asyncio
import csv
from supabase import create_client

# 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'collector'))
from collector.processor import is_medical_news_ai

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def generate_advanced_report():
    print("📋 [고성능 모드] 최근 300개 기사 분석 시작 (Pandas-free)...")
    
    res = supabase.table('articles').select('id', 'title', 'description', 'link', 'keyword').order('created_at', desc=True).limit(300).execute()
    articles = res.data
    
    html_rows = ""
    csv_rows = []
    
    for i, art in enumerate(articles):
        title = art['title']
        desc = art['description'] or ""
        
        # AI 정밀 재검증
        is_valid = await is_medical_news_ai(title, desc)
        
        status = "❌ 삭제 권장 (노이즈)" if not is_valid else "✅ 유지 (전문 뉴스)"
        bg_color = "#f8d7da" if not is_valid else "#d1e7dd"
        
        reason = "자동차/기계 부품" if any(kw in title for kw in ["SUV", "신차", "전기차", "A-필러"]) else "리워드/퀴즈"
        if not is_valid and all(not kw in title for kw in ["캐시", "퀴즈", "SUV"]):
             reason = "단순 거시경제/업계외 뉴스"
        elif is_valid:
             reason = "의료/바이오 전문 정보"

        # HTML용 행 생성
        html_rows += f"""
        <tr style="background-color: {bg_color};">
            <td>{i+1}</td>
            <td>{art['keyword']}</td>
            <td><b>{status}</b></td>
            <td>{reason}</td>
            <td>{title}</td>
            <td><a href="{art['link']}" target="_blank">기사보기</a></td>
        </tr>"""
        
        csv_rows.append([i+1, art['id'], art['keyword'], status, reason, title, art['link']])
        if (i+1) % 10 == 0: print(f"   ({i+1}/300 분석 완료...)")

    # 1. HTML 저장
    with open('advanced_report_300.html', 'w', encoding='utf-8') as f:
        f.write(f"""
        <html><head><meta charset='utf-8'>
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'>
        <style>body {{ padding: 20px; font-family: 'Malgun Gothic', sans-serif; }}</style>
        </head><body>
        <h2>📰 뉴스 데이터 정밀 분석 리포트 (V4.2)</h2>
        <p>※ <b>빨간색</b>은 삭제 권장, <b>초록색</b>은 유지 권장 항목입니다.</p>
        <table class='table table-bordered'>
            <thead><tr><th>No</th><th>키워드</th><th>판단</th><th>사유</th><th>기사 제목</th><th>링크</th></tr></thead>
            <tbody>{html_rows}</tbody>
        </table></body></html>""")

    # 2. CSV 저장 (UTF-8-SIG)
    with open('advanced_report_300.csv', 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['No', 'ID', '키워드', '판단', '사유', '기사 제목', '링크'])
        writer.writerows(csv_rows)

    print("\n[V] 분석 완료! HTML과 CSV 파일이 생성되었습니다.")

if __name__ == "__main__":
    asyncio.run(generate_advanced_report())
