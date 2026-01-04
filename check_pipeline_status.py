"""파이프라인 상태 점검 스크립트"""
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

# collector 폴더의 .env 로드
load_dotenv('collector/.env')

url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

if not url or not key:
    print("❌ Supabase 환경변수 누락!")
    exit(1)

sb = create_client(url, key)

print("=" * 60)
print("📊 파이프라인 상태 점검")
print("=" * 60)

# 1. 최근 수집된 뉴스 확인
print("\n📥 [1] 최근 수집된 뉴스 (created_at 기준)")
result = sb.table('articles').select('id, title, created_at').order('created_at', desc=True).limit(5).execute()
for r in result.data:
    print(f"  {r['created_at']} | {r['title'][:30]}...")

# 2. 최근 분석된 뉴스 확인
print("\n🤖 [2] 최근 분석된 뉴스 (analyzed_at 기준)")
result = sb.table('articles').select('id, title, analyzed_at, category').order('analyzed_at', desc=True).limit(5).execute()
for r in result.data:
    analyzed = r.get('analyzed_at', 'N/A')
    category = r.get('category', 'N/A')
    print(f"  {analyzed} | [{category}] {r['title'][:25]}...")

# 3. 분석 대기중인 뉴스 수
print("\n⏳ [3] 분석 대기중인 뉴스 수")
result = sb.table('articles').select('id', count='exact').is_('analyzed_at', 'null').execute()
print(f"  🔢 미분석 뉴스: {result.count}개")

# 4. 오늘의 수집 현황
print("\n📅 [4] 오늘(KST) 수집된 뉴스 수")
today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
# KST는 UTC+9이므로 UTC 기준으로 어제 15:00부터가 오늘 00:00 KST
from datetime import timedelta
kst_today_start_utc = today_start - timedelta(hours=9)
result = sb.table('articles').select('id', count='exact').gte('created_at', kst_today_start_utc.isoformat()).execute()
print(f"  🔢 오늘 수집된 뉴스: {result.count}개")

# 5. 마지막 수집/분석 시간 계산
print("\n⏰ [5] 마지막 활동 시간")
result = sb.table('articles').select('created_at').order('created_at', desc=True).limit(1).execute()
if result.data:
    last_created = result.data[0]['created_at']
    print(f"  📥 마지막 수집: {last_created}")
    
result = sb.table('articles').select('analyzed_at').order('analyzed_at', desc=True).limit(1).execute()
if result.data and result.data[0].get('analyzed_at'):
    last_analyzed = result.data[0]['analyzed_at']
    print(f"  🤖 마지막 분석: {last_analyzed}")

print("\n" + "=" * 60)
print("✅ 점검 완료")
print("=" * 60)
