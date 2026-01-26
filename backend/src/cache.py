import sqlite3
import os
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List

class AnalysisCache:
    """SQLite-based cache for Gemini analysis results."""
    
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Default to data directory
            db_dir = os.path.join(os.path.dirname(__file__), "../data")
            os.makedirs(db_dir, exist_ok=True)
            db_path = os.path.join(db_dir, "analysis_cache.db")
        
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize the database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_cache (
                company_name TEXT PRIMARY KEY,
                report_date TEXT NOT NULL,
                report_title TEXT,
                gemini_ko TEXT,
                gemini_en TEXT,
                summary TEXT,
                created_at TEXT NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS news_cache (
                company_name TEXT PRIMARY KEY,
                news_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def get_cached_analysis(self, company_name: str, latest_report_date: str) -> Optional[Dict]:
        """
        Get cached analysis if:
        1. Cache exists for this company
        2. Latest report date matches cached report date
        3. Cache is still valid (report is older than 3 days)
        
        Returns None if cache miss or invalid.
        """
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT report_date, report_title, gemini_ko, gemini_en, summary, created_at
                FROM analysis_cache
                WHERE company_name = ?
            """, (company_name,))
            
            row = cursor.fetchone()
            
            if not row:
                return None
            
            cached_report_date, report_title, gemini_ko, gemini_en, summary, created_at = row
            
            # Check if report dates match
            if cached_report_date != latest_report_date:
                return None
            
            # Check if report is older than 3 days (cache is valid)
            try:
                report_dt = datetime.strptime(latest_report_date, "%Y%m%d")
                days_old = (datetime.now() - report_dt).days
                
                if days_old < 3:
                    # Report is too new, don't use cache (re-analyze)
                    return None
            except:
                # If date parsing fails, don't use cache
                return None
            
            return {
                "gemini_ko": gemini_ko,
                "gemini_en": gemini_en,
                "summary": summary,
                "report_title": report_title,
                "cached": True
            }
        except Exception as e:
            print(f"Error reading analysis cache: {e}")
            return None
        finally:
            if conn:
                conn.close()
    
    def save_analysis(self, company_name: str, report_date: str, report_title: str,
                     gemini_ko: str, gemini_en: str, summary: str):
        """Save or update analysis in cache."""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO analysis_cache 
                (company_name, report_date, report_title, gemini_ko, gemini_en, summary, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (company_name, report_date, report_title, gemini_ko, gemini_en, summary, 
                  datetime.now().isoformat()))
            
            conn.commit()
        except Exception as e:
            print(f"Error saving analysis cache: {e}")
            if conn:
                conn.rollback()
        finally:
            if conn:
                conn.close()

    def get_cached_news(self, company_name: str) -> Optional[List[Dict]]:
        """
        Get cached news if valid (less than 10 minutes old).
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT news_json, created_at FROM news_cache WHERE company_name = ?", (company_name,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
            
        news_json, created_at = row
        
        # Check validity (10 minutes)
        try:
            created_dt = datetime.fromisoformat(created_at)
            if datetime.now() - created_dt > timedelta(minutes=10):
                return None
                
            return json.loads(news_json)
        except:
            return None

    def save_news(self, company_name: str, news_data: List[Dict]):
        """Save news to cache."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        created_at = datetime.now().isoformat()
        news_json = json.dumps(news_data)
        
        cursor.execute("""
            INSERT OR REPLACE INTO news_cache (company_name, news_json, created_at)
            VALUES (?, ?, ?)
        """, (company_name, news_json, created_at))
        
        conn.commit()
        conn.close()

    def clear_cache(self, company_name: str = None):
        """Clear cache for a specific company or all companies."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if company_name:
            cursor.execute("DELETE FROM analysis_cache WHERE company_name = ?", (company_name,))
            cursor.execute("DELETE FROM news_cache WHERE company_name = ?", (company_name,))
        else:
            cursor.execute("DELETE FROM analysis_cache")
            cursor.execute("DELETE FROM news_cache")
        
        conn.commit()
        conn.close()
