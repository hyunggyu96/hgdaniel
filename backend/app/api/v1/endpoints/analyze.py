from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from app.api import deps
from app.models.analysis import CompanyAnalysisRequest, AnalysisResponse, ReportData
from app.services.dart_client import DartAPI
from app.services.naver_client import NaverAPI
from app.services.llm import GeminiClient

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_company(
    request: CompanyAnalysisRequest,
    dart: DartAPI = Depends(deps.get_dart_client),
    naver: NaverAPI = Depends(deps.get_naver_client),
    gemini: GeminiClient = Depends(deps.get_gemini_client)
) -> Any:
    company_name = request.company_name
    
    # 1. Get Corp Code & Stock Code
    corp_info = dart.get_corp_code(company_name)
    stock_code = "N/A"
    corp_code_found = False
    corp_code = ""

    if corp_info:
        corp_code = corp_info['corp_code']
        stock_code = corp_info.get('stock_code', 'N/A')
        corp_code_found = True
    
    # 2. Get Report Data (Financials)
    report_data = {
        "title": "Report Not Found",
        "date": "-",
        "financials": {"revenue": "N/A", "profit": "N/A", "rd_cost": "N/A"}
    }
    prior_report_data = {
        "title": "Prior Report Not Found",
        "date": "-",
        "financials": {"revenue": "N/A", "profit": "N/A", "rd_cost": "N/A"}
    }
    financial_history = {}
    reports = []

    if corp_code_found:
        reports = dart.get_disclosure_list(corp_code)
        target_report = None
        target_idx = -1
        
        # Find latest quarterly/half/annual report
        for i, r in enumerate(reports):
            nm = r.get('report_nm', '')
            if "분기보고서" in nm or "사업보고서" in nm or "반기보고서" in nm:
                target_report = r
                target_idx = i
                break
        
        if target_report:
            codes = dart.parse_report_code(target_report.get('report_nm'))
            financials = {"revenue": "N/A", "profit": "N/A"}
            if codes:
                financials = dart.get_financials(corp_code, codes['year'], codes['code'])
            
            link = dart.get_document_content(target_report['rcept_no'])
            report_data = {
                "title": target_report.get('report_nm'),
                "date": target_report.get('rcept_dt'),
                "link": link,
                "financials": financials
            }
            
            # Process Prior Report (for comparison)
            for i in range(target_idx + 1, len(reports)):
                r = reports[i]
                nm = r.get('report_nm', '')
                if "분기보고서" in nm or "사업보고서" in nm or "반기보고서" in nm:
                    codes = dart.parse_report_code(nm)
                    fin = {"revenue": "N/A", "profit": "N/A"}
                    if codes:
                        fin = dart.get_financials(corp_code, codes['year'], codes['code'])
                    
                    prior_report_data = {
                        "title": nm,
                        "date": r.get('rcept_dt'),
                        "financials": fin
                    }
                    break
        
        # Minimal History Builders
        years = ["2023", "2024", "2025", "2026"]
        for y in years:
            financial_history[y] = {"revenue": "N/A", "operating_profit": "N/A", "rd_cost": "N/A"}
        
        # Fill available data from reports list
        if reports:
            for r in reports:
                 meta = dart.parse_report_code(r.get('report_nm', ''))
                 if meta and meta['year'] in financial_history:
                     y = meta['year']
                     # If we haven't filled this year yet or if it's an annual report (overwrite quarterly)
                     if financial_history[y]['revenue'] == 'N/A' or "사업보고서" in r.get('report_nm', ''):
                         fin = dart.get_financials(corp_code, y, meta['code'])
                         if fin['revenue'] != '-':
                             financial_history[y]['revenue'] = fin['revenue']
                             financial_history[y]['operating_profit'] = fin['profit']
                             financial_history[y]['rd_cost'] = fin['rd_cost']
                             financial_history[y]['annual_report'] = {"link": dart.get_document_content(r['rcept_no'])}
    
    # 3. Market Data (Placeholder - real data is handled by Frontend Mock currently)
    market_data = {
        "price": "N/A", 
        "change": "N/A", 
        "market_cap": "N/A", 
        "market_type": "KRX",
        "code": stock_code
    }

    # 4. News Analysis
    news_items = []
    try:
        news_res = naver.search_news(company_name, display=5)
        for item in news_res.get('items', []):
            title = item['title'].replace('<b>', '').replace('</b>', '').replace('&quot;', '"')
            news_items.append({
                "title": title,
                "date": item.get('pubDate', ''),
                "link": item.get('link', '')
            })
    except Exception as e:
        print(f"News Error: {e}")

    # 5. Gemini Analysis
    gemini_analysis_ko = "분석 대기 중..."
    gemini_analysis_en = "Analysis pending..."
    company_summary = ""
    
    if corp_code_found and report_data['title'] != "Report Not Found":
        # Note: We skipped Redis cache implementation for initial migration simplicity
        # Ideally, we restore Redis or Supabase-based caching here
        g_res = gemini.generate_comparison_analysis(company_name, report_data, prior_report_data)
        gemini_analysis_ko = g_res.get('ko')
        gemini_analysis_en = g_res.get('en')
        company_summary = g_res.get('summary')
            
    elif not corp_code_found:
         gemini_analysis_ko = "기업 정보를 찾을 수 없습니다."
         company_summary = "DART에 등록되지 않은 기업이거나 검색어 오류일 수 있습니다."

    return {
        "company": {
            "name": company_name,
            "stock_code": stock_code
        },
        "company_summary": company_summary,
        "market_data": market_data,
        "financial_history": financial_history,
        "audit_report": report_data,
        "prior_report": prior_report_data,
        "news_analysis": {
            "recent_headlines": news_items
        },
        "gemini_analysis": gemini_analysis_ko,
        "gemini_analysis_en": gemini_analysis_en,
        "rd_analysis": {
            "keywords": ["R&D", "임상", "연구", "개발"],
            "patents": []
        }
    }
