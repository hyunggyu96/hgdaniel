import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), 'collector', '.env'))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ .env 파일을 찾을 수 없거나 키가 없습니다.")
    exit(1)

supabase = create_client(url, key)

try:
    # 테스트로 category 필드가 있는 데이터를 하나 select 해봄 (실제 데이터엔 영향 없음)
    # 컬럼이 없으면 400 에러 발생
    res = supabase.table("articles").select("category").limit(1).execute()
    print("✅ 'category' 컬럼이 존재합니다!")
    print(f"Sample Data: {res.data}")
except Exception as e:
    print(f"❌ 'category' 컬럼이 없는 것 같습니다: {e}")
