import logging
from typing import Dict, Any, List
import os
from dotenv import load_dotenv
from src.api.clients import DartAPI, NaverAPI
from src.api.llm import GeminiClient
from src.cache import AnalysisCache

load_dotenv()

# Manual mapping for companies where display name != DART name or stock code is missing
COMPANY_MANUAL_MAP = {
    "원텍": {
        "stock_code": "336570", 
        "corp_code": "01407909",  # WON TECH CO.,Ltd. in DART
        "dart_name": None
    }
}

class StockAnalyzer:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.cache = AnalysisCache()

    def analyze_company(self, company_name: str) -> Dict[str, Any]:
        """
        Analyze a company by name.
        Returns a dictionary with audit report, R&D analysis, and news analysis.
        """
        self.logger.info(f"Analyzing {company_name}")
        
        # Connect to APIs
        dart = DartAPI(os.getenv("DART_API_KEY"))
        naver = NaverAPI(os.getenv("NAVER_CLIENT_ID"), os.getenv("NAVER_CLIENT_SECRET"))
        gemini = GeminiClient(os.getenv("GEMINI_API_KEY"))
        
        # 1. DART Data - Check manual mapping first
        corp_code = None
        stock_code = None
        
        # Check if company is in manual mapping
        if company_name in COMPANY_MANUAL_MAP:
            manual_entry = COMPANY_MANUAL_MAP[company_name]
            stock_code = manual_entry.get("stock_code")
            corp_code = manual_entry.get("corp_code")  # Use corp_code directly if provided
            dart_lookup_name = manual_entry.get("dart_name")
            
            # If corp_code not in manual map, try to get it using DART name
            if not corp_code and dart_lookup_name:
                corp_info = dart.get_corp_code(dart_lookup_name)
                if corp_info:
                    corp_code = corp_info.get('corp_code') if isinstance(corp_info, dict) else corp_info
        else:
            # Normal DART lookup
            corp_info = dart.get_corp_code(company_name)
            if isinstance(corp_info, str):
                corp_code = corp_info
                stock_code = None
            else:
                corp_code = corp_info.get('corp_code') if corp_info else None
                stock_code = corp_info.get('stock_code') if corp_info else None
        
        report_data = {
            "title": "Report Not Found",
            "date": "-",
            "content": "No recent report available or company code matching failed.",
            "financials": {"revenue": "N/A", "profit": "N/A"}
        }
        prior_report_data = {
            "title": "Prior Report Not Found",
            "date": "-",
            "financials": {"revenue": "N/A", "profit": "N/A"}
        }
        
        corp_code_found = False
        
        if corp_code:
            corp_code_found = True
            reports = dart.get_disclosure_list(corp_code, bgn_de="20230101")
            
            # Find Latest Quarterly Report (target)
            target_report = None
            target_index = -1
            
            if reports:
                for i, r in enumerate(reports):
                    if "분기보고서" in r.get('report_nm', ''):
                        target_report = r
                        target_index = i
                        break
                
                if not target_report:
                    target_report = reports[0]
                    target_index = 0
            
            if target_report:
                # 1.1 Process Latest Report
                link = dart.get_document_content(target_report['rcept_no'])
                report_codes = dart.parse_report_code(target_report.get('report_nm', ''))
                
                financials = {"revenue": "N/A", "profit": "N/A"}
                if report_codes:
                    financials = dart.get_financials(corp_code, report_codes['year'], report_codes['code'])
                
                report_data = {
                    "title": target_report.get('report_nm', 'Unknown Report'),
                    "date": target_report.get('rcept_dt', '-'),
                    "content": f"View full report at: {link}",
                    "financials": financials
                }
                
                # 1.2 Process Prior Report
                prior_report = None
                for i in range(target_index + 1, len(reports)):
                    r_name = reports[i].get('report_nm', '')
                    if any(x in r_name for x in ["분기보고서", "반기보고서", "사업보고서"]):
                        prior_report = reports[i]
                        break
                
                if prior_report:
                    prior_codes = dart.parse_report_code(prior_report.get('report_nm', ''))
                    prior_financials = {"revenue": "N/A", "profit": "N/A"}
                    if prior_codes:
                        prior_financials = dart.get_financials(corp_code, prior_codes['year'], prior_codes['code'])
                    
                    prior_report_data = {
                        "title": prior_report.get('report_nm', 'Unknown Report'),
                        "date": prior_report.get('rcept_dt', '-'),
                        "financials": prior_financials
                    }
        else:
            self.logger.warning(f"Corporate code not found for {company_name}")

        # 2. Market Data (FinanceDataReader)
        market_data = {"price": "N/A", "change": "N/A", "market_cap": "N/A", "code": stock_code, "market_type": None}
        if stock_code:
            try:
                import FinanceDataReader as fdr
                # Fetch latest price
                df = fdr.DataReader(stock_code)
                if not df.empty:
                    latest = df.iloc[-1]
                    price = int(latest['Close'])
                    
                    # Calculate change from previous close
                    diff = 0
                    if len(df) > 1:
                        prev = df.iloc[-2]['Close']
                        diff = ((price - prev) / prev) * 100
                    
                    # Formatting
                    market_data['price'] = f"{price:,}"
                    market_data['change'] = diff # Keep as number for frontend styling
                    
                    # Market Cap (Using StockListing for Snapshot)
                    stocks = fdr.StockListing('KRX') # This downloads a file
                    row = stocks[stocks['Code'] == stock_code]
                    if not row.empty:
                        mcap = row.iloc[0]['Marcap']
                        market_type = row.iloc[0]['Market'] # KOSPI, KOSDAQ, KONEX
                        market_data['market_type'] = market_type
                        
                        # Format trillion/billion
                        if mcap >= 1000000000000:
                            market_data['market_cap'] = f"{mcap / 1000000000000:.1f}조"
                        else:
                            market_data['market_cap'] = f"{mcap / 100000000:.0f}억"
            except Exception as e:
                self.logger.error(f"FDR Error: {e}")

        # 3. Naver News Analysis
        news_data = naver.search_news(f"{company_name}", display=5)
        items = news_data.get('items', [])
        headlines = []
        for item in items:
            title = item['title'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"')
            pub_date = item.get('pubDate', '')
            link = item.get('link', '')
            headlines.append({"title": title, "date": pub_date, "link": link})

        # 4. Gemini Comparative Analysis & Summary (with Caching)
        gemini_analysis_ko = "분석 대기 중..."
        gemini_analysis_en = "Analysis pending..."
        company_summary = ""
        
        if corp_code_found and report_data['title'] != "Report Not Found":
            # Try to get from cache first
            cached = self.cache.get_cached_analysis(company_name, report_data['date'])
            
            if cached:
                # Use cached analysis
                self.logger.info(f"Using cached analysis for {company_name}")
                gemini_analysis_ko = cached['gemini_ko']
                gemini_analysis_en = cached['gemini_en']
                company_summary = cached['summary']
            else:
                # Generate new analysis
                self.logger.info(f"Generating new Gemini analysis for {company_name}")
                gemini_result = gemini.generate_comparison_analysis(company_name, report_data, prior_report_data)
                gemini_analysis_ko = gemini_result.get('ko', '분석 실패')
                gemini_analysis_en = gemini_result.get('en', 'Analysis failed')
                company_summary = gemini_result.get('summary', '')
                
                # Save to cache (only if analysis succeeded)
                if gemini_analysis_ko != '분석 실패' and gemini_analysis_ko != '분석 생성 실패':
                    self.cache.save_analysis(
                        company_name=company_name,
                        report_date=report_data['date'],
                        report_title=report_data['title'],
                        gemini_ko=gemini_analysis_ko,
                        gemini_en=gemini_analysis_en,
                        summary=company_summary
                    )
                
                # Fallback summary if Gemini fails
                if not company_summary:
                    company_summary = f"{company_name}의 재무 및 사업 정보를 분석 중입니다."
        elif not corp_code_found:
             gemini_analysis_ko = "분석 불가: 기업 코드를 찾을 수 없습니다."
             gemini_analysis_en = "Analysis unavailable."
             company_summary = f"{company_name} - 기업 코드를 찾을 수 없습니다 (상장 확인 필요)."
        else:
             gemini_analysis_ko = "분석 불가: 보고서 데이터가 부족합니다."
             gemini_analysis_en = "Analysis unavailable."
             company_summary = f"{company_name}의 보고서 데이터가 부족합니다."

        return {
            "company": {
                "name": company_name, 
                "code": stock_code if stock_code else (corp_code if corp_code else "UNKNOWN"),
                "stock_code": stock_code
            },
            "market_data": market_data,
            "company_summary": company_summary,
            "audit_report": report_data,
            "prior_report": prior_report_data,
            "gemini_analysis": gemini_analysis_ko,
            "gemini_analysis_en": gemini_analysis_en,
            "rd_analysis": {
                "sections_found": 1 if corp_code_found else 0,
                "keywords": ["R&D", "임상", "연구", "개발", "신약", "특허"],
                "patents": []
            },
            "news_analysis": {
                "total_articles": len(headlines),
                "recent_headlines": headlines,
                "sentiments": "Neutral" 
            },
            "financial_history": self.get_financial_history(corp_code, company_name) if corp_code_found else {}
        }

    def close(self):
        pass

    def get_financial_history(self, corp_code: str, company_name: str) -> Dict[str, Any]:
        """
        Fetch 4-year financial history (2023-2026) with quarterly and annual reports.
        Returns data structured by year with revenue, profit, net income, and report links.
        """
        dart = DartAPI(os.getenv("DART_API_KEY"))
        
        # Fetch all reports from 2023-01-01
        reports = dart.get_disclosure_list(corp_code, bgn_de="20230101")
        
        # Initialize structure for 4 years
        history = {
            "2026": self._init_year_data(),
            "2025": self._init_year_data(),
            "2024": self._init_year_data(),
            "2023": self._init_year_data()
        }
        
        # Process each report
        for report in reports:
            report_nm = report.get('report_nm', '')
            rcept_no = report.get('rcept_no', '')
            
            # Parse year and quarter
            meta = dart.parse_report_code(report_nm)
            if not meta:
                continue
                
            year = meta['year']
            if year not in history:
                continue
            
            # Determine report type
            if "사업보고서" in report_nm or "감사보고서" in report_nm:
                history[year]['annual_report'] = {
                    "title": report_nm,
                    "link": f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}"
                }
                # Fetch financials for annual report
                financials = dart.get_financials(corp_code, year, "11011")
                if financials and financials.get('revenue') != '-':
                    history[year]['revenue'] = financials.get('revenue', '-')
                    history[year]['operating_profit'] = financials.get('profit', '-')
                    history[year]['rd_cost'] = financials.get('rd_cost', '-')
                    history[year]['data_type'] = 'annual'
                    
            elif "분기보고서" in report_nm:
                quarter_map = {"11013": "Q1", "11012": "Q2", "11014": "Q3"}
                quarter = quarter_map.get(meta['code'])
                if quarter:
                    history[year][quarter] = {
                        "title": report_nm,
                        "link": f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}"
                    }
                    # Fetch financials for quarterly report - use the latest quarter's data for year totals
                    # Only update if we don't have annual data yet
                    if history[year]['revenue'] == 'N/A':
                        financials = dart.get_financials(corp_code, year, meta['code'])
                        if financials and financials.get('revenue') != '-':
                            history[year]['revenue'] = financials.get('revenue', '-')
                            history[year]['operating_profit'] = financials.get('profit', '-')
                            history[year]['rd_cost'] = financials.get('rd_cost', '-')
                            # Mark as YTD (year-to-date) cumulative data
                            history[year]['data_type'] = f'ytd_{quarter.lower()}'  # e.g., 'ytd_q3'
                            
            elif "반기보고서" in report_nm:
                history[year]['Q2'] = {
                    "title": report_nm,
                    "link": f"http://dart.fss.or.kr/dsaf001/main.do?rcpNo={rcept_no}"
                }
                # Fetch financials for semi-annual report
                if history[year]['revenue'] == 'N/A':
                    financials = dart.get_financials(corp_code, year, "11012")
                    if financials and financials.get('revenue') != '-':
                        history[year]['revenue'] = financials.get('revenue', '-')
                        history[year]['operating_profit'] = financials.get('profit', '-')
                        history[year]['rd_cost'] = financials.get('rd_cost', '-')
                        history[year]['data_type'] = 'ytd_q2'  # Semi-annual = H1 = Q1+Q2
        
        return history
    
    def _init_year_data(self) -> Dict[str, Any]:
        """Initialize empty year data structure"""
        return {
            "revenue": "N/A",
            "operating_profit": "N/A",
            "rd_cost": "N/A",
            "data_type": None,  # 'annual' or 'ytd_qX' (e.g., 'ytd_q3' for Q3 cumulative)
            "annual_report": None,
            "Q1": None,
            "Q2": None,
            "Q3": None,
            "Q4": None
        }
