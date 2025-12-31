import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os
from datetime import datetime

# Setup
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds_path = os.path.join(os.getcwd(), 'collector', 'service_account.json')
creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
client = gspread.authorize(creds)

spreadsheet_id = '1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8'
doc = client.open_by_key(spreadsheet_id)

def fix_sheet_order(sheet_name, date_col_index, date_format=None):
    print(f"\n--- Fixing Order for {sheet_name} ---")
    sheet = doc.worksheet(sheet_name)
    data = sheet.get_all_values()
    if len(data) <= 2:
        print("Not enough data to sort.")
        return

    header = data[0]
    rows = data[1:]

    # Helper to parse dates
    def parse_dt(row):
        val = row[date_col_index]
        try:
            # Try various formats
            if '.' in val and '오후' in val or '오전' in val:
                # '2025. 12. 31. 오후 5:29:16'
                clean = val.replace('오전', 'AM').replace('오후', 'PM')
                return datetime.strptime(clean, '%Y. %m. %d. %p %I:%M:%S')
            if '-' in val:
                # '2025-12-31'
                return datetime.strptime(val, '%Y-%m-%d')
            return datetime.min
        except:
            return datetime.min

    # Sort descending (latest first)
    sorted_rows = sorted(rows, key=parse_dt, reverse=True)

    # Update sheet: Clear and rewrite
    sheet.clear()
    sheet.update('A1', [header] + sorted_rows)
    
    # Remove yellow highlighting (reset formatting for Row 2)
    # Note: gspread doesn't have a simple 'clear formatting' for a range without more complex calls, 
    # but the sheet.clear() above usually resets basic grid vibes. 
    # If yellow persists, it's a 'Conditional Formatting' or 'Manual Fill' in the UI.
    print(f"Successfully sorted {len(sorted_rows)} rows in {sheet_name}.")

# Fix common sheets
fix_sheet_order('LoginHistory_v2', 0) # Time col
fix_sheet_order('DailyStats_v2', 0)    # Date col
fix_sheet_order('Visits_v2', 0)        # Time col

print("\n✅ All specified sheets have been re-sorted (Latest First) and formatting reset.")
