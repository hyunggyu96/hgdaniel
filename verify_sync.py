import os
import datetime
from supabase import create_client
from dotenv import load_dotenv
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# 환경 로드
load_dotenv('collector/.env')
load_dotenv('.env.local')  # Google Creds file path might be here or relative

# Supabase 연결
sb_url = os.getenv("SUPABASE_URL")
sb_key = os.getenv("SUPABASE_KEY")
supabase = create_client(sb_url, sb_key)

# 1. Supabase 최신 데이터 조회
print("🔍 Checking Supabase...")
res_sb = supabase.table("articles").select("*").order("created_at", desc=True).limit(1).execute()
if not res_sb.data:
    print("❌ Supabase Empty!")
    exit(1)

latest_sb = res_sb.data[0]
print(f"   [Supabase] Latest: {latest_sb['title'][:30]}... ({latest_sb['created_at']})")

# 2. Google Sheet 최신 데이터 조회 (Row 2)
print("\n🔍 Checking Google Sheets...")
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
# collector 폴더 안에 있는 service_account.json 사용 가정
creds_path = 'collector/service_account.json'
if not os.path.exists(creds_path):
    # 루트에 있을 수도 있음
    if os.path.exists('service_account.json'):
        creds_path = 'service_account.json'
    else:
        print("❌ Service Account Key Not Found!")
        exit(1)

creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
client = gspread.authorize(creds)

sheet_url = os.getenv("GOOGLE_SHEET_URL")
if not sheet_url:
    # .env.local의 GOOGLE_SHEET_ID_MARKET 같은 것을 찾아야 할 수도 있으나, 
    # 일단 collector/.env에 있는 URL을 믿음
    pass

try:
    # URL이 없으면 ID로 시도 (fallback)
    # Market Analysis Sheet ID: 1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic
    sheet = client.open_by_key("1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic")
    worksheet = sheet.worksheet("Synced_Articles")
    
    # 2행 데이터 가져오기 (헤더가 1행)
    row_2 = worksheet.row_values(2)
    # [LogTime, Keyword, Title, Link, MainKW, ExtKW, PubDate, ...] 순서 예상
    
    print(f"   [GoogleSheet] Row 2: {row_2[2][:30]}... ({row_2[0]})")
    
    # 비교
    is_match = False
    if row_2[3].strip() == latest_sb['link'].strip(): # 링크 비교
        is_match = True
    elif row_2[2][:10] in latest_sb['title']: # 제목 일부 비교
        is_match = True
        
    if is_match:
        print("\n✅ SYNC MATCH! (Supabase & Google Sheet are perfectly synced)")
    else:
        print("\n⚠️ SYNC MISMATCH?")
        print(f"Supabase Link: {latest_sb['link']}")
        print(f"Sheet Link   : {row_2[3] if len(row_2)>3 else 'None'}")
        print("Note: If processor is fast, sheet row 2 might be the one BEFORE this check.")

except Exception as e:
    print(f"❌ Google Sheet Error: {e}")
