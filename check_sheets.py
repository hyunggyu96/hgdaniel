import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

def list_sheets():
    sheet_id = "1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8"
    # Try to find credentials
    creds_env = os.environ.get("GOOGLE_SERVICE_ACCOUNT_KEY")
    if not creds_env:
        # Try local backup
        backup_path = "c:\\Users\\hyung\\Desktop\\news_dashboard\\collector\\service_account.json"
        if os.path.exists(backup_path):
            with open(backup_path, 'r') as f:
                creds_info = json.load(f)
        else:
            print("No credentials found.")
            return
    else:
        creds_info = json.loads(creds_env)

    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    creds = service_account.Credentials.from_service_account_info(creds_info, scopes=scopes)
    service = build('sheets', 'v4', credentials=creds)

    spreadsheet = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
    sheets = spreadsheet.get('sheets', [])
    
    print(f"Spreadsheet Title: {spreadsheet.get('properties', {}).get('title')}")
    print("Sheets available:")
    for s in sheets:
        print(f"- {s.get('properties', {}).get('title')}")

if __name__ == "__main__":
    list_sheets()
