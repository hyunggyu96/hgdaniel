import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

try:
    # 1. 존재하는 레코드 1개만 가져와서 키값(컬럼) 확인
    res = supabase.table("articles").select("*").limit(1).execute()
    if res.data:
        print("✅ Active Columns:")
        print(res.data[0].keys())
    else:
        print("⚠️ No data in articles table to check columns.")
        
except Exception as e:
    print(f"❌ Error: {e}")
