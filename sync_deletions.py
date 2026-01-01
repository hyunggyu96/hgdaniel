"""구글 시트(Synced_Articles)에서 삭제된 항목을 Supabase에서도 삭제"""
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from supabase import create_client
import os

# 설정
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'collector', 'service_account.json')
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic"
SHEET_NAME = "Synced_Articles"
SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"

def sync_deletions():
    print("🗑️ 구글 시트 -> Supabase 삭제 동기화 시작")
    
    # 1. 구글 시트 연결 및 링크 목록 가져오기
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_url(GOOGLE_SHEET_URL)
    worksheet = spreadsheet.worksheet(SHEET_NAME)
    
    sheet_links = set(worksheet.col_values(4)[1:]) # Column D, skip header
    print(f"📊 구글 시트 내 링크 개수: {len(sheet_links)}")
    
    # 2. Supabase 연결 및 링크 목록 가져오기
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    db_articles = supabase.table('articles').select('link').execute().data
    
    db_links = {a['link'] for a in db_articles}
    print(f"📊 Supabase 내 기사 개수: {len(db_links)}")
    
    # 3. 삭제 대상 찾기 (DB에만 있고 시트에는 없는 링크)
    to_delete = db_links - sheet_links
    
    if not to_delete:
        print("✅ 삭제할 항목이 없습니다. (완벽 동기화 상태)")
        return
    
    print(f"🚨 삭제 대상 발견: {len(to_delete)}개")
    
    # 4. Supabase에서 삭제
    for link in to_delete:
        try:
            supabase.table('articles').delete().eq('link', link).execute()
            print(f"   🗑️ 삭제 완료: {link[:50]}...")
        except Exception as e:
            print(f"   ❌ 삭제 실패 ({link[:30]}): {e}")
            
    print(f"\n✅ 삭제 동기화 완벽 완료!")

if __name__ == "__main__":
    sync_deletions()
