import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('collector/.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

# Get the latest analyzed article
response = supabase.table('raw_news').select("id, title").eq('analyzed', True).order('collected_at', desc=True).limit(1).execute()

if response.data:
    article = response.data[0]
    print(f"Resetting article: {article['title']}")
    # Reset to unanalyzed
    supabase.table('raw_news').update({'analyzed': False, 'ai_summary': None}).eq('id', article['id']).execute()
    print("Done! Ready for Processor.")
else:
    print("No analyzed articles found to reset.")
