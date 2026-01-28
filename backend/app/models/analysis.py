from pydantic import BaseModel
from typing import Dict, List, Optional, Any

class CompanyAnalysisRequest(BaseModel):
    company_name: str

class FinancialData(BaseModel):
    revenue: str
    operating_profit: str
    rd_cost: str
    data_type: Optional[str] = None

class ReportData(BaseModel):
    title: str
    date: str
    link: Optional[str] = None
    financials: Optional[Dict[str, str]] = None

class MarketData(BaseModel):
    price: str
    change: str
    market_cap: str
    market_type: str
    code: str

class NewsItem(BaseModel):
    title: str
    date: str
    link: str

class NewsAnalysis(BaseModel):
    recent_headlines: List[NewsItem]

class CompanyInfo(BaseModel):
    name: str
    stock_code: str

class AnalysisResponse(BaseModel):
    company: CompanyInfo
    company_summary: str
    market_data: MarketData
    financial_history: Dict[str, Any]
    audit_report: ReportData
    prior_report: ReportData
    news_analysis: NewsAnalysis
    gemini_analysis: str
    gemini_analysis_en: str
    rd_analysis: Optional[Dict[str, Any]] = None
