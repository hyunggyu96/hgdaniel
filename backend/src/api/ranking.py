import logging
from typing import List, Dict, Any
import datetime
import json
import os
from src.api.clients import DartAPI

class RankingManager:
    def __init__(self, dart_api: DartAPI, cache_file: str = "ranking_cache.json"):
        self.dart_api = dart_api
        self.logger = logging.getLogger(__name__)
        self.cache_path = os.path.join(os.path.dirname(__file__), "../../data", cache_file)
        os.makedirs(os.path.dirname(self.cache_path), exist_ok=True)

    def get_rankings(self, company_list: List[str]) -> Dict[str, int]:
        """
        Get revenue rankings for the given list of companies.
        Returns a dictionary { "CompanyName": rank }
        """
        # Try to load from cache
        if os.path.exists(self.cache_path):
            with open(self.cache_path, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
                cache_date = cache_data.get("updated_at")
                # simple cache validity check (e.g. 1 day)
                if cache_date and (datetime.datetime.now() - datetime.datetime.fromisoformat(cache_date)).days < 1:
                    self.logger.info("Using cached rankings")
                    return cache_data.get("rankings", {})

        self.logger.info("Updating rankings (fetching DART data)...")
        revenue_data = []

        total = len(company_list)
        for idx, company in enumerate(company_list):
            self.logger.info(f"[{idx+1}/{total}] Processing {company}...")
            try:
                # 1. Get Corp Code
                corp_info = self.dart_api.get_corp_code(company)
                if not corp_info:
                    continue
                    
                corp_code = corp_info.get('corp_code')

                # 2. Get Report List
                reports = self.dart_api.get_disclosure_list(corp_code, bgn_de="20230101")
                
                # 3. Find latest quarterly/half/annual report
                target_report = None
                for report in reports:
                    report_nm = report.get('report_nm', '')
                    if "분기보고서" in report_nm or "반기보고서" in report_nm or "사업보고서" in report_nm:
                        # Ensure we can parse the code
                        meta = self.dart_api.parse_report_code(report_nm)
                        if meta:
                            target_report = report
                            target_meta = meta
                            break
                
                if target_report and target_meta:
                    # 4. Get Financials
                    financials = self.dart_api.get_financials(
                        corp_code, 
                        target_meta['year'], 
                        target_meta['code']
                    )
                    
                    if financials:
                        revenue = financials.get('revenue', '0')
                        # Revenue is likely a string "1,234,567,890" or int
                        if isinstance(revenue, str):
                            revenue = int(revenue.replace(",", ""))
                        
                        revenue_data.append({
                            "name": company,
                            "revenue": revenue
                        })
            except Exception as e:
                self.logger.error(f"Error fetching revenue for {company}: {e}")
                continue

        # Sort by revenue descending
        revenue_data.sort(key=lambda x: x["revenue"], reverse=True)

        # Create rank map
        rank_map = {item["name"]: i+1 for i, item in enumerate(revenue_data)}

        # Save to cache
        with open(self.cache_path, "w", encoding="utf-8") as f:
            json.dump({
                "updated_at": datetime.datetime.now().isoformat(),
                "rankings": rank_map
            }, f, ensure_ascii=False, indent=2)

        return rank_map
