
import json
import os
import datetime
from supabase import create_client
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# [1] Load Keywords & Categories (SSOT)
shared_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_shared')
keywords_path = os.path.join(shared_dir, 'keywords.json')

with open(keywords_path, 'r', encoding='utf-8') as f:
    CATEGORIES_CONFIG = json.load(f).get('categories', [])

def determine_category(title, description, search_keyword):
    """Determines news category based on keyword scores (Matches Frontend Logic)"""
    content = f"{title or ''} {search_keyword or ''} {description or ''}"
    best_category = "Corporate News"
    highest_score = 0
    category_scores = {}
    
    # Identify corporate keywords
    corporate_config = next((c for c in CATEGORIES_CONFIG if c['label'] == "Corporate News"), None)
    corporate_keywords = corporate_config['keywords'] if corporate_config else []
    mentioned_companies = [k for k in corporate_keywords if k in content]
    is_multi_company = len(mentioned_companies) >= 2
    
    for config in CATEGORIES_CONFIG:
        label = config['label']
        keywords = config['keywords']
        score = 0
        is_corporate = (label == "Corporate News")
        
        for k in keywords:
            if search_keyword == k: score += 100
            if title and k in title: score += 50
            if description and k in description: score += 10
            
        if is_corporate and is_multi_company:
            score += 150
            
        category_scores[label] = score
        if score > highest_score:
            highest_score = score
            best_category = label
            
    # Rule: Product category takes priority if title matches
    if best_category == "Corporate News":
        best_product_cat = None
        max_product_score = 0
        for label, score in category_scores.items():
            if label != "Corporate News" and score > max_product_score:
                max_product_score = score
                best_product_cat = label
        if best_product_cat and max_product_score >= 50:
            best_category = best_product_cat
            
    return best_category

# [2] Clients Setup
SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'collector', 'service_account.json')
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic"

def backfill_and_sync():
    print("🔄 전수 카테고리 재분류 및 동기화 시작...")
    
    # Get all articles from Supabase
    result = supabase.table('articles').select('*').order('published_at', desc=True).execute()
    articles = result.data
    print(f"   총 {len(articles)}개 기사 분석 시작")
    
    # Setup Google Sheet
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_url(GOOGLE_SHEET_URL)
    
    # Re-create Synced_Articles sheet
    sheet_name = "Synced_Articles"
    try:
        old = spreadsheet.worksheet(sheet_name)
        spreadsheet.del_worksheet(old)
    except: pass
    
    worksheet = spreadsheet.add_worksheet(title=sheet_name, rows=len(articles)+100, cols=12)
    headers = ["분석시각", "검색키워드", "카테고리", "제목", "링크", "메인키워드", "전체키워드", "발행일", "이슈성격", "요약"]
    worksheet.append_row(headers)
    
    rows_to_add = []
    for art in articles:
        category = determine_category(art.get('title'), art.get('description'), art.get('keyword'))
        
        # Time conversion
        pub_date = art.get('published_at', '')
        try:
            dt = datetime.datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
            pub_date_kst = (dt + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S")
        except: pub_date_kst = pub_date[:19]
        
        created_at = art.get('created_at', '')
        try:
            c_dt = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            created_at_kst = (c_dt + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S")
        except: created_at_kst = created_at[:19]

        main_kws = art.get('main_keywords', [])
        main_kw = main_kws[0] if main_kws else ""
        all_kws = ", ".join(main_kws) if isinstance(main_kws, list) else str(main_kws)

        row = [
            created_at_kst,
            art.get('keyword', ''),
            category, # <--- 실제 분류 결과 주입!
            art.get('title', ''),
            art.get('link', ''),
            main_kw,
            all_kws,
            pub_date_kst,
            art.get('issue_nature', '기타'),
            art.get('description', '')[:100]
        ]
        rows_to_add.append(row)
        
    # Batch update
    print(f"   시트에 {len(rows_to_add)}개 데이터 작성 중...")
    batch_size = 100
    for i in range(0, len(rows_to_add), batch_size):
        batch = rows_to_add[i:i+batch_size]
        worksheet.append_rows(batch)
        print(f"   {min(i+batch_size, len(rows_to_add))} 완료")

    print("\n✅ 모든 데이터가 실제 카테고리로 재분류되어 시트에 기록되었습니다!")

if __name__ == "__main__":
    backfill_and_sync()
