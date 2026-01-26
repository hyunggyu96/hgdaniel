
import os
import sys
import logging
import time

# Add project root to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from src.api.clients import DartAPI
from src.api.ranking import RankingManager
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)

def main():
    load_dotenv()
    dart_api_key = os.getenv("DART_API_KEY")
    if not dart_api_key:
        print("Error: DART_API_KEY not found in .env")
        return

    dart = DartAPI(dart_api_key)
    manager = RankingManager(dart, "ranking_cache.json")
    
    companies = [
        "한스바이오메드", "엘앤씨바이오", "제테마", "한국비엔씨", "종근당바이오",
        "휴온스", "휴온스글로벌", "휴메딕스", "휴젤", "메디톡스",
        "대웅제약", "파마리서치", "클래시스", "케어젠", "원텍",
        "동방메디컬", "제이시스메디칼", "바이오비쥬", "바이오플러스", "비올",
        "하이로닉", "레이저옵텍", "유바이오로직스"
    ]
    
    print(f"Starting Ranking Update for {len(companies)} companies...")
    
    # We will manually iterate to show progress, instead of calling get_rankings at once
    # But get_rankings is the logic holder.
    # To avoid rewriting logic, let's just patch the method or trust it?
    # No, let's rewrite the loop here slightly to debug, or rely on RankingManager logging?
    # RankingManager doesn't log per company.
    
    # Let's use the manager but maybe I should have added logging to Manager.
    # I'll just run it and hope to see "Error" logs if any.
    # Actually, I'll modify RankingManager to log info.
    
    rankings = manager.get_rankings(companies)
    print("Rankings Updated:", rankings)

if __name__ == "__main__":
    main()
