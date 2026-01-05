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
    print("Generating 2-Hour Activity Report...")
    
    # 시간 범위 설정 (지난 2시간)
    now = datetime.datetime.utcnow()
    two_hours_ago = now - datetime.timedelta(hours=2)
    time_filter = two_hours_ago.isoformat()

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

    # 3. 대기 중인 뉴스 (Pending) 카운트
    pending_res = supabase.table("raw_news") \
        .select("id", count="exact") \
        .eq("status", "pending") \
        .execute()
    pending_count = pending_res.count if pending_res.count is not None else len(pending_res.data)

    # 4. 전체 누적 뉴스 (Total) 카운트 (추가 업무)
    total_raw_res = supabase.table("raw_news").select("id", count="exact", head=True).execute()
    total_raw_count = total_raw_res.count if total_raw_res.count is not None else 0

    total_proc_res = supabase.table("articles").select("id", count="exact", head=True).execute()
    total_proc_count = total_proc_res.count if total_proc_res.count is not None else 0

    # 5. 보고서 본문 작성 (Markdown/Text)
    kst_now = now + datetime.timedelta(hours=9)
    report_lines = []
    report_lines.append(f"Subject: [News Dashboard] 2-Hour Operation Report ({kst_now.strftime('%H:%M')})")
    report_lines.append(f"")
    report_lines.append(f"🤖 **System Status Report**")
    report_lines.append(f"Date: {kst_now.strftime('%Y-%m-%d %H:%M:%S')} (KST)")
    report_lines.append(f"----------------------------------------")
    report_lines.append(f"")
    report_lines.append(f"📊 **Workload Status (Last 2h)**")
    report_lines.append(f"- 📥 **Collected**: {raw_count} items")
    report_lines.append(f"- 🧠 **Analyzed**: {processed_count} items")
    report_lines.append(f"- ⏳ **Pending**: {pending_count} items waiting")
    report_lines.append(f"")
    report_lines.append(f"📚 **Total Accumulation**")
    report_lines.append(f"- 📦 **Total Collected**: {total_raw_count} items")
    report_lines.append(f"- 💎 **Total Analyzed**: {total_proc_count} items")
    
    # Health Check Logic (Day/Night Aware)
    current_hour = kst_now.hour
    is_night_time = 0 <= current_hour < 6
    
    status_emoji = "🟢 Healthy"
    
    # [낮 시간] 활동 시간인데 수집/분석이 없다면 -> 사망 의심 (CRITICAL)
    if not is_night_time:
        if raw_count == 0:
            status_emoji = "🔴 CRITICAL: NO COLLECTION (Collector Dead?)"
        elif processed_count == 0 and pending_count > 0:
            status_emoji = "🔴 CRITICAL: PROCESSOR STUCK (0 Analyzed)"
        elif processed_count < 5 and pending_count > 50:
            status_emoji = "🟠 WARNING: Processing Slow"
            
    # [밤 시간] 새벽에는 0건이어도 정상 (Idle)
    else:
    # Backlog 공통 체크
    # [New] Heartbeat Check (Real "Are you alive?" Check)
    import json
    last_hbeat_str = "Unknown"
    is_alive = False
    
    try:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        hbeat_path = os.path.join(root_dir, "last_update.json")
        
        if os.path.exists(hbeat_path):
            with open(hbeat_path, "r", encoding='utf-8') as f:
                hbeat_data = json.load(f)
                proc_last = hbeat_data.get("processor_heartbeat", "")
                
                if proc_last:
                    # Parse Heartbeat Time
                    last_time = datetime.datetime.fromisoformat(proc_last)
                    diff = datetime.datetime.now() - last_time
                    minutes_ago = int(diff.total_seconds() / 60)
                    last_hbeat_str = f"{minutes_ago} min ago"
                    
                    # 10분 이내에 심장 뛰었으면 살아있는 것
                    if minutes_ago < 20: 
                        is_alive = True
    except Exception as e:
        print(f"⚠️ Heartbeat Check Failed: {e}")

    # Health Check Logic (Heartbeat Aware)
    status_emoji = "🟢 Healthy"
    
    # 1. 심장이 멈춤 (가장 치명적)
    if not is_alive:
        status_emoji = f"🔴 CRITICAL: PROCESSOR DEAD (Last Pulse: {last_hbeat_str})"
    
    # 2. 심장은 뛰는데 건수가 0 (Idle vs Stuck)
    elif processed_count == 0 and pending_count > 0:
        status_emoji = "🟠 WARNING: Processing Stuck (Alive but not reducing queue)"
        
    # 3. 심장 뛰고 건수 0, 큐도 0 (완벽한 정상 - Idle)
    elif processed_count == 0 and pending_count == 0:
         status_emoji = f"🟢 Healthy (Idle - Last Pulse: {last_hbeat_str})"

    # 4. 쌓이는 중
    elif pending_count > 200:
        status_emoji = "🟠 Heavy Load"
        
    report_lines.append(f"- 🌡️ **System Health**: {status_emoji}")
    report_lines.append(f"- 💓 **Last Heartbeat**: {last_hbeat_str}")
    report_lines.append(f"")
    report_lines.append(f"📰 **Recent Key Articles**")
    
    if recent_articles:
        for idx, item in enumerate(recent_articles, 1):
            # [V2] Use Description preview if Main Keyword is '기타'
            title_display = item['title']
            keywords = item.get('main_keywords', [])
            
            # 리스트면 문자열로 변환, 없으면 빈 리스트
            if isinstance(keywords, str):
                keywords = [keywords]
            elif not keywords:
                keywords = []
                
            kw_str = ", ".join(keywords[:2]) if keywords else "General"
            report_lines.append(f"{idx}. [{kw_str}] {title_display[:40]}...")
    else:
        report_lines.append("(No articles processed, but system is alive)")
        
    report_lines.append(f"")
    report_lines.append(f"----------------------------------------")
    report_lines.append(f"News Dashboard Auto-Generated Report")

    # 파일로 저장 (GitHub Action이 읽을 수 있게)
    with open("report_body.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    
    print("Report generated successfully: report_body.txt")

if __name__ == "__main__":
    generate_report()
