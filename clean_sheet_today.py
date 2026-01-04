"""오늘자 Google Sheets 데이터 삭제"""
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
from datetime import datetime

# 설정
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'collector', 'service_account.json')
GOOGLE_SHEET_ID = "1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic"
TARGET_DATE = "2026-01-03"

print(f"🔥 Deleting all rows from Google Sheets with date {TARGET_DATE}...\n")

# 구글시트 연결
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
client = gspread.authorize(creds)
spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)

# Synced_Articles 시트에서 삭제
try:
    sheet = spreadsheet.worksheet("Synced_Articles")
    all_values = sheet.get_all_values()
    
    if len(all_values) <= 1:
        print("✅ Synced_Articles: No data rows")
    else:
        # Find rows with target date (from bottom to top)
        rows_to_delete = []
        for idx, row in enumerate(all_values[1:], start=2):  # Skip header
            # Check if any cell contains target date
            if any(TARGET_DATE in str(cell) for cell in row):
                rows_to_delete.append(idx)
        
        # Delete from bottom to top to preserve indices
        deleted_count = 0
        for row_idx in reversed(rows_to_delete):
            sheet.delete_rows(row_idx)
            deleted_count += 1
            if deleted_count % 10 == 0:
                print(f"  Deleted {deleted_count}/{len(rows_to_delete)} rows...")
            
        print(f"✅ Synced_Articles: Deleted {len(rows_to_delete)} rows\n")
        
except Exception as e:
    print(f"❌ Error: {e}\n")

print("✅ Google Sheets cleanup complete!")
