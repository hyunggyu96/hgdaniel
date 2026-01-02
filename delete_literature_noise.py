#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""문학/출판 노이즈 삭제"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv('collector/.env')
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

print("=" * 80)
print("🗑️ 문학/출판 노이즈 삭제")
print("=" * 80)

# 탐지된 노이즈 ID 목록
ids = ['41263', '41262', '41260', '41259', '41258', '41252', '41249', '41247', '41246', '41250', '41248', '41243']

print(f"\n삭제 대상: {len(ids)}개 기사\n")

deleted_count = 0
for article_id in ids:
    try:
        # 먼저 기사 정보 조회
        res = supabase.table('articles').select('title').eq('id', article_id).execute()
        if res.data:
            title = res.data[0]['title']
            print(f"🗑️ ID {article_id}: {title[:50]}...")
            
            # 삭제
            supabase.table('articles').delete().eq('id', article_id).execute()
            deleted_count += 1
            print(f"   ✅ 삭제 완료")
        else:
            print(f"⏭️ ID {article_id}: 이미 삭제됨")
    except Exception as e:
        print(f"❌ ID {article_id}: 삭제 실패 - {e}")

print(f"\n{'=' * 80}")
print(f"✅ 총 {deleted_count}개 기사 삭제 완료")
print(f"{'=' * 80}")
