import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv

load_dotenv('collector/.env')

GOOGLE_SHEET_URL = os.getenv("GOOGLE_SHEET_URL")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'collector', 'service_account.json')

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
client = gspread.authorize(creds)

sheet = client.open_by_url(GOOGLE_SHEET_URL).worksheet("Synced_Articles")
headers = sheet.row_values(1)
print(f"Current Headers: {headers}")
print(f"Total Columns: {len(headers)}")
