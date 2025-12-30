import os
import datetime
import asyncio
from supabase import create_client, Client

# Supabase 설정 (GitHub Secrets에서 주입받음)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY not set.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_report():
    print("Generating 4-Hour Activity Report...")
    
    # 시간 범위 설정 (지난 4시간)
    now = datetime.datetime.utcnow()
    four_hours_ago = now - datetime.timedelta(hours=4)
    time_filter = four_hours_ago.isoformat()

    # 1. 수집된 뉴스 (Raw News) 카운트
    # created_at이 4시간 이내인 것
    raw_res = supabase.table("raw_news") \
        .select("id", count="exact") \
        .gte("created_at", time_filter) \
        .execute()
    raw_count = raw_res.count if raw_res.count is not None else len(raw_res.data)

    # 2. 분석 완료된 뉴스 (Articles) 카운트
    processed_res = supabase.table("articles") \
        .select("id, title, main_keywords, published_at", count="exact") \
        .gte("created_at", time_filter) \
        .order("published_at", desc=True) \
        .limit(10) \
        .execute()
    processed_count = processed_res.count if processed_res.count is not None else len(processed_res.data)
    recent_articles = processed_res.data

    # 3. 보고서 본문 작성 (Markdown/Text)
    kst_now = now + datetime.timedelta(hours=9)
    report_lines = []
    report_lines.append(f"Subject: [News Dashboard] 4-Hour Operation Report ({kst_now.strftime('%H:%M')})")
    report_lines.append(f"")
    report_lines.append(f"🤖 **System Status Report**")
    report_lines.append(f"Date: {kst_now.strftime('%Y-%m-%d %H:%M:%S')} (KST)")
    report_lines.append(f"----------------------------------------")
    report_lines.append(f"")
    report_lines.append(f"📊 **Activity Summary (Last 4 Hours)**")
    report_lines.append(f"- 📥 **Collected (Raw)**: {raw_count} items")
    report_lines.append(f"- 🧠 **Analyzed (Processed)**: {processed_count} items")
    
    status_emoji = "🟢 Healthy" if processed_count > 0 else "🔴 Check System"
    if processed_count == 0 and raw_count > 0: status_emoji = "⚠️ Processing Lag"
    
    report_lines.append(f"- 🌡️ **System Health**: {status_emoji}")
    report_lines.append(f"")
    report_lines.append(f"📰 **Recent Key Articles**")
    
    if recent_articles:
        for idx, item in enumerate(recent_articles, 1):
            keywords = ", ".join(item.get('main_keywords', [])[:3])
            report_lines.append(f"{idx}. [{keywords}] {item['title']}")
    else:
        report_lines.append("(No articles processed in this period)")
        
    report_lines.append(f"")
    report_lines.append(f"----------------------------------------")
    report_lines.append(f"News Dashboard Auto-Generated Report")

    # 파일로 저장 (GitHub Action이 읽을 수 있게)
    with open("report_body.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    
    print("Report generated successfully: report_body.txt")

if __name__ == "__main__":
    generate_report()
