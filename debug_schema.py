"""Supabase articles 테이블 스키마(컬럼) 확인"""
import os
from supabase import create_client

SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 최신 1개 데이터를 가져와서 키값들을 확인
result = client.table('articles').select('*').limit(1).execute()

if result.data:
    print("✅ articles 테이블 컬럼 목록:")
    for key in result.data[0].keys():
        print(f"  - {key}: {type(result.data[0][key]).__name__}")
    print("\n[샘플 데이터]")
    print(result.data[0])
else:
    print("❌ 데이터가 없습니다.")
