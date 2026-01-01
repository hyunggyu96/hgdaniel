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

# Disable stdout buffering for nohup
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# [1] 환경 변수 먼저 로드 (InferenceEngine보다 먼저!)
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

import json
import asyncio
import aiohttp
import datetime
from typing import List, Dict

from supabase import create_client
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from openai import AsyncOpenAI
from inference_engine import InferenceEngine

# Initialize Engines (이제 .env가 로드된 상태)
inference_manager = InferenceEngine()

# Global Stats for Self-Diagnosis
STATS = {"local": 0, "cloud": 0, "fallback": 0, "total": 0, "latencies": []}


# [2] 터미널 한글 깨짐 방지
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# [2] Load Keywords from JSON (SSOT)
shared_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '_shared')
keywords_path = os.path.join(shared_dir, 'keywords.json')
EXPERT_ANALYSIS_KEYWORDS = []

try:
    with open(keywords_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        for cat in data.get('categories', []):
            EXPERT_ANALYSIS_KEYWORDS.extend(cat.get('keywords', []))
    print(f"✅ Loaded {len(EXPERT_ANALYSIS_KEYWORDS)} keywords from keywords.json")
except Exception as e:
    print(f"⚠️ Failed to load keywords.json: {e}")
    # Fallback (구형)
    EXPERT_ANALYSIS_KEYWORDS = [
        "휴젤", "메디톡스", "파마리서치", "대웅제약", "종근당", "제테마", "휴온스", "휴메딕스", "바이오플러스", "바임",
        "필러", "보톡스", "톡신", "리쥬란", "스킨부스터", "엑소좀", "PN", "PDRN"
    ]

# Import local expert logic (Must be AFTER keyword loading or passed explicitly)
sys.path.append(os.path.dirname(__file__))
try:
    from local_keyword_extractor import extract_keywords, extract_main_keyword
except ImportError:
    print("⚠️ local_keyword_extractor not found. Local fallback will fail.")
    def extract_main_keyword(text, title=""): return "기타"
    def extract_keywords(text, top_n=5): return []

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
        return sheet.worksheet("Synced_Articles")  # V3.2: 새 동기화 시트 사용
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
STRONG_MED_KEYWORDS = [k for k in EXPERT_ANALYSIS_KEYWORDS if "필러" in k or "톡신" in k or "리쥬란" in k]

# 🚫 노이즈 차단 키워드 (제목/본문에 있으면 즉시 폐기)
BAD_KEYWORDS = [
    "캐시워크", "캐시닥", "용돈퀴즈", "돈버는퀴즈", "정답", "퀴즈",  # 리워드 앱
    "신차", "제네시스", "SUV", "GV90", "A-필러", "B-필러", "C-필러", # 자동차
    "디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아"
]

# Robust Regex for Automotive Pillars (A/B/C-Pillar)
PILLAR_REGEX = re.compile(r"([A-C]\s*(-|—)?\s*필러|자동차|전기차|모델명|신차)", re.IGNORECASE)

async def is_medical_news_ai(title, description):
    """Stage 2: AI verification for ambiguous cases"""
    # 1. 강력한 키워드 선제 차단
    full_text = f"{title} {description}"
    if any(bk in title for bk in BAD_KEYWORDS):
        print(f"  🚫 Noise Filter: '{title[:20]}...' matched BAD_KEYWORDS (Title)")
        return False
    
    if PILLAR_REGEX.search(title):
        print(f"  🚫 Noise Filter: Automotive keywords detected in Title")
        return False

    # 화이트리스트 문자열 생성 (Top 50개만 예시로 주입하여 토큰 절약하되, 핵심 기업은 포함)
    whitelist_sample = ", ".join(EXPERT_ANALYSIS_KEYWORDS[:100]) + "..."
    
    prompt = (
        "너는 의료/바이오/미용 성형 분야의 엄격한 데이터 필터야.\n"
        "아래 뉴스가 [의료/제약/미용성형/바이오] 산업과 관련이 있는지 판단해줘.\n"
        "특히 '필러'라는 단어가 자동차 부품(A/B/C-Pillar)으로 쓰였거나, '캐시워크/퀴즈' 관련 뉴스라면 무조건 FALSE.\n\n"
        "### 매우 중요한 규칙 (STRICT RULE):\n"
        f"우리는 오직 다음 허용된 키워드 리스트에 있는 기업/제품만 수집한다: [{whitelist_sample}]\n"
        "만약 기사의 메인 주제가 위 리스트에 없는 엉뚱한 기업(예: 강스템바이오, 오스테오닉 등)이라면, 설령 바이오 뉴스라도 과감히 FALSE를 출력해라.\n"
        "즉, '허용된 키워드'가 제목이나 본문의 핵심이 아니라면 FALSE다.\n\n"
        "오직 'TRUE' 또는 'FALSE'로만 대답해.\n\n"
        f"제목: {title}\n"
        f"내용: {description}"
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
    
    # AI 판단 불가 시, 제목에 의료 키워드가 없으면 일단 FALSE로 보수적 처리
    return any(kw in title for kw in EXPERT_ANALYSIS_KEYWORDS)

# AI Analysis Function
async def analyze_article_expert_async(title, description, search_keyword):
    """Refactored to use central InferenceEngine."""
    keyword_pool = ", ".join(EXPERT_ANALYSIS_KEYWORDS)
    system_prompt = (
        f"You are a [Medical Aesthetic Business Analyst]. Output MUST be strict JSON.\n"
        f"Your task: Identify relevant Medical/Aesthetic Keywords and Companies from the Pool.\n\n"
        f"### STRICT RULES:\n"
        f"1. **Language**: summary and issue_nature MUST be in Korean (Hangul) ONLY. NO Japanese, NO Hanja.\n"
        f"2. **Main Keyword**: Pick a single name from the Pool that is EXPLICITLY mentioned. Use the EXACT Korean name.\n"
        f"3. **Included Keywords**: Pick ONLY 2-4 keywords from the Pool that are ACTUALLY in the text. DO NOT invent new words.\n"
        f"4. **No Hallucination**: Do not add information not in the text. If no pool keyword matches, use '기타'.\n"
        f"5. **JSON Only**: Return only the JSON object.\n\n"
        f"### Extraction Example:\n"
        f"Input: [KLPGA, 태국서 ‘리쥬란 챔피언십’ 연다]\n"
        f"Good: {{\"main_keyword\": \"리쥬란\", \"included_keywords\": [\"파마리서치\", \"학회\"], \"issue_nature\": \"학회/마케팅\", \"brief_summary\": \"파마리서치가 태국에서 리쥬란 챔피언십 골프 대회를 개최하며 글로벌 마케팅을 강화한다.\"}}\n"
        f"Bad: {{\"main_keyword\": \"태국바이오\", \"included_keywords\": [\"성과\", \"조직문화\"], ...}} (Reason: Not in Pool, irrelevant)\n\n"
        f"### Expert Keyword Pool:\n{keyword_pool}\n\n"
        f"### Schema (Required fields):\n"
        f"- main_keyword: (String) subject from Pool.\n"
        f"- included_keywords: (Array of Strings) 2-4 keywords STRICTLY from Pool.\n"
        f"- issue_nature: (String) One of: [제품 출시/허가, 임상/연구데이터, 실적/수출/경영, 법적분쟁/규제, 투자/M&A, 학회/마케팅, 거시경제/정책, 기타].\n"
        f"- impact_level: (Integer) 1 to 5.\n"
    )
    user_prompt = f"Crawl Keyword: {search_keyword}\nHeadline: {title}\nBody: {description}"

    analysis = await inference_manager.get_analysis_hybrid(system_prompt, user_prompt)
    
    if "error" in analysis:
        # Fallback to local logic if all AI models fail
        print(f"⚠️ [FALLBACK] All AI models failed. Using local keyword extractor.")
        local_main = extract_main_keyword(description, title=title)
        local_sub = extract_keywords(f"{title} {description}")
        if local_main in local_sub: local_sub.remove(local_main)
        
        return {
            "main_keyword": local_main,
            "included_keywords": local_sub,
            "issue_nature": "기타",
            "brief_summary": title[:99],
            "impact_level": 1,
            "model": "Fallback-Local"
        }
    return analysis

# [4] Semantic Deduplication (Point 3)
def is_semantically_duplicate(new_title, recent_articles):
    """Checks if a title is too similar to recent articles (Jaccard Similarity)."""
    def get_words(text):
        if not text: return set()
        # Remove ALL special characters including various quotes and brackets
        clean = re.sub(r'[^가-힣a-zA-Z0-9\s]', ' ', text)
        return set(clean.lower().split())

    new_words = get_words(new_title)
    if len(new_words) < 3: return None

    for art in recent_articles:
        ref_title = art.get('title', '')
        ref_words = get_words(ref_title)
        if not ref_words: continue
        
        intersection = new_words.intersection(ref_words)
        union = new_words.union(ref_words)
        similarity = len(intersection) / len(union) if union else 0
        
        # Lowered threshold to 0.7 to catch slightly modified titles from different agencies
        if similarity > 0.7:
            return ref_title
    return None

def is_semantic_duplicate(text1, text2, threshold=0.8):
    if not text1 or not text2: return False
    # Remove special chars and split into words
    def get_words(t): return set(re.sub(r'[^가-힣a-zA-Z0-9]', ' ', t).split())
    w1 = get_words(text1)
    w2 = get_words(text2)
    if not w1 or not w2: return False
    
    intersection = w1.intersection(w2)
    union = w1.union(w2)
    similarity = len(intersection) / len(union)
    return similarity >= threshold

async def process_item(item, worksheet, recent_articles):
    raw_id = item['id']
    title = item['title']
    desc = item['description']
    link = item['link']
    pub_date = item['pub_date']
    keyword = item['search_keyword']

    # [1] Semantic Duplicate Check (V5.1: 80% threshold for Title OR Desc)
    for recent in recent_articles[-300:]: # Check last 300 processed items
        # Title check
        if is_semantic_duplicate(title, recent.get('title'), threshold=0.8):
            print(f"⏩ Skipping (Duplicate Title): {title[:30]}...")
            return None
        # Description check
        if is_semantic_duplicate(desc, recent.get('description'), threshold=0.8):
            print(f"⏩ Skipping (Duplicate Content): {title[:30]}...")
            return None

    # [2] AI Analysis (Hybrid: Local First)
    # We analyze it FIRST to get context
    print(f"🤖 Analyzing: {title[:40]}...")
    analysis = await analyze_article_expert_async(title, desc, keyword)
    
    # Extract AI fields (safely handle dict values)
    ai_main = analysis.get("main_keyword", "기타")
    if isinstance(ai_main, dict):
        ai_main = ai_main.get("name", str(ai_main)) if "name" in ai_main else "기타"
    ai_main = str(ai_main) if ai_main else "기타"
    
    ai_included = analysis.get("included_keywords", [])
    issue_nature = analysis.get("issue_nature", "기타")
    if isinstance(issue_nature, dict):
        issue_nature = issue_nature.get("name", "기타") if "name" in issue_nature else "기타"
    issue_nature = str(issue_nature) if issue_nature else "기타"
    
    # [V4.5] AI 요약 대신 원본 발췌문(description) 사용
    summary = str(desc if desc else title)
    
    # [Nuclear Option] Cleanup and 70-char hard truncate for frontend safety
    summary = re.sub(r'[\u4e00-\u9fff]', '', summary) # Remove Hanja
    summary = re.sub(r'[\u3040-\u30ff]', '', summary) # Remove Japanese
    if len(summary) > 70:
        summary = summary[:67] + "..."
    
    impact = analysis.get("impact_level", 3)
    if isinstance(impact, dict):
        impact = 3
    
    # [2] Local Extraction for robustness
    local_main = extract_main_keyword(desc, title=title)
    local_all = extract_keywords(f"{title} {desc}", top_n=5)
    
    # [3] MERGE LOGIC (Union of AI and Local)
    final_main = ai_main if (ai_main and ai_main != "기타") else local_main
    if isinstance(final_main, dict):
        final_main = final_main.get("name", "기타") if "name" in final_main else "기타"
    final_main = str(final_main) if final_main else "기타"
    
    # [4] CLEANUP & FINAL FORMATTING (Nuclear Option)
    def clean_kw(k):
        if not k: return ""
        k = str(k).strip()
        # 1. Replace common Hanja
        k = k.replace("社", "사").replace("外", "외").replace("內", "내").replace("美", "미").replace("中", "중").replace("日", "일").replace("韓", "한")
        
        # 2. Remove all Hanja (4E00-9FFF)
        k = re.sub(r'[\u4e00-\u9fff]', '', k)
        
        # 3. Remove all Japanese (Hiragana: 3040-309F, Katakana: 30A0-30FF)
        k = re.sub(r'[\u3040-\u30ff]', '', k)
        
        # 4. Remove strange symbols/control chars but keep basic punct
        k = re.sub(r'[^\w\s\d.,!?"\'\[\]()%&-]', '', k)
        
        corrections = {
            "휴zel": "휴젤", "Hugel": "휴젤", "휴젤사": "휴젤",
            "파마리서치바이오": "파마리서치", "리쥬란힐러": "리쥬란",
            "파마리서치사": "파마리서치", "메디톡스사": "메디톡스"
        }
        k = corrections.get(k, k)
        return k.strip()

    # Whitelist & Language Filtering (Strict)
    pool_set = set([k.strip() for k in EXPERT_ANALYSIS_KEYWORDS])
    
    def is_valid_korean_kw(k):
        # 1. Must be in Pool
        if k not in pool_set: return False
        # 2. Must contain Hangul (Double check to avoid pure English noise)
        if not re.search(r'[가-힣]', k): return False
        return True

    final_main = final_main if is_valid_korean_kw(final_main) else "기타"
    ai_included = [k for k in ai_included if is_valid_korean_kw(k)]
    local_all = [k for k in local_all if is_valid_korean_kw(k)]
    
    # 5. Summary Post-processing (Smart Clean V3)
    summary = summary.strip()
    
    # 1. Remove repetitive dots first
    summary = re.sub(r'\.{2,}', '.', summary) 
    
    # 2. Smart Cut: Remove garbage after the LAST valid sentence ending
    # Capture the last occurrence of ".다" or ".함" etc.
    # Preserve subsequent sentences if they look like proper Korean sentences, 
    # but cut if they are just numbers, symbols, or broken words.
    
    # Find the last valid sentence end index
    matches = list(re.finditer(r'([다함음]\.|[다함음])', summary))
    if matches:
        last_match = matches[-1]
        end_idx = last_match.end()
        remainder = summary[end_idx:]
        
        # If remainder is just noise (digits, %, whitespace, punctuation, short garbage)
        # We cut it. Allow remainder only if it's a long string of Hangul (another sentence).
        if not re.search(r'[가-힣]{2,}', remainder):
            summary = summary[:end_idx]
            
    # 3. Final safety trim for loose garbage at ends
    summary = re.sub(r'\s+[\d.%]+\s*$', '', summary) # Remove trailing "6.95%"
    summary = summary.strip()

    final_all_kws = list(set([final_main] + ai_included + local_all))
    final_all_kws = [k for k in final_all_kws if k and k in pool_set and k not in ["기타", "-", "|", "None"]]
    
    if keyword and keyword in pool_set and keyword not in final_all_kws:
        final_all_kws.append(keyword)

    # Update Stats
    provider = analysis.get("provider", "fallback")
    STATS["total"] += 1
    STATS[provider] += 1

    # [4] FILTERING: 링크 중복 + 제목 유사도 체크 (V3.2)
    is_duplicate = False
    dup_reason = ""
    
    # Check 1: 링크 중복
    try:
        check = supabase.table("articles").select("id").eq("link", link).execute()
        if check.data:
            is_duplicate = True
            dup_reason = "Duplicate Link"
    except Exception as e:
        print(f"  ⚠️ Supabase Link Check Error: {e}")
    
    # Check 2: 제목 유사도 (링크 중복 아닐 때만)
    if not is_duplicate:
        dup_title = is_semantically_duplicate(title, recent_articles)
        if dup_title:
            is_duplicate = True
            dup_reason = f"Similar to: {dup_title[:20]}..."

    # [5] SAVE TO SUPABASE (중복 아닐 때만)
    # V3.0: 완벽 동기화 - Supabase 저장 성공 시에만 구글시트에도 저장
    supabase_saved = False
    if not is_duplicate:
        try:
            prod_data = {
                "title": title, 
                "description": desc,  # 원본 보관 (웹/시트 표시용)
                "link": link,
                "published_at": pub_date, 
                "source": "Naver",
                "keyword": keyword, 
                "main_keywords": final_all_kws,
                # "ai_summary": summary, # [DISABLED] DB Column Missing (Restore later via SQL migration)
                # "issue_nature": issue_nature # [DISABLED] DB Column Missing
            }
            supabase.table("articles").insert(prod_data).execute()
            supabase_saved = True
            print(f"  ✅ Saved to Supabase DB (Description First)")
        except Exception as e:
            print(f"  ⚠️ Supabase DB Error: {e}")
    else:
        print(f"  ⏭️ Skipped ({dup_reason})")

    # [5] SAVE TO GOOGLE SHEETS (Only if Supabase saved - Perfect Sync V3.0)
    if supabase_saved:
        if worksheet:
            try:
                # [Smart Scheduling] Use System Local Time (KST)
                kst_now = datetime.datetime.now()
                now_str = kst_now.strftime("%Y-%m-%d %H:%M:%S")
                # pub_date conversion to KST...
                pd_kst_str = pub_date
                try:
                    pd_utc = datetime.datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                    pd_kst_str = (pd_utc + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S")
                except: pass

                row = [now_str, keyword, title, link, final_main, ", ".join(final_all_kws), pd_kst_str, issue_nature, summary]
                worksheet.insert_row(row, 2)
                print(f"  📑 Saved to Google Sheets (Synced)")
                
                # Update history for deduplication
                recent_articles.append({'title': title, 'link': link})
            except Exception as e:
                print(f"  ⚠️ Google Sheet Error: {e}")

    # [6] Final Status Sync
    supabase.table("raw_news").update({"status": "processed"}).eq("id", raw_id).execute()
    return True

async def main():
    print(f"🚀 Expert News Processor Started (Continuous Mode) at {datetime.datetime.now()}")
    
    while True:
        try:
            # 1. Fetch pending items (Batch of 20 for responsiveness)
            res = supabase.table("raw_news").select("*").eq("status", "pending").limit(20).execute()
            pending_items = res.data
            
            if not pending_items:
                # [Smart Scheduling] Use System Local Time (KST)
                kst_now = datetime.datetime.now()
                current_hour = kst_now.hour
                current_minute = kst_now.minute
                
                sleep_seconds = 60
                mode = "Default"

                # 1. 00:00 ~ 06:00 (Night: 2 hours)
                if 0 <= current_hour < 6:
                    sleep_seconds = 7200
                    mode = "Night (2h)"
                # 2. 06:00 ~ 18:30 (Day: 5 min) 
                elif 6 <= current_hour < 18 or (current_hour == 18 and current_minute < 30):
                    sleep_seconds = 300
                    mode = "Day (5m)"
                # 3. 18:30 ~ 00:00 (Evening: 10 min)
                else:
                    sleep_seconds = 600
                    mode = "Evening (10m)"

                print(f"💤 [{kst_now.strftime('%H:%M:%S')}] Queue empty. Sleeping {sleep_seconds}s ({mode})...")
                await asyncio.sleep(sleep_seconds)
                continue

            # 2. Sort by pub_date ASC (Process oldest first)
            pending_items.sort(key=lambda x: x.get('pub_date', ''))
            
            print(f"🔎 Found {len(pending_items)} pending items. Processing batch...")
            
            # 3. Refresh Resources (Sheet & Context) per batch
            worksheet = get_google_sheet()
            # [V5.1.1] Use 'description' column (summary doesn't exist in Supabase articles table)
            res_recent = supabase.table("articles").select("title, description").order("published_at", desc=True).limit(300).execute()
            recent_articles = []
            for r in res_recent.data:
                recent_articles.append({"title": r['title'], "description": r['description']})
            
            # 4. Process Batch
            for item in pending_items:
                success = await process_item(item, worksheet, recent_articles)
                if success:
                    # Capture title and description for next items in this batch
                    recent_articles.append({"title": item['title'], "description": item['description']})
                await asyncio.sleep(1) # Rate limit protection

            # 5. Print Stats periodically
            if STATS["total"] > 0 and STATS["total"] % 10 == 0:
                avg_latency = sum(STATS["latencies"]) / len(STATS["latencies"]) if STATS["latencies"] else 0
                print(f"📊 [Stats] Total: {STATS['total']} | Local: {STATS['local']} | Cloud: {STATS['cloud']} | Avg Latency: {avg_latency:.2f}s")

            # 6. Update Heartbeat (V4.6: Distinct key)
            try:
                root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                update_path = os.path.join(root_dir, "last_update.json")
                
                current_data = {}
                if os.path.exists(update_path):
                    with open(update_path, "r", encoding='utf-8') as f:
                        current_data = json.load(f)
                
                current_data["processor_heartbeat"] = datetime.datetime.now().isoformat()
                current_data["processor_status"] = "active"
                
                with open(update_path, "w", encoding='utf-8') as f:
                    json.dump(current_data, f, indent=2)
            except Exception as e:
                print(f"⚠️ Failed to update heartbeat: {e}")

            print("✅ Batch complete. Pausing 5s...")
            await asyncio.sleep(5)

        except KeyboardInterrupt:
            print("\n🛑 Execution stopped by user.")
            break
        except Exception as e:
            import traceback
            print(f"❌ Unexpected Error in Main Loop: {e}")
            try:
                import sentry_sdk
                sentry_sdk.capture_exception(e)
            except: pass
            traceback.print_exc()
            print("   -> Retrying in 30 seconds...")
            await asyncio.sleep(30)

if __name__ == "__main__":
    asyncio.run(main())
