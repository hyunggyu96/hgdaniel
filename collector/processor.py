# -*- coding: utf-8 -*-
"""
Expert News Processor V1.0:
- Fetches pending items from raw_news.
- Analyzes with AI.
- Saves to articles (Production) & Google Sheets.
"""

import sys
import os
import json
import asyncio
import aiohttp
import datetime
from typing import List, Dict

from dotenv import load_dotenv
from supabase import create_client
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from openai import AsyncOpenAI  # Re-adding this because it was used but import was missing or implicit


# [1] 터미널 한글 깨짐 방지
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

# Setup Clients
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

GEMINI_KEYS = [os.getenv("GEMINI_API_KEY"), os.getenv("GEMINI_API_KEY_2")]
GEMINI_KEYS = [k for k in GEMINI_KEYS if k]

groq_client = AsyncOpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1") if os.getenv("GROQ_API_KEY") else None

def get_google_sheet():
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_url(GOOGLE_SHEET_URL)
        return sheet.get_worksheet(0)
    except Exception as e:
        print(f"⚠️ Google Sheet Warning: {e}")
        return None

# AI Analysis Function (copied from collector for self-containment/modularity)
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
        f"5. impact_level: Integer 1-5. (1: Minor news, 5: Critical market-shifting info).\n"
    )
    user_prompt = f"Crawl Keyword: {search_keyword}\nHeadline: {title}\nBody: {description}"

    # AI rotation (Same as collector logic)
    for i, g_key in enumerate(GEMINI_KEYS):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={g_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            async with aiohttp.ClientSession() as http_sess:
                async with http_sess.post(url, json=payload, timeout=15) as resp:
                    if resp.status == 429 or resp.status == 503:
                         print(f"  ⚠️ Gemini-{i+1} Quota/Busy ({resp.status}). Switching...")
                         continue
                    if resp.status == 200:
                        result = await resp.json()
                        text = result['candidates'][0]['content']['parts'][0]['text']
                        data = json.loads(text)
                        return {**data, "model": f"Gemini-2.0-{i+1}"}

        except: continue

    # Try Groq (Free Tier, Llama-3.3)
    if groq_client:
        try:
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            return {**data, "model": "Groq-Llama3.3"}
        except Exception as e:
            print(f"  ⚠️ Groq Error: {e}")

    # Try Ollama (Local AI) - Final AI Fallback
    try:
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": "llama3",
            "prompt": f"{system_prompt}\n\n{user_prompt}\n\nRespond in JSON format only.",
            "stream": False,
            "format": "json"
        }
        async with aiohttp.ClientSession() as http_sess:
            async with http_sess.post(url, json=payload, timeout=60) as resp:
                if resp.status == 200:
                    res_json = await resp.json()
                    res_content = res_json.get("response", "{}")
                    data = json.loads(res_content)
                    return {
                        "main_keyword": data.get("main_keyword", "기타"),
                        "included_keywords": data.get("included_keywords", []),
                        "issue_nature": data.get("issue_nature", "기타"),
                        "brief_summary": data.get("brief_summary", title[:70]),
                        "model": "Ollama-Llama3"
                    }
    except:
        pass

    # Fallback if all AI models fail
    print(f"⚠️ [FALLBACK] All AI models failed. Using local keyword extractor.")
    
    # Use local logic to rescue tags
    local_main = extract_main_keyword(description, title=title)
    local_sub = extract_keywords(f"{title} {description}")
    # Remove main keyword from sub list if present
    if local_main in local_sub:
        local_sub.remove(local_main)

    return {
        "main_keyword": local_main,
        "included_keywords": local_sub,
        "issue_nature": "기타",
        "brief_summary": title[:99],
        "impact_level": 1,
        "model": "Fallback-Local"
    }

async def process_item(item, worksheet):
    raw_id = item['id']
    title = item['title']
    desc = item['description']
    link = item['link']
    pub_date = item['pub_date']
    keyword = item['search_keyword']

    # [Strict Rule] Double check if already in production articles to prevent duplicates
    try:
        check = supabase.table("articles").select("id").eq("link", link).execute()
        if check.data:
            print(f"  ⏩ Skipping (Already in DB): {title[:30]}...")
            supabase.table("raw_news").update({"status": "skipped"}).eq("id", raw_id).execute()
            return True
    except Exception as e:
        print(f"  ⚠️ Duplicate check error: {e}")

    print(f"🤖 Processing: {title[:40]}...")
    
    analysis = await analyze_article_expert_async(title, desc, keyword)
    if not analysis:
        print(f"  ❌ AI Analysis failed for {raw_id}")
        return False

    # Extract clean fields
    main_kw = analysis.get("main_keyword", "기타")
    included_kws = analysis.get("included_keywords", [])
    issue_nature = analysis.get("issue_nature", "기타")
    summary = analysis.get("brief_summary", title[:70])
    impact = analysis.get("impact_level", 3)
    
    # 1. Update Production DB (Supabase)
    prod_data = {
        "title": title,
        "description": desc,
        "link": link,
        "published_at": pub_date,
        "source": "Naver",
        "keyword": keyword,
        "main_keywords": [analysis.get("main_keyword", "기타")] + analysis.get("included_keywords", [])
    }
    
    try:
        supabase.table("articles").insert(prod_data).execute()
        
        # 3. Update Google Sheets
        if worksheet:
                kst_now = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
                now_str = kst_now.strftime("%Y-%m-%d %H:%M:%S")
                
                # Convert pub_date to KST
                pub_kst_str = pub_date
                try:
                    if 'T' in pub_date:
                        pd_utc = datetime.datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                    else:
                        pd_utc = datetime.datetime.strptime(pub_date, "%Y-%m-%d %H:%M:%S+00:00")
                    pd_kst = pd_utc + datetime.timedelta(hours=9)
                    pub_kst_str = pd_kst.strftime("%Y-%m-%d %H:%M:%S")
                except:
                    pass

                row = [now_str, keyword, title, link, main_kw, ", ".join(included_kws), pub_kst_str, issue_nature, summary]
                # Insert at Row 2 (Top) to maintain "Newest First" order
                worksheet.insert_row(row, 2)
            
        # 3. Update Raw status
        supabase.table("raw_news").update({"status": "processed"}).eq("id", raw_id).execute()
        print(f"  ✅ Done: {analysis['model']}")
        return True
    except Exception as e:
        print(f"  ❌ Error saving processed item: {e}")
        return False

async def main():
    print(f"🚀 Expert News Processor Started at {datetime.datetime.now()}")
    
    # Fetch pending items
    res = supabase.table("raw_news").select("*").eq("status", "pending").limit(200).execute()
    pending_items = res.data
    
    if not pending_items:
        print("💤 No pending items to process.")
        return

    # [IMPORTANT] Sort by pub_date ASC so that older items are processed first.
    # When inserted at Row 2 (Top), the newest items end up at the very top.
    pending_items.sort(key=lambda x: x.get('pub_date', ''))
    
    print(f"🔎 Found {len(pending_items)} pending items.")
    worksheet = get_google_sheet()
    
    for item in pending_items:
        await process_item(item, worksheet)
        await asyncio.sleep(1) # Small delay to be nice to APIs

    # Create timestamp for Vercel trigger in root directory
    try:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        update_path = os.path.join(root_dir, "last_update.json")
        with open(update_path, "w", encoding='utf-8') as f:
            json.dump({"last_run": datetime.datetime.now().isoformat(), "status": "success"}, f)
        print(f"📍 Update timestamp created at {update_path}")
    except Exception as e:
        print(f"⚠️ Failed to create update timestamp: {e}")

if __name__ == "__main__":
    asyncio.run(main())
