"""구글시트 중복 데이터 정리 스크립트"""
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

# 설정
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'collector', 'service_account.json')
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic"

def clean_duplicates():
    # 구글시트 연결
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_url(GOOGLE_SHEET_URL)
    worksheet = sheet.get_worksheet(0)
    
    # 모든 데이터 가져오기
    all_data = worksheet.get_all_values()
    header = all_data[0]
    rows = all_data[1:]
    
    print(f"📊 전체 행 수: {len(rows)}개")
    
    # 링크(Column D, index 3) 기준 중복 제거
    seen_links = set()
    unique_rows = []
    duplicates = 0
    
    for row in rows:
        link = row[3] if len(row) > 3 else ""
        if link and link not in seen_links:
            seen_links.add(link)
            unique_rows.append(row)
        else:
            duplicates += 1
    
    print(f"🔍 중복 발견: {duplicates}개")
    print(f"✅ 정리 후 남을 행: {len(unique_rows)}개")
    
    if duplicates == 0:
        print("정리할 중복이 없습니다!")
        return
    
    # 사용자 확인
    confirm = input("\n중복을 제거하시겠습니까? (yes/no): ")
    if confirm.lower() != 'yes':
        print("취소됨")
        return
    
    # 시트 정리 (헤더 제외하고 모든 데이터 삭제 후 재입력)
    print("🔄 시트 정리 중...")
    
    # 기존 데이터 삭제 (헤더 제외)
    if len(rows) > 0:
        worksheet.delete_rows(2, len(rows) + 1)
    
    # 유니크 데이터 재입력 (역순으로 - 최신이 위로)
    for row in reversed(unique_rows):
        worksheet.insert_row(row, 2)
    
    print(f"✅ 완료! {len(unique_rows)}개 행으로 정리되었습니다.")

if __name__ == "__main__":
    clean_duplicates()
