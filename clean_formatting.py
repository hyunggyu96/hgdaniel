import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

# Setup
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds_path = os.path.join(os.getcwd(), 'collector', 'service_account.json')
creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
client = gspread.authorize(creds)

spreadsheet_id = '1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8'
doc = client.open_by_key(spreadsheet_id)

def clean_sheet_format(sheet_name):
    print(f"Cleaning format for {sheet_name}...")
    sheet = doc.worksheet(sheet_name)
    
    # 1. Clear all formatting for the first 1000 rows
    # Setting background to white (1,1,1) and text to black (0,0,0)
    body = {
        "requests": [
            {
                "repeatCell": {
                    "range": {
                        "sheetId": sheet.id,
                        "startRowIndex": 0,
                        "endRowIndex": 1000,
                        "startColumnIndex": 0,
                        "endColumnIndex": 10
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": {"red": 1, "green": 1, "blue": 1},
                            "textFormat": {"foregroundColor": {"red": 0, "green": 0, "blue": 0}, "bold": False}
                        }
                    },
                    "fields": "userEnteredFormat(backgroundColor,textFormat)"
                }
            },
            {
                # 2. Make headers bold and slightly gray-ish for visibility (Optional, or just pure white)
                "repeatCell": {
                    "range": {
                        "sheetId": sheet.id,
                        "startRowIndex": 0,
                        "endRowIndex": 1
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "textFormat": {"bold": True},
                            "backgroundColor": {"red": 0.95, "green": 0.95, "blue": 0.95}
                        }
                    },
                    "fields": "userEnteredFormat(backgroundColor,textFormat)"
                }
            }
        ]
    }
    doc.batch_update(body)
    print(f"✅ {sheet_name} is now CLEAN.")

# Clean all relevant sheets
clean_sheet_format('LoginHistory_v2')
clean_sheet_format('Visits_v2')
clean_sheet_format('DailyStats_v2')

print("\n✨ 모든 시트의 노란색 하이라이트를 제거하고 배경을 초기화했습니다.")
