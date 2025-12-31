import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import sys

# Constants
SHEET_ID = "1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8"
SERVICE_ACCOUNT_FILE = 'collector/service_account.json'

def check_login_sheet():
    # Auth
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    
    # Open Sheet
    try:
        sh = client.open_by_key(SHEET_ID)
        print(f"📂 Spreadsheet Title: {sh.title}")
        print("📑 Worksheets:")
        for ws in sh.worksheets():
            print(f"\n  📑 [{ws.title}]")
            rows = ws.get_all_values()
            
            if ws.title == "Visits":
                if len(rows) > 1:
                    print(f"    - Total Rows: {len(rows)}")
                    print(f"    - Header: {rows[0]}")
                    print(f"    - Top 1 (Latest?): {rows[1]}")
                    print(f"    - Top 2: {rows[2]}")
                else:
                    print("    - (Empty or Header only)")
            
            elif ws.title == "DailyStats":
                print("    - Content:")
                for r in rows:
                    print(f"      {r}")
            
            else:
                print(f"    - Rows: {len(rows)}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_login_sheet()
