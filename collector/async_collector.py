# -*- coding: utf-8 -*-
"""Expert News Collector V3.5:
- Starts from scratch after DB cleanup.
- Strictly adheres to the 9-column format.
- Integrates Google Sheets & Supabase with Expert Analyst Logic.
"""

import sys
import os
import asyncio
import aiohttp
import json
import email.utils
import datetime
import re
from typing import List, Dict

from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from openai import AsyncOpenAI
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# [1] 터미널 한글 깨짐 방지 for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# [2] 환경 변수 및 경로 설정
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Import local expert logic
sys.path.append(os.path.dirname(__file__))
try:
    from local_keyword_extractor import extract_keywords, extract_main_keyword, EXPERT_ANALYSIS_KEYWORDS
except ImportError:
    EXPERT_ANALYSIS_KEYWORDS = ["필러", "톡신", "휴젤", "종근당", "리쥬란"]
    def extract_keywords(t, n=5): return []
    def extract_main_keyword(t, ti=""): return "기타"

# Keys
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

# [3] Clients Initialization
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gemini keys
GEMINI_KEYS = [os.getenv("GEMINI_API_KEY"), os.getenv("GEMINI_API_KEY_2")]
GEMINI_KEYS = [k for k in GEMINI_KEYS if k]

# Optional: AI clients (Async)
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None
groq_client = AsyncOpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1") if os.getenv("GROQ_API_KEY") else None
ollama_client = AsyncOpenAI(api_key="ollama", base_url="http://localhost:11434/v1") # Local Ollama
openrouter_client = AsyncOpenAI(api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1") if os.getenv("OPENROUTER_API_KEY") else None

# Search Keywords (Crawl Keys)
KEYWORDS = os.getenv("KEYWORDS", "필러,톡신,보톡스,쥬베룩,리쥬란,엑소좀").split(",")

# [3] Google Sheets Setup (Strict 9 Columns)
def get_google_sheet():
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_url(GOOGLE_SHEET_URL)
        
        ws_name = "Market Analysis"
        try:
            worksheet = sheet.worksheet(ws_name)
        except:
            print(f"DEBUG: Creating new worksheet: {ws_name}")
            worksheet = sheet.add_worksheet(title=ws_name, rows="10000", cols="10")
        
        # Expert Headers
        headers = ["1. 분석 시각", "2. 검색 키워드", "3. 헤드라인", "4. 링크", "5. 메인 키워드", "6. 포함 키워드", "7. 발행 시각", "8. 이슈 성격", "9. AI 한 줄 요약"]
        if not worksheet.get_all_values():
            worksheet.append_row(headers)
            print("Headers initialized.")
        return worksheet
    except Exception as e:
        print(f"⚠️ Google Sheet Warning: {e}")
        return None

# [4] Expert Analyst AI Function
async def analyze_article_expert_async(title, description, search_keyword):
    keyword_pool = ", ".join(EXPERT_ANALYSIS_KEYWORDS)
    system_prompt = (
        f"You are a [Medical Aesthetic Market Analyst].\n"
        f"Analyze this news based on the Expert Keyword Pool below.\n\n"
        f"### Expert Keyword Pool:\n{keyword_pool}\n\n"
        f"### Extraction Rules (JSON ONLY):\n"
        f"1. main_keyword: Pick exactly ONE word from the Pool. Headline priority > Body frequency. If none, '기타'.\n"
        f"2. included_keywords: Array of all words from the Pool found in text.\n"
        f"3. issue_nature: Categorize the news into ONE of: 제품 출시/허가, 임상/연구데이터, 실적/수출/경영, 법적분쟁/규제, 투자/M&A, 학회/마케팅, 거시경제/정책, 기타.\n"
        f"4. brief_summary: A professional 1-line Korean summary. Be informative (~70 chars).\n"
    )
    user_prompt = f"Crawl Keyword: {search_keyword}\nHeadline: {title}\nBody: {description}"

    # Try Gemini (Direct REST API) with rotation
    for i, g_key in enumerate(GEMINI_KEYS):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={g_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            
            async with aiohttp.ClientSession() as http_sess:
                # 15s Timeout Enforcement for faster failover
                async with http_sess.post(url, json=payload, timeout=15) as resp:
                    if resp.status != 200:
                        err_text = await resp.text()
                        # Immediately skip on 404/402/429 etc
                        if resp.status in [404, 402, 429, 500, 503]:
                            print(f"  ⚠️ Gemini-{i+1} HTTP {resp.status} (Skipping)...")
                            continue
                        raise Exception(f"HTTP {resp.status}: {err_text}")
                    result = await resp.json()
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    
            data = json.loads(text)
            return {
                "main_keyword": data.get("main_keyword", "기타"),
                "included_keywords": data.get("included_keywords", []),
                "issue_nature": data.get("issue_nature", "기타"),
                "brief_summary": data.get("brief_summary", title[:70]),
                "model": f"Gemini-2.0-{i+1}"
            }
        except asyncio.TimeoutError:
             print(f"  ⚠️ Gemini-{i+1} Timeout (15s)...")
        except Exception as e:
            if i == len(GEMINI_KEYS) - 1:
                print(f"  ⚠️ Gemini Error: {str(e)[:100]}")

    # Try OpenRouter Models (Claude, DeepSeek, Perplexity)
    if openrouter_client:
        # Priority sub-list for OpenRouter
        or_models = [
            {"id": "anthropic/claude-3.5-sonnet", "name": "Claude-3.5"},
            {"id": "deepseek/deepseek-chat", "name": "DeepSeek"},
            {"id": "qwen/qwen-2.5-72b-instruct", "name": "Qwen-2.5"},
            {"id": "perplexity/sonar", "name": "Perplexity"}
        ]
        for or_m in or_models:
            try:
                # 15s Timeout Enforcement
                response = await asyncio.wait_for(
                    openrouter_client.chat.completions.create(
                        model=or_m["id"],
                        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                        response_format={"type": "json_object"}
                    ),
                    timeout=15
                )
                data = json.loads(response.choices[0].message.content)
                return {
                    "main_keyword": data.get("main_keyword", "기타"),
                    "included_keywords": data.get("included_keywords", []),
                    "issue_nature": data.get("issue_nature", "기타"),
                    "brief_summary": data.get("brief_summary", title[:70]),
                    "model": or_m["name"]
                }
            except asyncio.TimeoutError:
                print(f"  ⚠️ {or_m['name']} Timeout (15s)...")
                continue
            except Exception as e:
                # e.g. BadRequestError 402, 404 handled by library exceptions usually, but specific checks help log better
                if "402" in str(e) or "404" in str(e):
                     print(f"  ⚠️ {or_m['name']} Status {str(e)[:20]}... (Skipping)")
                     continue
                print(f"  ⚠️ {or_m['name']} Error: {str(e)[:50]}...")

    # Try Groq (OpenAI Compatible)
    if groq_client:
        try:
            # Try latest models
            for g_model in ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192"]:
                try:
                    # 15s Timeout
                    response = await asyncio.wait_for(
                        groq_client.chat.completions.create(
                            model=g_model,
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            response_format={"type": "json_object"}
                        ),
                        timeout=15
                    )
                    data = json.loads(response.choices[0].message.content)
                    return {
                        "main_keyword": data.get("main_keyword", "기타"),
                        "included_keywords": data.get("included_keywords", []),
                        "issue_nature": data.get("issue_nature", "기타"),
                        "brief_summary": data.get("brief_summary", title[:70]),
                        "model": f"Groq-{g_model.split('-')[1]}" if '-' in g_model else "Groq"
                    }
                except asyncio.TimeoutError:
                     print(f"  ⚠️ Groq-{g_model} Timeout (15s)...")
                     continue
                except: continue
        except Exception as e:
            print(f"  ⚠️ Groq Error: {str(e)[:50]}...")

    # Try OpenAI
    if openai_client:
        try:
            # 15s Timeout
            response = await asyncio.wait_for(
                openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"}
                ),
                timeout=15
            )
            data = json.loads(response.choices[0].message.content)
            return {
                "main_keyword": data.get("main_keyword", "기타"),
                "included_keywords": data.get("included_keywords", []),
                "issue_nature": data.get("issue_nature", "기타"),
                "brief_summary": data.get("brief_summary", title[:70]),
                "model": "OpenAI"
            }
        except asyncio.TimeoutError:
             print(f"  ⚠️ OpenAI Timeout (15s)...")
        except Exception as e:
            print(f"  ⚠️ OpenAI Error: {str(e)[:50]}...")

    # Try Ollama (Local AI) - Final AI Fallback
    # Direct HTTP Request for maximum compatibility
    try:
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": "llama3:latest",
            "prompt": f"{system_prompt}\n\n{user_prompt}\n\nResond in JSON format only.",
            "stream": False,
            "format": "json"
        }
        async with aiohttp.ClientSession() as http_sess:
            # 30s Timeout for Local AI (Give it some slack)
            async with http_sess.post(url, json=payload, timeout=30) as resp:
                if resp.status == 200:
                    res_json = await resp.json()
                    res_content = res_json.get("response", "{}")
                    data = json.loads(res_content)
                    return {
                        "main_keyword": data.get("main_keyword", "기타"),
                        "included_keywords": data.get("included_keywords", []),
                        "issue_nature": data.get("issue_nature", "기타"),
                        "brief_summary": data.get("brief_summary", title[:70]),
                        "model": "Ollama"
                    }
                else:
                    print(f"  ⚠️ Ollama Status {resp.status}...")
    except asyncio.TimeoutError:
         print(f"  ⚠️ Ollama Timeout (30s)...")
    except Exception as e:
        print(f"  ⚠️ Ollama Error: {str(e)[:50]}...")

    # CRITICAL: If all fail, STOP the process (Manual review required)
    print(f"\n❌ [CRITICAL] All AI Models failed for: {title[:50]}...")
    print(f"🚨 Stopping process to prevent low-quality data. Please check API keys or Ollama status.")
    sys.exit(1)

def clean_text_expert(val):
    if val is None: return "-"
    # If list, join to string
    if isinstance(val, (list, set)):
        return ", ".join([str(v) for v in val if v])
    s = str(val).strip()
    # Remove control chars and list brackets
    s = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', s)
    s = s.replace("['", "").replace("']", "").replace('"', "").replace("`", "")
    return s

# [5] Naver News Fetching
async def fetch_naver_news_expert(session, keyword, start_date):
    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    
    all_items = []
    # Fetch top 100 for fresh start
    params = {"query": keyword, "display": 100, "sort": "date"}
    async with session.get(url, headers=headers, params=params) as resp:
        if resp.status == 200:
            data = await resp.json()
            items = data.get('items', [])
            for item in items:
                pub_date = email.utils.parsedate_to_datetime(item['pubDate'])
                if pub_date.replace(tzinfo=None) >= start_date:
                    all_items.append(item)
    return all_items

# [6] Process Single Item
async def process_news_item_expert(session, item, search_keyword, worksheet, existing_links, semaphore):
    link = item['link']
    if link in existing_links: return 0

    async with semaphore:
        title = item['title'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"').replace('&amp;', '&')
        desc = item['description'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"').replace('&amp;', '&')
        
        # AI Analysis NO LONGER DONE IN COLLECTOR
        # analysis = await analyze_article_expert_async(title, desc, search_keyword)
        # if not analysis:
        #     return 0 # Skip this item
        
        # Cleaning for Sections 2 & 8
        clean_search_kw = clean_text_expert(search_keyword)
        clean_issue_nature = clean_text_expert(analysis.get('issue_nature', '기타'))
        main_kw = clean_text_expert(analysis.get('main_keyword', '기타'))
        summary = clean_text_expert(analysis.get('brief_summary', '-'))
        included = [clean_text_expert(k) for k in analysis.get('included_keywords', []) if k]
        
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pub_iso = email.utils.parsedate_to_datetime(item['pubDate']).isoformat()
        pub_sheet = pub_iso[:10] # Date only for sheet clarity or full iso

        # Google Sheet Row (9 Columns)
        row = [now_str, clean_search_kw, title, link, main_kw, ", ".join(included), pub_iso, clean_issue_nature, summary]

        try:
            # Update Supabase (Raw Staging)
            supabase_data = {
                "title": title,
                "description": desc,
                "link": link,
                "pub_date": pub_iso,
                "search_keyword": clean_search_kw,
                "status": "pending"
            }
            # Use raw_news table
            supabase.table("raw_news").insert(supabase_data).execute()
            
            print(f"📦 [RAW] Collected: {title[:40]}...")
            existing_links.add(link)
            return 1
        except Exception as e:
            if "duplicate key" not in str(e):
                print(f"  ❌ Raw Sync Error: {e}")
            return 0

# [7] Main Execution
# [7] Main Execution
async def main():
    print(f"🚀 Expert News Collector Started (Continuous Mode - Every 30 mins).")
    
    # Single Run Check (for GitHub Actions)
    single_run = os.getenv("SINGLE_RUN", "false").lower() == "true"
    
    while True:
        try:
            print(f"\n⏰ Starting Collection Cycle: {datetime.datetime.now()}")
            
            # Set Start Date (Default: Dec 1, 2025 for current data)
            # Keeping it wide to catch any missed old news, duplicates prevented by DB check.
            start_date = datetime.datetime(2025, 12, 1) 
            
            # Load existing links from Supabase to prevent duplicates
            existing_links = set()
            try:
                # Fetch links from raw_news to prevent duplicates
                rows = supabase.table("raw_news").select("link").execute().data
                existing_links = {r['link'] for r in rows}
                print(f"📚 Loaded {len(existing_links)} existing raw articles from DB.")
            except Exception as e:
                print(f"⚠️ Failed to load existing raw links: {e}")

            # Google Sheet Setup
            worksheet = None
            try:
                scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
                creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
                client = gspread.authorize(creds)
                sheet = client.open_by_url(GOOGLE_SHEET_URL)
                worksheet = sheet.get_worksheet(0)
            except Exception as e:
                print(f"⚠️ Google Sheet Error: {e}")

            # Collect for each keyword
            connector = aiohttp.TCPConnector(limit=10) # Limit concurrent connections
            async with aiohttp.ClientSession(connector=connector) as session:
                tasks = []
                semaphore = asyncio.Semaphore(5) # Max 5 concurrent AI analysis

                for keyword in KEYWORDS:
                    print(f"🔍 Searching: [{keyword}]")
                    items = await fetch_naver_news_expert(session, keyword, start_date)
                    if not items: continue

                    # Deduplicate against current session founds as well
                    new_items = []
                    for item in items:
                        if item['link'] not in existing_links:
                            new_items.append(item)
                            existing_links.add(item['link']) # Add immediately to prevent dupes in same run
                    
                    if new_items:
                        print(f"   > Found {len(new_items)} new potential articles.")
                        for item in new_items:
                            # Add task
                            tasks.append(process_news_item_expert(session, item, keyword, worksheet, existing_links, semaphore))
                    else:
                        print(f"   > No new articles found.")

                if tasks:
                    print(f"⚡ Processing {len(tasks)} new articles with AI...")
                    results = await asyncio.gather(*tasks)
                    added_count = sum(results)
                    print(f"🎉 Cycle Complete. Added {added_count} new articles.")
                else:
                    print("💤 No new articles found in this cycle.")

            print(f"✅ Cycle Finished.")
            
            if single_run:
                print("🛑 Single run mode enabled. Exiting...")
                break
                
            print("💤 Sleeping for 30 minutes...")
            await asyncio.sleep(1800) # 30 minutes sleep

        except Exception as e:
            print(f"\n❌ Unexpected Error in Main Loop: {e}")
            print("🔄 Retrying in 60 seconds...")
            await asyncio.sleep(60)
        except KeyboardInterrupt:
            print("\n🛑 Collector Stopped by User.")
            break

if __name__ == "__main__":
    if sys.platform == 'win32':
         asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
