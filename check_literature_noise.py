#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""문학/출판 노이즈 필터링 체크"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('collector/.env')
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

print("=" * 80)
print("🔍 문학/출판 노이즈 탐지 (바임 관련)")
print("=" * 80)

# 문학/출판 키워드로 검색
literature_keywords = ['작가', '문학', '출판', '소설', '노벨문학상', '포세', '한강']

all_noise = []

for kw in literature_keywords:
    res = supabase.table('articles')\
        .select('id, title, keyword, main_keywords, published_at')\
        .ilike('title', f'%{kw}%')\
        .order('published_at', desc=True)\
        .limit(20)\
        .execute()
    
    for article in res.data:
        # 바임이 포함되어 있는지 확인
        full_text = f"{article['title']} {article.get('keyword', '')} {article.get('main_keywords', [])}"
        if '바임' in full_text:
            all_noise.append({
                'id': article['id'],
                'title': article['title'],
                'keyword': article['keyword'],
                'main_keywords': article['main_keywords'],
                'published_at': article['published_at']
            })

# 중복 제거
seen_ids = set()
unique_noise = []
for item in all_noise:
    if item['id'] not in seen_ids:
        seen_ids.add(item['id'])
        unique_noise.append(item)

print(f"\n발견된 문학/출판 노이즈: {len(unique_noise)}개\n")

for idx, article in enumerate(unique_noise[:10], 1):
    print(f"[{idx}] ID: {article['id']}")
    print(f"    제목: {article['title'][:60]}...")
    print(f"    keyword: {article['keyword']}")
    print(f"    main_keywords: {article['main_keywords']}")
    print(f"    발행: {article['published_at'][:10]}")
    print()

if unique_noise:
    print("\n✅ 삭제 스크립트:")
    print("```python")
    ids_to_delete = [str(a['id']) for a in unique_noise]
    print(f"ids = {ids_to_delete}")
    print("for article_id in ids:")
    print("    supabase.table('articles').delete().eq('id', article_id).execute()")
    print("```")
else:
    print("\n✨ 노이즈 없음!")

print("=" * 80)
