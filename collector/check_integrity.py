# -*- coding: utf-8 -*-
import os
import gspread
import re
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv

# Load config
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

def check_integrity():
    try:
        print("🔍 Connecting to Google Sheets for Integrity Audit...")
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_url(GOOGLE_SHEET_URL)
        worksheet = sheet.get_worksheet(0)
        
        data = worksheet.get_all_values()
        if len(data) <= 1:
            print("✅ Sheet is empty or only has headers.")
            return

        header = data[0]
        rows = data[1:51] # Check recent 50 rows
        
        errors = []
        hanja_pattern = re.compile(r'[\u4e00-\u9fff]')
        
        for i, row in enumerate(rows, start=2):
            if len(row) < 9:
                errors.append(f"Row {i}: Incomplete columns (Found {len(row)})")
                continue
                
            title = row[2]
            summary = row[8]
            kws = row[5]
            
            # 1. Hanja Check
            if hanja_pattern.search(title) or hanja_pattern.search(summary):
                errors.append(f"Row {i}: Hanja detected in Title or Summary")
            
            # 2. AI Typos
            if "휴zel" in kws or "휴zel" in summary or "Hugel" in kws:
                errors.append(f"Row {i}: AI Typo (휴zel/Hugel) detected")
                
            # 3. Empty Summary
            if not summary or summary.strip() == "-" or len(summary) < 5:
                errors.append(f"Row {i}: Missing or too short summary")

        if not errors:
            print("✅ No data integrity issues found in recent 50 rows.")
        else:
            print(f"⚠️ Found {len(errors)} issues:")
            for err in errors[:10]: # Show top 10
                print(f"  - {err}")
            if len(errors) > 10:
                print(f"  ... and {len(errors)-10} more.")

    except Exception as e:
        print(f"❌ Audit Error: {e}")

if __name__ == "__main__":
    check_integrity()
