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

def analyze_sheet():
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

        # Last 50 rows (ignoring header)
        rows = data[1:]
        recent_rows = rows[-50:] if len(rows) > 50 else rows
        
        print(f"--- Last {len(recent_rows)} Rows Analysis ---")
        
        links = {} # link -> [titles, summaries, main_kws]
        titles = {} # title -> [links]
        
        for i, row in enumerate(recent_rows):
            # Column mapping (based on previous observations):
            # 0: pub_date, 1: category, 2: title, 3: link, 4: search_kw, 
            # 5: main_kw, 6: incl_kws, 7: issue_nature, 8: summary, 9: impact
            if len(row) < 9: continue
            
            title = row[2]
            link = row[3]
            main_kw = row[5]
            incl_kws = row[6]
            issue = row[7]
            summary = row[8]
            
            if link not in links:
                links[link] = []
            links[link].append({"title": title, "main_kw": main_kw, "summary": summary})
            
            if title not in titles:
                titles[title] = []
            titles[title].append(link)

        # 1. Duplicate Links
        dup_links = {k: v for k, v in links.items() if len(v) > 1}
        if dup_links:
            print(f"\n⚠️ Found {len(dup_links)} duplicate links in the sheet:")
            for link, info in dup_links.items():
                print(f"  - Link: {link}")
                for entry in info:
                    print(f"    - Title: {entry['title'][:50]}... | KW: {entry['main_kw']} | Summary: {entry['summary'][:50]}...")
        else:
            print("\n✅ No duplicate links found in the last 50 rows.")

        # 2. Duplicate Titles (potentially different URLs/content but semantically identical)
        dup_titles = {k: v for k, v in titles.items() if len(v) > 1}
        if dup_titles:
            print(f"\n⚠️ Found {len(dup_titles)} duplicate/similar titles:")
            for title, l_list in dup_titles.items():
                print(f"  - Title: {title}")
                for l in l_list:
                    print(f"    - Link: {l}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_sheet()
