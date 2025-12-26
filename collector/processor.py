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

import re

# [3] Filtering Configuration (Confirmed by User)
CAR_BRANDS = [
    "르노코리아", "르노삼성", "현대차", "기아차", "쌍용차", "KG모빌리티", "쉐보레", 
    "폭스바겐", "메르세데스", "벤츠", "BMW", "아르카나", "토레스", "그랜저"
]

CAR_NOISE_KEYWORDS = [
    "시승기", "자동차 리콜", "타이어 교체", "내비게이션 업데이트", "중고차", "전기차", "수소차",
    "도로공사", "블랙박스", "당구(PBA)", "프로농구", "프로배구"
]

# Keywords that are 100% Medical Aesthetic (Safe to skip AI check)
STRONG_MED_KEYWORDS = [
    "HA필러", "CaHA필러", "PLLA필러", "HA-필러", "리쥬란", "톡신", "보톡스", "스킨부스터", "엑소좀", 
    "PN", "PDRN", "피부과", "성형외과", "품목허가", "휴젤", "메디톡스", "파마리서치", "제테마", "클래시스", "바이오플러스", "바임"
]

# Robust Regex for Automotive Pillars (A/B/C-Pillar)
PILLAR_REGEX = re.compile(r"[A-C]\s*(-|—)?\s*필러", re.IGNORECASE)

async def is_medical_news_ai(title, description):
    """Stage 2: AI verification for ambiguous cases"""
    prompt = (
        "Analyze if this news is related to Medical Aesthetics, Biopharma, or Skincare industry. "
        "Strictly ignore Automotive news even if keywords like 'Pillar' appear.\n"
        "Respond ONLY with 'TRUE' if it is Medical/Biopharma, and 'FALSE' otherwise.\n\n"
        f"Title: {title}\n"
        f"Content: {description}"
    )
    for g_key in GEMINI_KEYS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={g_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            async with aiohttp.ClientSession() as http_sess:
                async with http_sess.post(url, json=payload, timeout=10) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        answer = result['candidates'][0]['content']['parts'][0]['text'].strip().upper()
                        return "TRUE" in answer
        except: continue
    return True # Default to True to avoid missing news

# AI Analysis Function
async def analyze_article_expert_async(title, description, search_keyword, force_ollama=False):
    keyword_pool = ", ".join(EXPERT_ANALYSIS_KEYWORDS)
    system_prompt = (
        f"You are a [Medical Aesthetic Market Analyst].\n"
        f"Your task is to identify ALL relevant Medical/Aesthetic Keywords and Companies from the Pool below.\n\n"
        f"### CRITICAL CONTEXT:\n"
        f"- We ONLY care about the Medical/Aesthetic industry.\n"
        f"- Ignore all references to 'Automotive' or 'Car components' (e.g., A-pillar/C-pillar).\n\n"
        f"### Expert Keyword Pool:\n{keyword_pool}\n\n"
        f"### Extraction Rules (STRICT JSON ONLY):\n"
        f"1. main_keyword: Pick the single most important Medical/Aesthetic word from the Pool. Headline priority.\n"
        f"2. included_keywords: Array of EVERY relevant word from the Pool. Be exhaustive.\n"
        f"3. issue_nature: ONE of: 제품 출시/허가, 임상/연구데이터, 실적/수출/경영, 법적분쟁/규제, 투자/M&A, 학회/마케팅, 거시경제/정책, 기타.\n"
        f"4. brief_summary: A professional 1-line Korean summary (~70 chars).\n"
        f"5. impact_level: Integer 1-5.\n"
    )
    user_prompt = f"Crawl Keyword: {search_keyword}\nHeadline: {title}\nBody: {description}"

    # If force_ollama is true (likely related news), skip online models
    if not force_ollama:
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
    else:
        print(f"  ℹ️ [OPTIMIZATION] Related news detected. Using local Ollama for processing.")

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

# [4] Semantic Deduplication (Point 3)
def is_semantically_duplicate(new_title, recent_articles):
    """Checks if a title is too similar to recent articles (Jaccard Similarity)."""
    def get_words(text):
        # Remove special chars and split into words
        clean = "".join(c for c in text if c.isalnum() or c.isspace())
        return set(clean.lower().split())

    new_words = get_words(new_title)
    if len(new_words) < 3: return None # Too short to judge

    for art in recent_articles:
        ref_words = get_words(art['title'])
        if not ref_words: continue
        
        intersection = new_words.intersection(ref_words)
        union = new_words.union(ref_words)
        similarity = len(intersection) / len(union) if union else 0
        
        # If words are 70% identical, it's likely the same news from a different agency
        if similarity > 0.7:
            return art['title']
    return None

async def process_item(item, worksheet, recent_articles):
    raw_id = item['id']
    title = item['title']
    desc = item['description']
    link = item['link']
    pub_date = item['pub_date']
    keyword = item['search_keyword']

    # [1] News Filtering (2-Stage Approach)
    full_text = f"{title} {desc}"
    
    # Priority 1: Clear Car/Noise News -> Skip immediately
    if any(car_brand in full_text for car_brand in CAR_BRANDS) or \
       any(noise in full_text for noise in CAR_NOISE_KEYWORDS):
        print(f"  🚗 Car/Noise detected. Skipping: {title[:20]}...")
        supabase.table("raw_news").update({"status": "skipped"}).eq("id", raw_id).execute()
        return True

    # Priority 2: 100% Medical Aesthetic News -> Pass immediately
    if any(med_kw in full_text for med_kw in STRONG_MED_KEYWORDS):
        print(f"  🩺 Strong Medical Keywords found. Passing: {title[:20]}...")
        pass 
    else:
        # Priority 3: Ambiguous cases (Pillar mention or just "Filler" without strong context)
        # Let AI read and decide
        has_pillar_pattern = bool(PILLAR_REGEX.search(full_text))
        
        if has_pillar_pattern or keyword == "필러":
            print(f"  🔍 Ambiguous pillar/filler news ({title[:20]}...). AI Verifying...")
            is_relevant = await is_medical_news_ai(title, desc)
            if not is_relevant:
                print(f"  🚫 AI confirmed as Irrelevant. Skipping.")
                supabase.table("raw_news").update({"status": "skipped"}).eq("id", raw_id).execute()
                return True
            else:
                print("  ✅ AI rescued as relevant news!")
        else:
            # For other keywords without strong context, still do a quick AI check to be safe
            is_relevant = await is_medical_news_ai(title, desc)
            if not is_relevant:
                print(f"  🚫 AI filtered (No context). Skipping.")
                supabase.table("raw_news").update({"status": "skipped"}).eq("id", raw_id).execute()
                return True

    # [2] Double check if already in production (Unique Link)
    try:
        check = supabase.table("articles").select("id").eq("link", link).execute()
        if check.data:
            print(f"  ⏩ Skipping (Link exist): {title[:30]}...")
            supabase.table("raw_news").update({"status": "skipped"}).eq("id", raw_id).execute()
            return True
    except: pass

    # [3] Semantic Duplicate Check (Similar Title)
    dup_title = is_semantically_duplicate(title, recent_articles)
    force_ollama = False
    
    if dup_title:
        # Optimization: Use Ollama for related news to save cost
        # CRITICAL: For '필러' (Filler), we ALWAYS use Online AI due to its high variability
        if keyword == "필러":
            print(f"  ♻️ Related news found, but keyword is '필러'. Using Online AI for accuracy.")
            force_ollama = False
        else:
            print(f"  ♻️ Related news found (similar to: {dup_title[:20]}...). Using local Ollama.")
            force_ollama = True

    print(f"🤖 Processing: {title[:40]}...")
    
    # [New Strategy] ALWAYS merge AI results with local keyword extraction
    # 1. Start with Local extraction (Reliable baseline)
    local_main = extract_main_keyword(desc, title=title)
    local_all = extract_keywords(f"{title} {desc}", top_n=10)
    
    # 2. Get AI Analysis (Online for New, Ollama for Related)
    analysis = await analyze_article_expert_async(title, desc, keyword, force_ollama=force_ollama)
    
    # Extract AI fields
    ai_main = analysis.get("main_keyword", "기타")
    ai_included = analysis.get("included_keywords", [])
    issue_nature = analysis.get("issue_nature", "기타")
    summary = analysis.get("brief_summary", title[:70])
    impact = analysis.get("impact_level", 3)
    
    # 3. MERGE LOGIC (Union of AI and Local)
    # Prefer AI for 'main' if it's not '기타', otherwise use Local
    final_main = ai_main if (ai_main and ai_main != "기타") else local_main
    
    # Union of all keywords
    final_all_kws = list(set([final_main] + ai_included + local_all))
    
    # Clean up
    final_all_kws = [k for k in final_all_kws if k and k != "기타" and k != "-" and k != "|"]
    
    # Guarantee search keyword is included if it was found in text (or at least used as search)
    # But only if it's actually in our expert pool
    if keyword and keyword in EXPERT_ANALYSIS_KEYWORDS and keyword not in final_all_kws:
        final_all_kws.append(keyword)

    # 1. Update Production DB (Supabase)
    prod_data = {
        "title": title,
        "description": desc,
        "link": link,
        "published_at": pub_date,
        "source": "Naver",
        "keyword": keyword,
        "main_keywords": final_all_kws
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

                row = [now_str, keyword, title, link, final_main, ", ".join(final_all_kws), pub_kst_str, issue_nature, summary]
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
    
    # Fetch recent context for semantic deduplication (articles from last 24 hours)
    # Using 100 recent articles as a window
    res_recent = supabase.table("articles").select("title").order("published_at", desc=True).limit(100).execute()
    recent_articles = res_recent.data
    
    for item in pending_items:
        success = await process_item(item, worksheet, recent_articles)
        if success:
            # Add to local context to prevent duplicates within the same run
            recent_articles.append({"title": item['title']})
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
