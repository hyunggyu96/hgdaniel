
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from src.api.clients import DartAPI
from dotenv import load_dotenv

load_dotenv()
dart = DartAPI(os.getenv("DART_API_KEY"))
print("Testing DART for Hans Biomed...")
corp = dart.get_corp_code("한스바이오메드")
print(f"Corp Code: {corp}")
if corp:
    reports = dart.get_disclosure_list(corp['corp_code'], bgn_de="20240101")
    print(f"Reports found: {len(reports)}")
    if reports:
        print(f"First report: {reports[0]['report_nm']}")
