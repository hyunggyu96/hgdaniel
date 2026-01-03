#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""태블릿 processor.py 수정 후 검증 스크립트"""

from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv('collector/.env')
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

print("=" * 80)
print("✅ 태블릿 processor.py 수정 검증")
print("=" * 80)

# 최근 1시간 이내 기사 확인
one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()

res = supabase.table('articles')\
    .select('id, title, keyword, main_keywords, published_at')\
    .gte('published_at', one_hour_ago)\
    .order('published_at', desc=True)\
    .limit(10)\
    .execute()

articles = res.data

print(f"\n📊 최근 1시간 처리된 기사: {len(articles)}개\n")

if not articles:
    print("⚠️ 아직 새로 처리된 기사가 없습니다.")
    print("💡 5-10분 후 다시 확인해주세요.")
else:
    for idx, article in enumerate(articles, 1):
        print(f"[{idx}] {article['title'][:50]}...")
        print(f"    keyword: {article['keyword']}")
        print(f"    main_keywords: {article['main_keywords']}")
        print(f"    published_at: {article['published_at']}")
        print()

    print("\n✅ 작동 확인 포인트:")
    print("1. keyword 필드가 AI 분석 결과를 반영하는지 확인")
    print("2. '레이저' 기사는 keyword가 '레이저'여야 함")
    print("3. '필러' 기사는 keyword가 '필러'여야 함")
    print("4. 문학/출판 뉴스가 필터링되는지 확인")

print("\n" + "=" * 80)
