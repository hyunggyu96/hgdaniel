#!/usr/bin/env python3
"""
어제(1월 6일) 이후 수집된 뉴스 중 노이즈 키워드가 포함된 기사를 숨김 처리
- Supabase articles 테이블에서 해당 기사의 hidden 필드를 true로 설정
- 또는 삭제 (--delete 옵션)
"""
import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), 'collector', '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 노이즈 키워드 목록 (processor.py의 BAD_KEYWORDS와 동일)
NOISE_KEYWORDS = [
    # 리워드 앱
    "캐시워크", "캐시닥", "용돈퀴즈", "돈버는퀴즈", "정답", "퀴즈",
    # 자동차 필러
    "A-필러", "B-필러", "C-필러", "A필러", "B필러", "C필러", "D필러",
    "필러투필러", "Pillar", "패스트백",
    # 자동차 브랜드/키워드
    "신차", "제네시스", "SUV", "GV90", "1열", "2열",
    "디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아",
    "BMW", "MINI", "쿠퍼", "LG디스플레이", "삼성디스플레이",
    "LGD", "토요타", "코롤라", "GR ", "렉서스", "혼다",
    # 건설장비/증시
    "캐터필러", "캐피터필러", "캐터필라", "Caterpillar", "마이크론", "미 증시",
    # 세금/조세/금융
    "OECD최저세", "글로벌최저한세", "글로벌 최저한세", "조세회피", "미 재무부", "재무부 합의",
    "JP모건", "JP모간", "헬스케어 집결", "코스피", "코스닥", "증시", "주가지수",
    "기업 면제", "적용 면제", "145개국", "150개국",
    # CEO/전시회
    "[CES", "CES 2026]", "CES2026", "CES 2026",
    # NBA/농구 (2026-01-21)
    "NBA", "농구", "무릎 부상", "전체 9순위",
    "GSW", "커리", "시즌아웃", "버틀러", "트레이드",
]

def find_noise_articles(since_date: str):
    """노이즈 키워드가 포함된 기사 찾기"""
    print(f"📅 {since_date} 이후 기사 검색 중...")
    
    # 해당 날짜 이후 기사 가져오기
    result = supabase.table("articles").select("id, title, description, published_at").gte("published_at", since_date).execute()
    articles = result.data
    print(f"📰 총 {len(articles)}개 기사 검색됨")
    
    noise_articles = []
    for art in articles:
        title = art.get('title', '') or ''
        desc = art.get('description', '') or ''
        full_text = f"{title} {desc}"
        
        for keyword in NOISE_KEYWORDS:
            if keyword in full_text:
                noise_articles.append({
                    'id': art['id'],
                    'title': title[:50],
                    'matched_keyword': keyword,
                    'published_at': art.get('published_at', '')
                })
                break  # 하나만 매칭되면 충분
    
    return noise_articles

def mark_as_noise(article_ids: list):
    """기사를 NOISE 카테고리로 변경 (숨김 처리)"""
    for aid in article_ids:
        try:
            supabase.table("articles").update({"category": "NOISE"}).eq("id", aid).execute()
            print(f"  ✅ Marked as NOISE: {aid}")
        except Exception as e:
            print(f"  ❌ Error marking {aid}: {e}")

def delete_articles(article_ids: list):
    """기사 삭제"""
    for aid in article_ids:
        try:
            supabase.table("articles").delete().eq("id", aid).execute()
            print(f"  🗑️ Deleted: {aid}")
        except Exception as e:
            print(f"  ❌ Error deleting {aid}: {e}")

def main():
    # 어제 날짜 (KST 기준)
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    print("=" * 60)
    print("🧹 노이즈 기사 정리 스크립트")
    print("=" * 60)
    
    # 노이즈 기사 찾기
    noise_articles = find_noise_articles(yesterday)
    
    if not noise_articles:
        print("✅ 노이즈 기사가 없습니다!")
        return
    
    print(f"\n🚨 {len(noise_articles)}개 노이즈 기사 발견:")
    print("-" * 60)
    for art in noise_articles:
        print(f"  [{art['matched_keyword']}] {art['title']}...")
    print("-" * 60)
    
    # 삭제 여부 확인
    delete_mode = "--delete" in sys.argv
    
    confirm_mode = "--confirm" in sys.argv
    
    if confirm_mode:
        print("\n🏷️ NOISE 카테고리로 변경 중...")
        article_ids = [a['id'] for a in noise_articles]
        mark_as_noise(article_ids)
        print(f"\n✅ {len(article_ids)}개 기사 NOISE 처리 완료!")
    else:
        print("\n⚠️ 위 기사들이 NOISE 카테고리로 변경됩니다.")
        print("👉 적용하려면: python hide_noise_articles.py --confirm")

if __name__ == "__main__":
    main()
