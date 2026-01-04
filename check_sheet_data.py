
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), 'collector', 'service_account.json')
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic"

def check_sheet():
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_url(GOOGLE_SHEET_URL)
    
    sheet_name = "Synced_Articles"
    worksheet = spreadsheet.worksheet(sheet_name)
    
    # Get first 5 rows
    rows = worksheet.get_all_values()[:5]
    for i, row in enumerate(rows):
        print(f"Row {i+1}: A={row[0]} | G={row[6]} | Title={row[2][:30]}")

check_sheet()
