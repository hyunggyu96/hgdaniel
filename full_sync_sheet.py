import os
import sys
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from supabase import create_client
from dotenv import load_dotenv
import datetime

# Load Env
load_dotenv('collector/.env')
# Also load root .env.local for Supabase keys
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')
GOOGLE_SHEET_URL = os.getenv('GOOGLE_SHEET_URL')
SERVICE_ACCOUNT_FILE = 'collector/service_account.json'

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase keys missing.")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_google_sheet():
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_url(GOOGLE_SHEET_URL)
        # Try to get specific sheet or first one
        try:
             # First sheet often used
             return sheet.get_worksheet(0)
        except:
             return None
    except Exception as e:
        print(f"❌ Google Sheet Error: {e}")
        return None

def main():
    print("🧹 Syncing Google Sheet with DB (Reset & Refill)...")
    
    # 1. Fetch ALL articles from DB, ordered by published_at (newest first)
    print("📥 Fetching articles from Supabase...")
    res = supabase.table("articles").select("*").order("published_at", desc=True).limit(1000).execute()
    articles = res.data
    
    if not articles:
        print("⚠️ No articles found in DB.")
        return

    print(f"✅ Loaded {len(articles)} articles from DB.")

    # 2. Connect to Sheet
    ws = get_google_sheet()
    if not ws: return

    # 3. Clear Sheet
    print("🗑️ Clearing existing sheet content...")
    ws.clear()

    # 4. Set Headers
    headers = ["1. 분석 시각", "2. 검색 키워드", "3. 헤드라인", "4. 링크", "5. 메인 키워드", "6. 포함 키워드", "7. 발행 시각", "8. 이슈 성격", "9. AI 한 줄 요약"]
    ws.append_row(headers)
    
    # 5. Prepare Rows
    rows = []
    print("📝 Preparing rows...")
    
    for article in articles:
        # Field Mapping
        # Analysis Time: Not stored in 'articles' table directly usually, 
        # but we can use 'created_at' + 9h (KST) as proxy for analysis time.
        
        created_at_utc = article.get('created_at')
        if created_at_utc:
            try:
                # Handle standard ISO format variations
                if 'T' in created_at_utc:
                    dt_utc = datetime.datetime.fromisoformat(created_at_utc.replace('Z', '+00:00'))
                else:
                    dt_utc = datetime.datetime.strptime(created_at_utc, "%Y-%m-%d %H:%M:%S+00:00")
                
                # Add 9 hours for KST
                dt_kst = dt_utc + datetime.timedelta(hours=9)
                analysis_time_str = dt_kst.strftime("%Y-%m-%d %H:%M:%S")
            except:
                analysis_time_str = "-"
        else:
            analysis_time_str = "-"

        # Published Time (Convert to KST)
        pub_iso = article.get('published_at', '-')
        if pub_iso != '-':
            try:
                # Assuming pub_iso is stored as UTC ISO string in DB
                if 'T' in pub_iso:
                    pd_utc = datetime.datetime.fromisoformat(pub_iso.replace('Z', '+00:00'))
                else:
                    pd_utc = datetime.datetime.strptime(pub_iso, "%Y-%m-%d %H:%M:%S+00:00")
                
                pd_kst = pd_utc + datetime.timedelta(hours=9)
                pub_iso = pd_kst.strftime("%Y-%m-%d %H:%M:%S")
            except:
                pass # Keep original if parsing fails

        keyword = article.get('keyword', '-')
        title = article.get('title', '-')
        link = article.get('link', '-')
        desc = article.get('description', '-')
        
        # Keywords Parsing
        m_kws = article.get('main_keywords', [])
        main_kw = "기타"
        included = []
        issue_nature = "기타"
        summary = "-"
        
        if m_kws and len(m_kws) > 0:
            first = m_kws[0]
            if first.startswith('[') and ']' in first:
                 # Parse [Main | Issue | Summary]
                content = first[1:first.rfind(']')]
                parts = [p.strip() for p in content.split('|')]
                if len(parts) >= 1: main_kw = parts[0]
                if len(parts) >= 2: issue_nature = parts[1]
                if len(parts) >= 3: summary = parts[2]
                included = m_kws[1:]
            else:
                main_kw = first
                included = m_kws[1:]
        
        # Final fallback for summary if parsing failed
        if summary == "-" or not summary:
            # Try to use description if summary is missing
            summary = desc[:70] + "..." if desc else "-"

        row = [
            analysis_time_str,
            keyword,
            title,
            link,
            main_kw,
            ", ".join(included),
            pub_iso,
            issue_nature,
            summary
        ]
        
        rows.append(row)

    # 6. Bulk Insert
    print(f"🚀 Uploading {len(rows)} rows to Google Sheet...")
    # Chunking to be safe with limits
    chunk_size = 50
    for i in range(0, len(rows), chunk_size):
        ws.append_rows(rows[i:i+chunk_size])
        print(f"   - Uploaded batch {i//chunk_size + 1}")
        
    print("🎉 Full Sync Complete!")

if __name__ == "__main__":
    main()
