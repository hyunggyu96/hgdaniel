#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""잘못 분류 가능성이 있는 기사 탐지"""

from supabase import create_client
import os
from dotenv import load_dotenv
import json

load_dotenv('collector/.env')
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# keywords.json 로드
with open('_shared/keywords.json', 'r', encoding='utf-8') as f:
    keywords_data = json.load(f)

# 카테고리별 키워드 맵 생성
category_map = {}
for cat in keywords_data['categories']:
    for kw in cat['keywords']:
        category_map[kw] = cat['label']

print("=" * 80)
print("🔍 잘못 분류 가능성 있는 기사 탐지")
print("=" * 80)

# 최근 100개 기사 조회
res = supabase.table('articles')\
    .select('id, title, keyword, main_keywords')\
    .order('published_at', desc=True)\
    .limit(100)\
    .execute()

suspicious = []

for article in res.data:
    keyword = article['keyword']
    main_keywords = article['main_keywords'] or []
    title = article['title']
    
    # keyword가 main_keywords에 없는 경우 (의심스러움)
    if keyword not in main_keywords and keyword:
        # keyword의 카테고리
        keyword_cat = category_map.get(keyword, 'Unknown')
        
        # main_keywords의 카테고리들
        main_cats = [category_map.get(k, 'Unknown') for k in main_keywords if k in category_map]
        
        # 카테고리가 다른 경우
        if main_cats and keyword_cat not in main_cats:
            suspicious.append({
                'id': article['id'],
                'title': title[:60],
                'keyword': keyword,
                'keyword_cat': keyword_cat,
                'main_keywords': main_keywords[:3],
                'main_cats': list(set(main_cats))
            })

print(f"\n발견된 의심 기사: {len(suspicious)}개\n")

for i, item in enumerate(suspicious[:10], 1):
    print(f"[{i}] ID: {item['id']}")
    print(f"    제목: {item['title']}...")
    print(f"    keyword: {item['keyword']} ({item['keyword_cat']})")
    print(f"    main_keywords: {item['main_keywords']} ({item['main_cats']})")
    print(f"    👉 분류 불일치 가능성!")
    print()

if len(suspicious) > 10:
    print(f"... 외 {len(suspicious) - 10}개 더")

print("=" * 80)
