import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('collector/.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Env vars missing")
    exit()

supabase: Client = create_client(url, key)

# 대기 중인 뉴스 카운트
res = supabase.table("raw_news").select("id", count="exact").eq("status", "pending").execute()
count = res.count

print(f"--- [불시 점검] 밀린 뉴스 현황 ---")
print(f"현재 분석 대기 중(Pending): {count}개")

if count == 0:
    print("✅ 태블릿이 뉴스를 모두 처리했습니다! 깨끗합니다.")
else:
    print(f"⚠️ 태블릿이 {count}개의 뉴스를 분석하고 있습니다...")
