import os
import json
import datetime
from typing import Dict, Any

class RankingCache:
    """Simple file-based cache for rankings using /tmp directory"""
    
    def __init__(self, cache_file: str = "ranking_cache.json"):
        self.cache_path = os.path.join("/tmp", cache_file)
    
    def get(self) -> Dict[str, int]:
        """Get cached rankings if valid"""
        if not os.path.exists(self.cache_path):
            return None
        
        try:
            with open(self.cache_path, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
                cache_date = cache_data.get("updated_at")
                
                # Cache valid for 1 day
                if cache_date:
                    cache_time = datetime.datetime.fromisoformat(cache_date)
                    if (datetime.datetime.now() - cache_time).days < 1:
                        return cache_data.get("rankings", {})
        except Exception as e:
            print(f"Cache read error: {e}")
        
        return None
    
    def set(self, rankings: Dict[str, int]):
        """Save rankings to cache"""
        try:
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump({
                    "updated_at": datetime.datetime.now().isoformat(),
                    "rankings": rankings
                }, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Cache write error: {e}")

class AnalysisCache:
    """Cache for Gemini Analysis results to save API tokens"""

    def __init__(self, cache_file: str = "analysis_cache.json"):
        self.cache_path = os.path.join("/tmp", cache_file)

    def get_cached_analysis(self, company_name: str, report_date: str) -> Dict[str, str]:
        if not os.path.exists(self.cache_path):
            return None
            
        try:
            with open(self.cache_path, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
                
            if company_name in cache_data:
                entry = cache_data[company_name]
                # Check if report date matches. If report is new, we need new analysis
                if entry.get('report_date') == report_date:
                    return {
                        "gemini_ko": entry.get('gemini_ko'),
                        "gemini_en": entry.get('gemini_en'),
                        "summary": entry.get('summary')
                    }
        except Exception as e:
            print(f"Analysis cache read error: {e}")
            
        return None

    def save_analysis(self, company_name: str, report_date: str, report_title: str, gemini_ko: str, gemini_en: str, summary: str):
        cache_data = {}
        if os.path.exists(self.cache_path):
            try:
                with open(self.cache_path, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
            except:
                pass
        
        cache_data[company_name] = {
            "report_date": report_date,
            "report_title": report_title,
            "gemini_ko": gemini_ko,
            "gemini_en": gemini_en,
            "summary": summary,
            "updated_at": datetime.datetime.now().isoformat()
        }
        
        try:
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
             print(f"Analysis cache write error: {e}")
