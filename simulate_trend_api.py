import os
import json
from datetime import datetime, timedelta
import pytz
from supabase import create_client
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv('collector/.env')
load_dotenv('.env.local')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 웹페이지와 동일한 키워드 설정 (축약)
CATEGORIES_CONFIG = [
    {"label": "Filler", "keywords": ["필러", "히알루론산", "벨로테로", "쥬비덤", "채움"]},
    {"label": "Botulinum Toxin", "keywords": ["톡신", "보톡스", "휴젤", "메디톡스", "나보타", "제오민"]},
    {"label": "Corporate News", "keywords": ["휴젤", "메디톡스", "대웅제약", "종근당", "동국제약"]},
    # ... 나머지는 생략해도 됨 (주요 키워드만 테스트)
]

def simulate_api():
    print("🧪 트렌드 API 로직 시뮬레이션 시작...")

    # 1. 날짜 버킷 생성 (API와 동일 로직)
    rangeDays = 7
    trend_map = {}
    kst = pytz.timezone('Asia/Seoul')
    now_utc = datetime.utcnow() # Vercel Server Time
    now_kst = now_utc.astimezone(kst) # KST 변환? (JS toLocaleDateString 흉내)
    
    # JS: new Date() -> toLocaleDateString('en-CA', {timeZone: 'Asia/Seoul'})
    # 파이썬으로 흉내내기:
    labels = []
    
    # API 로직: for loop rangeDays
    # 주의: API의 new Date()는 실행 시점 기준.
    # 오늘(1/2 0시 가까움)이면 1/2로 잡히냐 1/1로 잡히냐가 관건.
    
    print(f"🕒 현재 시각(UTC): {now_utc}")
    # 현재 API 로직 흉내
    for i in range(rangeDays - 1, -1, -1):
        d = now_utc - timedelta(days=i)
        # KST로 변환 후 날짜 문자열 추출
        d_kst = d.replace(tzinfo=pytz.utc).astimezone(kst)
        date_str = d_kst.strftime("%Y-%m-%d")
        labels.append(date_str)
        trend_map[date_str] = {c['label']: 0 for c in CATEGORIES_CONFIG}
        
    print(f"📅 생성된 날짜 버킷: {labels}")

    # 2. DB 데이터 가져오기 (최근 2일치만)
    start_date = (datetime.utcnow() - timedelta(days=2)).isoformat()
    res = supabase.table('articles').select('*').gte('published_at', start_date).order('published_at', desc=True).limit(50).execute()
    articles = res.data
    
    print(f"📥 가져온 기사 수: {len(articles)}")

    # 3. 로직 테스트
    hit_count = 0
    miss_count = 0
    
    for art in articles:
        # 날짜 파싱
        # DB: "2026-01-01T22:42:00+00:00" or similar
        try:
            pub_dt = datetime.fromisoformat(art['published_at'].replace('Z', '+00:00'))
            pub_kst = pub_dt.astimezone(kst)
            date_key = pub_kst.strftime("%Y-%m-%d")
        except:
            continue
            
        if date_key not in trend_map:
            # 범위를 벗어난 날짜 (과거 7일 아니면 미래??)
            # print(f"⚠️ 날짜 범위 밖: {date_key}")
            continue

        # 분류 로직 (완화된 로직 적용)
        best_cat = None
        max_score = 0
        
        full_text = f"{art.get('title', '')} {art.get('description', '')} {art.get('keyword', '')}"
        
        for config in CATEGORIES_CONFIG:
            score = 0
            # Includes 검사 (내가 방금 고친 로직)
            if any(k in full_text for k in config['keywords']):
                score += 100
            
            if score > max_score:
                max_score = score
                best_cat = config['label']
        
        if best_cat:
            trend_map[date_key][best_cat] += 1
            hit_count += 1
            # print(f"  ✅ [{date_key}] {best_cat} : {art.get('title')[:10]}")
        else:
            miss_count += 1
            # print(f"  ❌ 분류 실패: {art.get('title')[:10]}")

    print("\n📊 최종 집계 결과 (Today & Yesterday):")
    for date in labels[-2:]:
        print(f"  [{date}] {trend_map.get(date)}")
        
    if hit_count == 0:
        print("\n🚨 비상! 분류된 기사가 0건입니다. 로직이 완전히 틀렸습니다.")
    else:
        print(f"\n✅ 성공! 총 {hit_count}건 분류됨. (실패 {miss_count}건)")

if __name__ == "__main__":
    simulate_api()
