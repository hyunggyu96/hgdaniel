import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('collector/.env')
load_dotenv('.env.local')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 카테고리 설정 (api/trends/route.ts와 동일해야 함)
# constants.ts 내용을 모를 경우를 대비해 하드코딩하지 않고 추론하지만, 
# 여기서는 일반적인 키워드 매칭 로직 테스트
CATEGORIES_CONFIG = [
    {"label": "Filler", "keywords": ["필러", "히알루론산", "HA필러"]},
    {"label": "Botulinum Toxin", "keywords": ["톡신", "보톡스", "이노톡스", "메디톡신"]},
    # ...
]

print("🔍 DB 최신 데이터 5개 조회 중...")
# 오늘 날짜 근처 데이터 조회
res = supabase.table('articles').select('*').order('published_at', desc=True).limit(5).execute()
articles = res.data

if not articles:
    print("❌ 데이터가 없습니다! DB가 비어있나요?")
    exit()

print(f"📊 총 {len(articles)}개 데이터 확인\n")

for i, art in enumerate(articles):
    print(f"[{i+1}] {art.get('title')[:30]}...")
    print(f"    - Date: {art.get('published_at')}")
    print(f"    - Keyword (DB): '{art.get('keyword')}'")
    
    # 매칭 테스트
    matched = False
    for cat in CATEGORIES_CONFIG:
        if art.get('keyword') in cat['keywords']:
            print(f"    ✅ Match Category: {cat['label']} (By Exact Keyword)")
            matched = True
            break
        # 제목 매칭 등 API 로직 흉내
        elif any(k in art.get('title', '') for k in cat['keywords']):
             print(f"    ⚠️ Title Match: {cat['label']} (API might count this, score=50)")
             matched = True
             break
             
    if not matched:
        print("    ❌ NO MATCH! (이 데이터는 차트에서 0으로 집계됨)")
        
print("\n--- 분석 종료 ---")
