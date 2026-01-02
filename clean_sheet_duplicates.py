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
    # 반드시 이름으로 찾기 (인덱스 위험)
    try:
        worksheet = sheet.worksheet("Synced_Articles")
        print("✅ 타겟 시트: Synced_Articles")
    except:
        print("⚠️ Synced_Articles 탭을 찾을 수 없습니다! (Sheet1 사용 시도)")
        worksheet = sheet.get_worksheet(0)
    
    # 모든 데이터 가져오기
    all_data = worksheet.get_all_values()
    header = all_data[0]
    rows = all_data[1:]
    
    print(f"📊 전체 행 수: {len(rows)}개")
    
    # 초기화
    seen_links = set()
    unique_rows = []
    
    # 필터 리스트 정의 (강력 차단)
    CAR_BRANDS = ["르노코리아", "르노삼성", "현대차", "기아차", "쌍용차", "KG모빌리티", "쉐보레", "폭스바겐", "메르세데스", "벤츠", "BMW", "아르카나", "토레스", "그랜저", "제네시스", "테슬라"]
    NOISE_KEYWORDS = ["시승기", "자동차 리콜", "타이어 교체", "중고차", "전기차", "수소차", "도로공사", "블랙박스", "당구(PBA)", "프로농구", "프로배구"]
    BAD_KEYWORDS = ["캐시워크", "캐시닥", "용돈퀴즈", "돈버는퀴즈", "정답", "퀴즈", "신차", "SUV", "A-필러", "B-필러", "C-필러", "디지털키"]

    duplicates = 0
    filtered_count = 0
    
    for row in rows:
        keyword = row[1] if len(row) > 1 else ""
        title = row[2] if len(row) > 2 else ""
        link = row[3] if len(row) > 3 else ""
        full_text = f"{keyword} {title}"
        
        # 1. 노이즈 필터링
        is_noise = False
        if any(b in full_text for b in CAR_BRANDS): is_noise = True
        elif any(n in full_text for n in NOISE_KEYWORDS): is_noise = True
        elif any(bad in title for bad in BAD_KEYWORDS): is_noise = True
        
        if is_noise:
            filtered_count += 1
            print(f"🗑️ [노이즈 제거] {title[:30]}...")
            continue

        # 2. 링크 중복 필터링
        if link and link not in seen_links:
            seen_links.add(link)
            unique_rows.append(row)
        else:
            duplicates += 1
    
    print(f"🔍 중복 발견: {duplicates}개")
    print(f"🚫 노이즈 제거: {filtered_count}개")
    
    print(f"🔍 중복 발견: {duplicates}개")
    print(f"✅ 정리 후 남을 행: {len(unique_rows)}개")
    
    if duplicates == 0:
        print("정리할 중복이 없습니다!")
        return
    
    # 자동 실행 (사용자 확인 생략)
    print("🚀 즉시 정리 시작!")
    
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
