"""Supabase articles → 새 구글시트 탭으로 동기화"""
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from supabase import create_client
import os
import datetime

# 설정
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'collector', 'service_account.json')
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic"
SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"

def sync_to_new_sheet():
    print("🔄 Supabase → 새 구글시트 동기화 시작")
    
    # 1. Supabase 연결
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # 2. articles 데이터 가져오기 (최신순)
    print("📊 Supabase articles 데이터 가져오는 중...")
    result = supabase.table('articles').select('*').order('published_at', desc=True).execute()
    articles = result.data
    print(f"   총 {len(articles)}개 기사 발견")
    
    # 3. 구글시트 연결
    print("📑 구글시트 연결 중...")
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_url(GOOGLE_SHEET_URL)
    
    # 4. 새 시트 생성 (이미 있으면 삭제 후 재생성)
    new_sheet_name = "Synced_Articles"
    try:
        old_sheet = spreadsheet.worksheet(new_sheet_name)
        spreadsheet.del_worksheet(old_sheet)
        print(f"   기존 '{new_sheet_name}' 시트 삭제")
    except:
        pass
    
    new_worksheet = spreadsheet.add_worksheet(title=new_sheet_name, rows=len(articles)+10, cols=10)
    print(f"   새 시트 '{new_sheet_name}' 생성 완료")
    
    # 5. 헤더 작성
    headers = ["분석시각", "검색키워드", "제목", "링크", "메인키워드", "전체키워드", "발행일", "이슈성격", "요약"]
    new_worksheet.append_row(headers)
    
    # 6. 데이터 변환 및 작성 (배치로)
    print("📝 데이터 작성 중...")
    rows_to_add = []
    
    for article in articles:
        # 시간 변환
        pub_date = article.get('published_at', '')
        if pub_date:
            try:
                dt = datetime.datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                pub_date_kst = (dt + datetime.timedelta(hours=9)).strftime("%Y-%m-%d %H:%M:%S")
            except:
                pub_date_kst = pub_date[:19] if len(pub_date) > 19 else pub_date
        else:
            pub_date_kst = ""
        
        # 키워드 처리
        main_keywords = article.get('main_keywords', [])
        if isinstance(main_keywords, list):
            keywords_str = ", ".join(main_keywords)
            main_kw = main_keywords[0] if main_keywords else ""
        else:
            keywords_str = str(main_keywords)
            main_kw = ""
        
        row = [
            pub_date_kst,  # 분석시각 (발행일 사용)
            article.get('keyword', ''),
            article.get('title', ''),
            article.get('link', ''),
            main_kw,
            keywords_str,
            pub_date_kst,
            article.get('issue_nature', ''), # 이슈 성격은 유지
            article.get('description', '')[:100] if article.get('description') else "" # V4.1: 다시 원본 내용 사용
        ]
        rows_to_add.append(row)
    
    # 배치로 추가 (100개씩)
    batch_size = 100
    for i in range(0, len(rows_to_add), batch_size):
        batch = rows_to_add[i:i+batch_size]
        new_worksheet.append_rows(batch)
        print(f"   {min(i+batch_size, len(rows_to_add))}/{len(rows_to_add)}개 완료...")
    
    print(f"\n✅ 완료! '{new_sheet_name}' 시트에 {len(articles)}개 기사 동기화됨")
    print(f"   기존 'Sheet1'은 백업으로 유지됩니다.")

if __name__ == "__main__":
    sync_to_new_sheet()
