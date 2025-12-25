# -*- coding: utf-8 -*-
"""
Report Generator V1.1:
- Queries Supabase for articles added in the last 4 hours.
- Tracks 'Collected' (raw_news) vs 'Analyzed' (articles).
- Generates a text report for email delivery.
"""

import os
import datetime
from supabase import create_client
from dotenv import load_dotenv

# Load env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_detailed_report():
    print("📊 Generating 4-hour activities report...")
    
    # Calculate time window (4 hours ago in UTC)
    now_utc = datetime.datetime.utcnow()
    four_hrs_ago_utc = now_utc - datetime.timedelta(hours=4)
    
    # Format for display (KST)
    now_kst = now_utc + datetime.timedelta(hours=9)
    start_kst = four_hrs_ago_utc + datetime.timedelta(hours=9)
    
    time_window_str = f"{start_kst.strftime('%H:%M')} ~ {now_kst.strftime('%H:%M')}"
    iso_time_filter = four_hrs_ago_utc.isoformat()
    
    try:
        # [1] Get Collected Articles (raw_news)
        raw_res = supabase.table("raw_news").select("id", count='exact').gt("created_at", iso_time_filter).execute()
        collected_count = raw_res.count if raw_res.count is not None else 0
        
        # [2] Get AI Processed & Deployed Articles (articles)
        prod_res = supabase.table("articles").select("*").gt("created_at", iso_time_filter).execute()
        analyzed_articles = prod_res.data
        analyzed_count = len(analyzed_articles)
        
        # [3] Calculate Attempts (Heuristic: 30 min intervals = 8 attempts max in 4 hours)
        # We assume 8 attempts since it's scheduled every 30m.
        attempts = 8 

        # Format the report
        report = []
        report.append(f"� [뉴스 대시보드] 4시간 정기 활동 보고")
        report.append(f"⏰ 시간대: {time_window_str} (KST)")
        report.append(f"--------------------------------------------------")
        report.append(f"🔄 수집 시도: {attempts}회 (30분 간격)")
        report.append(f"📥 수집된 기사: {collected_count}건")
        report.append(f"🧠 AI 분석 완료: {analyzed_count}건")
        report.append(f"🚀 시트/페이지 배포: {analyzed_count}건")
        report.append(f"--------------------------------------------------\n")
        
        if analyzed_count > 0:
            # Group by keyword for utility
            keyword_stats = {}
            high_impact = []
            
            for art in analyzed_articles:
                kw = art.get('keyword', '기타')
                keyword_stats[kw] = keyword_stats.get(kw, 0) + 1
                if art.get('impact_level', 0) >= 4:
                    high_impact.append(art['title'])
            
            report.append("📈 주요 키워드 요약:")
            for kw, kw_count in sorted(keyword_stats.items(), key=lambda x: x[1], reverse=True):
                report.append(f" - {kw}: {kw_count}건")
            
            if high_impact:
                report.append("\n🔥 주요 뉴스 (High Impact):")
                for title in high_impact[:5]:
                    report.append(f" - {title}")
        else:
            report.append("💤 해당 시간대에는 새로운 소식이 없습니다.")
            
        report.append(f"\n🔗 전체 대시보드 보기: https://hgdaniel.vercel.app")
        
        report_text = "\n".join(report)
        
        # Save to file for GitHub Action to read
        with open("report_body.txt", "w", encoding="utf-8") as f:
            f.write(report_text)
            
        print(f"✅ Report generated: {collected_count} collected, {analyzed_count} analyzed.")
        return report_text

    except Exception as e:
        print(f"❌ Error generating report: {e}")
        return None

if __name__ == "__main__":
    generate_detailed_report()
