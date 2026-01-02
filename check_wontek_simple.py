from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('collector/.env')
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

res = sb.table('articles').select('*').ilike('title', '%다음은 제모 레이저%').execute()

if res.data:
    article = res.data[0]
    print("Title:", article['title'])
    print("Keyword:", article['keyword'])
    print("Main Keywords:", article['main_keywords'])
else:
    print("No article found")
