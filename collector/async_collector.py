# -*- coding: utf-8 -*-
"""Expert News Collector V4.0:
- Pure news collection role.
- Saves raw data to Supabase 'raw_news' table.
- AI Analysis is handled separately by processor.py.
"""

import sys
import os
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
    # Fetch top 100
    params = {"query": keyword, "display": 100, "sort": "date"}
    try:
        async with session.get(url, headers=headers, params=params) as resp:
            if resp.status == 200:
                data = await resp.json()
                items = data.get('items', [])
                for item in items:
                    pub_date = email.utils.parsedate_to_datetime(item['pubDate'])
                    if pub_date.replace(tzinfo=None) > start_date:
                        all_items.append(item)
    except Exception as e:
        print(f"  ⚠️ Naver API Error for [{keyword}]: {e}")
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
            
            # ---- Determine start_date ----
            import json, pathlib
            last_update_path = pathlib.Path(__file__).parents[1] / "last_update.json"
            if last_update_path.exists():
                try:
                    data = json.loads(last_update_path.read_text(encoding="utf-8"))
                    last_run_str = data.get("last_run")
                    if last_run_str:
                        start_date = datetime.datetime.fromisoformat(last_run_str.replace('Z', '+00:00')).replace(tzinfo=None)
                        print(f"📅 start_date from last_update.json: {start_date}")
                    else:
                        raise ValueError("last_run missing")
                except Exception as e:
                    print(f"⚠️ Failed to parse last_update.json ({e}), falling back to DB")
                    start_date = None
            else:
                start_date = None

            # Fallback: get latest published_at from articles table if needed
            if not start_date:
                try:
                    latest_res = supabase.table("articles").select("published_at").order("published_at", desc=True).limit(1).execute()
                    if latest_res.data:
                        latest_iso = latest_res.data[0]["published_at"]
                        if "T" in latest_iso:
                            start_date = datetime.datetime.fromisoformat(latest_iso.replace('Z', '+00:00')).replace(tzinfo=None)
                        else:
                            start_date = datetime.datetime.strptime(latest_iso, "%Y-%m-%d %H:%M:%S+00:00").replace(tzinfo=None)
                        print(f"📅 start_date from DB: {start_date}")
                    else:
                        start_date = datetime.datetime(2025, 12, 19)
                        print(f"📅 No articles in DB, using default: {start_date}")
                except Exception as e:
                    start_date = datetime.datetime(2025, 12, 19)
                    print(f"⚠️ DB start_date error ({e}), using default: {start_date}")
            # Ensure start_date is set
            if not start_date:
                start_date = datetime.datetime(2025, 12, 19)
                print(f"📅 Final fallback start_date: {start_date}")

            # Load existing links (last 2000 for deduplication speed)
            existing_links = set()
            try:
                rows = supabase.table("raw_news").select("link").order("created_at", desc=True).limit(2000).execute().data
                existing_links = {r['link'] for r in rows}
                print(f"📚 Loaded {len(existing_links)} recent raw links for deduplication.")
            except Exception as e:
                print(f"⚠️ Link Load Error: {e}")

            async with aiohttp.ClientSession() as session:
                total_added = 0
                for keyword in KEYWORDS:
                    print(f"🔍 Searching: [{keyword}]")
                    items = await fetch_naver_news_expert(session, keyword, start_date)
                    
                    added_for_kw = 0
                    for item in items:
                        added_for_kw += await process_news_item_expert(item, keyword, existing_links)
                    
                    print(f"   > Added {added_for_kw} new articles.")
                    total_added += added_for_kw

                print(f"🎉 Cycle Complete. Total Added: {total_added}")

            if single_run:
                break
                
            print("💤 Sleeping for 30 minutes...")
            await asyncio.sleep(1800)

        except Exception as e:
            print(f"❌ Error in Main Loop: {e}")
            await asyncio.sleep(60)
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    if sys.platform == 'win32':
         asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
