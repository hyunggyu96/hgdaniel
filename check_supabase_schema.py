
import os
from supabase import create_client

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"

def add_category_column():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Try to add the column. 
    # Note: postgrest-py doesn't have a direct 'execute sql' method easily accessible,
    # but we can try to insert a dummy row with a new field, or check if it exists.
    # However, the best way to handle 'missing column' in Supabase without direct SQL access 
    # via the client is usually to inform the user to add it via the dashboard, 
    # BUT I can try to use the REST API directly or a 'rpc' if available.
    
    print("Trying to update existing articles to see if 'category' column exists...")
    try:
        # Try to select the column to see if it exists
        supabase.table('articles').select('category').limit(1).execute()
        print("✅ Column 'category' already exists in Supabase.")
    except Exception as e:
        if "column \"category\" does not exist" in str(e).lower():
            print("❌ Column 'category' does not exist.")
            print("Please add the 'category' column (text type) to the 'articles' table in Supabase dashboard.")
            print("I will proceed with the code changes, but Supabase saves might fail until the column is added.")
        else:
            print(f"⚠️ Error checking column: {e}")

if __name__ == "__main__":
    add_category_column()
