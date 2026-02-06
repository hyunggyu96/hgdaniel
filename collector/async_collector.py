import sys
import os

# Sentry SDK Integration
try:
    import sentry_sdk
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )
    print("Sentry initialized successfully.")
except ImportError:
    print("sentry-sdk not found. Error tracking disabled.")
except Exception as e:
    print(f"Sentry init failed: {e}")

import asyncio
import aiohttp
import email.utils
import datetime
import re

from dotenv import load_dotenv
from supabase import create_client

# [1] 터미널 한글 깨짐 방지 for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# [2] 환경 변수 및 경로 설정
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Keys
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# [3] Clients Initialization
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Search Keywords (Crawl Keys)
KEYWORDS = os.getenv("KEYWORDS", "필러,톡신,보톡스,쥬베룩,리쥬란,엑소좀").split(",")

def clean_text_expert(val):
    if val is None: return "-"
    s = str(val).strip()
    # Remove HTML tags and control chars
    s = re.sub(r'<[^>]*>', '', s)
    s = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', s)
    s = s.replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return s

# [4] Naver News Fetching
async def fetch_naver_news_expert(session, keyword, start_date):
    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    
    all_items = []
    # [V4.6] Fetch 200 items (2 pages) to catch news without keyword in title
    for start_idx in [1, 101]:
        params = {"query": keyword, "display": 100, "sort": "date", "start": start_idx}
        try:
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    items = data.get('items', [])
                    if not items: break
                    
                    for item in items:
                        pub_date = email.utils.parsedate_to_datetime(item['pubDate'])
                        if pub_date.replace(tzinfo=None) > start_date:
                            all_items.append(item)
        except Exception as e:
            print(f"  ⚠️ Naver API Error for [{keyword}] at start={start_idx}: {e}")
            break
    return all_items

# [5] Process Single Item (Save Raw)
async def process_news_item_expert(item, search_keyword, existing_links):
    link = item['link']
    if link in existing_links: return 0

    title = clean_text_expert(item['title'])
    desc = clean_text_expert(item['description'])
    pub_iso = email.utils.parsedate_to_datetime(item['pubDate']).isoformat()

    try:
        supabase_data = {
            "title": title,
            "description": desc,
            "link": link,
            "pub_date": pub_iso,
            "search_keyword": search_keyword,
            "status": "pending"
        }
        supabase.table("raw_news").insert(supabase_data).execute()
        print(f"📦 [RAW] Collected: {title[:40]}...")
        existing_links.add(link)
        return 1
    except Exception as e:
        if "duplicate key" not in str(e):
            print(f"  ❌ Raw Sync Error: {e}")
        return 0

# [6] Main Execution
async def main():
    # ============================================
    # 🚀 시작 배너 및 환경 체크 (Termux 재시작 시 확인용)
    # ============================================
    print("=" * 50)
    print("🚀 NEWS COLLECTOR 시작")
    print("=" * 50)
    print(f"⏰ 시작 시각: {datetime.datetime.now()}")
    print(f"📦 수집 키워드: {', '.join(KEYWORDS)}")
    
    # 환경 체크
    env_ok = True
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("❌ [ENV ERROR] NAVER API 키가 설정되지 않음!")
        env_ok = False
    else:
        print(f"✅ NAVER API: 설정됨 (ID: {NAVER_CLIENT_ID[:8]}...)")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ [ENV ERROR] SUPABASE 키가 설정되지 않음!")
        env_ok = False
    else:
        print(f"✅ SUPABASE: 설정됨 ({SUPABASE_URL[:30]}...)")
    
    if not env_ok:
        print("🚨 환경 변수 오류로 수집 불가. 종료합니다.")
        return
    
    print("=" * 50)
    print("📡 뉴스 수집 루프 시작...")
    print("=" * 50)
    
    single_run = os.getenv("SINGLE_RUN", "false").lower() == "true"
    
    while True:
        try:
            print(f"\n⏰ Cycle Start: {datetime.datetime.now()}")
            
            # ============================================
            # [V6.0] 마지막 뉴스 발행시간 기준 수집 (Supabase 조회)
            # Termux 재시작해도 놓친 뉴스 없이 수집!
            # ============================================
            
            # Supabase에서 마지막 수집된 뉴스의 pub_date 조회 (KST 기준)
            global_start_date = datetime.datetime(2025, 12, 19)  # 기본 fallback
            try:
                # raw_news에서 가장 최근 pub_date 조회
                last_raw = supabase.table("raw_news").select("pub_date").order("pub_date", desc=True).limit(1).execute()
                if last_raw.data and last_raw.data[0].get("pub_date"):
                    last_pub_str = last_raw.data[0]["pub_date"]
                    # ISO 형식 파싱 (timezone 정보 제거)
                    global_start_date = datetime.datetime.fromisoformat(last_pub_str.replace('Z', '+00:00').replace('+09:00', '')).replace(tzinfo=None)
                    print(f"📅 마지막 수집 뉴스 발행시각: {global_start_date} (이후 뉴스만 수집)")
                else:
                    print(f"📅 수집 기록 없음, 기본값 사용: {global_start_date}")
            except Exception as e:
                print(f"⚠️ 마지막 발행시각 조회 실패: {e}, 기본값 사용")
            
            # 모든 키워드에 동일한 start_date 적용 (마지막 발행시각 기준)
            keyword_items_to_process = [(kw, global_start_date) for kw in KEYWORDS]

            # Load existing links once for the cycle (Last 1500 for speed)
            existing_links = set()
            try:
                res_raw = supabase.table("raw_news").select("link").order("created_at", desc=True).limit(1000).execute().data
                for r in res_raw: existing_links.add(r['link'])
                res_art = supabase.table("articles").select("link").order("created_at", desc=True).limit(500).execute().data
                for r in res_art: existing_links.add(r['link'])
                print(f"📚 Loaded {len(existing_links)} unique links for deduplication.")
            except Exception as e:
                print(f"⚠️ Link Load Error: {e}")

            async with aiohttp.ClientSession() as session:
                total_added = 0
                for keyword, start_date in keyword_items_to_process:
                    print(f"🔍 Searching: [{keyword}] since {start_date}")
                    items = await fetch_naver_news_expert(session, keyword, start_date)
                    
                    added_for_kw = 0
                    for item in items:
                        added_for_kw += await process_news_item_expert(item, keyword, existing_links)
                    
                    print(f"   > Added {added_for_kw} new articles.")
                    total_added += added_for_kw

                print(f"🎉 Cycle Complete. Total Added: {total_added}")

                if single_run:
                    print("🚀 Single run completed. Exiting.")
                    break

            print("💤 Sleeping for 30 minutes...")
            await asyncio.sleep(1800)

        except Exception as e:
            print(f"❌ Error in Main Loop: {e}")
            try:
                import sentry_sdk
                sentry_sdk.capture_exception(e)
            except: pass
            await asyncio.sleep(60)
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    if sys.platform == 'win32':
         asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
