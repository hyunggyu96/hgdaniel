# -*- coding: utf-8 -*-
"""
Report Generator V1.0:
- Queries Supabase for articles added in the last 4 hours.
- Generates a text report for email delivery.
"""

import os
import datetime
from supabase import create_client
from dotenv import load_dotenv

# Load env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_report():
    print("📊 Generating 4-hour update report...")
    
    # Calculate time window (4 hours ago in UTC)
    now = datetime.datetime.utcnow()
    four_hours_ago = now - datetime.timedelta(hours=4)
    time_str = four_hours_ago.isoformat()
    
    try:
        # Query articles added in the last 4 hours
        res = supabase.table("articles").select("*").gt("created_at", time_str).execute()
        articles = res.data
        
        count = len(articles)
        
        # Format the report
        report = []
        report.append(f"🔔 [News Dashboard] Update Report ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
        report.append(f"--------------------------------------------------")
        report.append(f"✅ Total New Articles: {count}")
        report.append(f"--------------------------------------------------\n")
        
        if count > 0:
            # Group by keyword
            keyword_stats = {}
            high_impact = []
            
            for art in articles:
                kw = art.get('keyword', 'Unknown')
                keyword_stats[kw] = keyword_stats.get(kw, 0) + 1
                
                # Check impact (heuristically from analysis if stored, otherwise skip or check description)
                # Note: In our current processor, we store analysis in Supabase 'articles'
                # Let's list some high-impact titles if they exist
                # (Assuming impact_level is a field we started storing)
                if art.get('impact_level', 0) >= 4:
                    high_impact.append(art['title'])
            
            report.append("📈 Keyword Summary:")
            for kw, kw_count in sorted(keyword_stats.items(), key=lambda x: x[1], reverse=True):
                report.append(f" - {kw}: {kw_count} items")
            
            if high_impact:
                report.append("\n🔥 High Impact News:")
                for title in high_impact[:5]: # Max 5 for brevity
                    report.append(f" - {title}")
        else:
            report.append("💤 No new updates in the last 4 hours.")
            
        report.append(f"\n🔗 View Dashboard: https://hgdaniel.vercel.app")
        
        report_text = "\n".join(report)
        
        # Save to file for GitHub Action to read
        with open("report_body.txt", "w", encoding="utf-8") as f:
            f.write(report_text)
            
        print(f"✅ Report generated successfully ({count} items).")
        return report_text

    except Exception as e:
        print(f"❌ Error generating report: {e}")
        return None

if __name__ == "__main__":
    generate_report()
