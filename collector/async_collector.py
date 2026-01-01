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
import json
import email.utils
import datetime
import pathlib
import re
from typing import List, Dict

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
                        else:
                            # Since results are sorted by date, we can stop if we hit older news
                            pass 
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
    print(f"🚀 Expert News Collector Started (Pure Collection Mode).")
    
    single_run = os.getenv("SINGLE_RUN", "false").lower() == "true"
    
    while True:
        try:
            print(f"\n⏰ Cycle Start: {datetime.datetime.now()}")
            
            # ---- [V5.0] Determine start_date (Keyword-Specific) ----
            import json, pathlib
            last_update_path = pathlib.Path(__file__).parents[1] / "last_update.json"
            cycle_start_time = datetime.datetime.now()
            
            # Load existing time data
            time_registry = {}
            if last_update_path.exists():
                try:
                    time_registry = json.loads(last_update_path.read_text(encoding="utf-8"))
                except Exception as e:
                    print(f"⚠️ Failed to parse last_update.json: {e}")

            # Prepare keyword-specific times if not present
            kw_times = time_registry.get("keyword_last_collected_at", {})
            global_fallback = time_registry.get("last_collected_at") or time_registry.get("last_run") or "2025-12-19T00:00:00"

            # Prepare list to track updates
            keyword_items_to_process = []
            for kw in KEYWORDS:
                kw_start_str = kw_times.get(kw, global_fallback)
                try:
                    kw_start_date = datetime.datetime.fromisoformat(kw_start_str.replace('Z', '+00:00')).replace(tzinfo=None)
                except:
                    kw_start_date = datetime.datetime(2025, 12, 19)
                keyword_items_to_process.append((kw, kw_start_date))

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
                        if item['link'] in existing_links: continue
                        added_for_kw += await process_news_item_expert(item, keyword, existing_links)
                    
                    print(f"   > Added {added_for_kw} new articles.")
                    total_added += added_for_kw
                    # Update specific keyword time in our local registry after each keyword is done
                    kw_times[keyword] = cycle_start_time.isoformat()

                print(f"🎉 Cycle Complete. Total Added: {total_added}")

                # [V5.0] Atomic Save of all keyword times
                try:
                    time_registry["keyword_last_collected_at"] = kw_times
                    current_global_time = cycle_start_time.isoformat()
                    time_registry["last_collected_at"] = current_global_time 
                    time_registry["collector_status"] = "active"
                    last_update_path.write_text(json.dumps(time_registry, indent=2), encoding="utf-8")
                except Exception as e:
                    print(f"⚠️ Failed to update time registry: {e}")
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
