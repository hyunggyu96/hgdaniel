import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds_path = os.path.join(os.getcwd(), 'collector', 'service_account.json')
creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
client = gspread.authorize(creds)

spreadsheet_id = '1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8'

def check_sheet(name):
    print(f"\n--- Checking {name} ---")
    try:
        sheet = client.open_by_key(spreadsheet_id).worksheet(name)
        rows = sheet.get_all_values()
        if not rows:
            print("Sheet is empty.")
            return
        
        print(f"Total rows: {len(rows)}")
        print(f"Header: {rows[0]}")
        print("First 3 Data Rows (Top):")
        for i, row in enumerate(rows[1:4]):
            print(f"Row {i+2}: {row}")
            
        print("Last 3 Data Rows (Bottom):")
        for i, row in enumerate(rows[-3:]):
            if row == rows[0]: continue # skip header if total rows < 4
            print(f"Row {len(rows)-2+i if len(rows)>2 else i}: {row}")
    except Exception as e:
        print(f"Error: {e}")

check_sheet('LoginHistory_v2')
check_sheet('DailyStats_v2')
check_sheet('Visits_v2')
