# -*- coding: utf-8 -*-
import os
import gspread
import datetime
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv

# Load config
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

def organize_sheet():
    try:
        print("🔍 Connecting to Google Sheets...")
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_url(GOOGLE_SHEET_URL)
        worksheet = sheet.get_worksheet(0)
        
        # Get all records
        data = worksheet.get_all_values()
        if len(data) <= 1:
            print("💤 Sheet is empty or only has headers.")
            return

        header = data[0]
        rows = data[1:]
        
        print(f"📄 Found {len(rows)} rows. Starting organization...")

        # 1. Deduplicate by Link (Column Index 3, which is data[1:][3])
        unique_rows = {}
        for row in rows:
            if len(row) < 4: continue
            link = row[3]
            if link not in unique_rows:
                unique_rows[link] = row
            else:
                # Keep the one with more content if possible, or just skip
                pass
        
        organized_rows = list(unique_rows.values())
        print(f"✨ Removed {len(rows) - len(organized_rows)} duplicates.")

        # 2. Sort by Publication Date (Column Index 6) DESC
        # format: 2025-12-25 09:16:00
        def get_pub_date(row):
            if len(row) < 7: return ""
            return row[6]

        organized_rows.sort(key=get_pub_date, reverse=True)
        print("📅 Re-sorted by publication date (Newest First).")

        # 3. Update Sheet
        # Clears current data and batch updates
        worksheet.clear()
        worksheet.update('A1', [header] + organized_rows)
        
        # 4. Formatting improvements (Optional but helpful)
        # Freeze Top Row
        worksheet.freeze(rows=1)
        # Adjusting column widths isn't easily possible with gspread basics but common sense formatting helps
        
        print("✅ Sheet organization complete.")

    except Exception as e:
        print(f"❌ Error organizing sheet: {e}")

if __name__ == "__main__":
    organize_sheet()
