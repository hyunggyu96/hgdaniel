#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""원텍 레이저 기사 분류 진단"""

from supabase import create_client
import os
from dotenv import load_dotenv
import json

# Load environment
load_dotenv('collector/.env')

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# 원텍 기사 조회
res = supabase.table('articles')\
    .select('title, keyword, main_keywords, description, published_at')\
    .ilike('title', '%원텍%레이저%')\
    .limit(3)\
    .execute()

print("=" * 80)
print("🔍 원텍 레이저 기사 진단")
print("=" * 80)

for idx, article in enumerate(res.data, 1):
    print(f"\n[기사 #{idx}]")
    print(f"제목: {article['title']}")
    print(f"발행일: {article['published_at']}")
    print(f"DB keyword 필드: {article['keyword']}")
    print(f"DB main_keywords 필드: {article['main_keywords']}")
    print(f"설명 (앞 150자): {article['description'][:150]}...")
    print("-" * 80)

print("\n📋 keywords.json 확인")
with open('_shared/keywords.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    for cat in data['categories']:
        if '원텍' in cat['keywords'] or '레이저' in cat['keywords']:
            print(f"✅ {cat['label']}: 원텍={('원텍' in cat['keywords'])}, 레이저={('레이저' in cat['keywords'])}")
