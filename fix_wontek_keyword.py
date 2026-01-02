#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""원텍 레이저 기사 keyword 필드 수정"""

from supabase import create_client
import os
from dotenv import load_dotenv

# Load environment
load_dotenv('collector/.env')

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

print("=" * 80)
print("🔧 원텍 레이저 기사 keyword 필드 수정")
print("=" * 80)

# 1. 현재 상태 확인
print("\n[수정 전 상태]")
res = supabase.table('articles')\
    .select('id, title, keyword, main_keywords')\
    .ilike('title', '%원텍%레이저%')\
    .execute()

for article in res.data:
    print(f"ID: {article['id']}")
    print(f"제목: {article['title'][:50]}...")
    print(f"현재 keyword: {article['keyword']}")
    print(f"main_keywords: {article['main_keywords']}")
    print()

# 2. 수정 실행
print("\n[수정 실행]")
for article in res.data:
    if '레이저' in article['title'] and article['keyword'] != '레이저':
        print(f"✏️ ID {article['id']} 수정 중...")
        print(f"   {article['keyword']} → 레이저")
        
        # keyword 필드 업데이트
        update_res = supabase.table('articles')\
            .update({'keyword': '레이저'})\
            .eq('id', article['id'])\
            .execute()
        
        print(f"   ✅ 수정 완료!")

# 3. 수정 후 상태 확인
print("\n[수정 후 상태]")
res_after = supabase.table('articles')\
    .select('id, title, keyword, main_keywords')\
    .ilike('title', '%원텍%레이저%')\
    .execute()

for article in res_after.data:
    print(f"ID: {article['id']}")
    print(f"제목: {article['title'][:50]}...")
    print(f"수정된 keyword: {article['keyword']}")
    print()

print("=" * 80)
print("✅ 작업 완료! 웹사이트를 새로고침하면 Machines 카테고리로 표시됩니다.")
print("=" * 80)
