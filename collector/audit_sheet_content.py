# -*- coding: utf-8 -*-
import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv

# Load config
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'service_account.json')

def audit_recent_data():
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        sheet = client.open_by_url(GOOGLE_SHEET_URL)
        worksheet = sheet.get_worksheet(0)
        
        data = worksheet.get_all_values()
        if len(data) <= 1:
            print("Sheet is empty.")
            return

        # Header: [Crawl Time, Search KW, Title, Link, Main KW, Incl KWs, Pub Date, Issue Nature, Summary]
        rows = data[1:]
        recent_rows = rows[:50] # Top rows are newest
        
        print(f"{'Main KW':<15} | {'Issue':<15} | {'Summary'}")
        print("-" * 80)
        
        for i, row in enumerate(recent_rows):
            if len(row) < 9: continue
            
            # Map based on insert_row in processor.py:
            # row = [now_str, keyword, title, link, final_main, ", ".join(final_all_kws), pd_kst_str, issue_nature, summary]
            main_kw = row[4]
            incl_kws = row[5]
            issue = row[7]
            summary = row[8]
            title = row[2]
            
            print(f"[{i+1}] {main_kw:<12} | {issue:<12} | {summary[:60]}...")
            print(f"    Tags: {incl_kws}")
            print(f"    Title: {title[:70]}")
            print("-" * 80)

    except Exception as e:
        print(f"Audit Error: {e}")

if __name__ == "__main__":
    audit_recent_data()
