import gspread
from oauth2client.service_account import ServiceAccountCredentials
import logging
from datetime import datetime

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
SHEET_ID = "1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8" # Login Logs
TAB_NAME = "Visits"
SERVICE_ACCOUNT_FILE = 'collector/service_account.json'

def parse_korean_date_flexible(date_str):
    """
    Parses dates like '2025. 12. 26. 오후 07:11:27' or standard ISO formats.
    Returns a sortable datetime object.
    """
    try:
        # Expected format from sheet: '2025. 12. 26. 오후 07:11:27'
        # Simple cleanup to standard format
        clean_str = date_str.replace('오전', 'AM').replace('오후', 'PM').replace('.', '').replace('  ', ' ')
        # Try multiple formats
        for fmt in ['%Y %m %d %p %I:%M:%S', '%Y-%m-%d %H:%M:%S']:
            try:
                return datetime.strptime(clean_str, fmt)
            except ValueError:
                continue
        return datetime.min # Fallback for bad dates
    except Exception:
        return datetime.min

def organize_visits():
    try:
        logging.info("Connecting to Google Sheets...")
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
        client = gspread.authorize(creds)
        
        sheet = client.open_by_key(SHEET_ID)
        ws = sheet.worksheet(TAB_NAME)
        
        logging.info(f"opened worksheet: {TAB_NAME}")
        
        # Get all data
        all_values = ws.get_all_values()
        if len(all_values) < 2:
            logging.info("Not enough data to sort.")
            return

        header = all_values[0]
        data_rows = all_values[1:]
        
        logging.info(f"Sorting {len(data_rows)} rows by Date (Descending)...")
        
        # Sort logic: Recent first
        # We assume column 0 is the date 'Time'
        data_rows.sort(key=lambda row: parse_korean_date_flexible(row[0]), reverse=True)
        
        logging.info("Updating sheet...")
        ws.clear()
        ws.update('A1', [header] + data_rows)
        ws.freeze(rows=1)
        
        logging.info("✅ Organization Complete: Sorted newest first.")
        
    except Exception as e:
        logging.error(f"❌ Failed: {e}")

if __name__ == "__main__":
    organize_visits()
