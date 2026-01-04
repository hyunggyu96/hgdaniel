"""수집기 문제 진단 스크립트"""
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('collector/.env')

url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')
sb = create_client(url, key)

print("=" * 60)
print("🔍 수집기 문제 진단")
print(f"현재 시간: {datetime.now()}")
print("=" * 60)

# 1. raw_news 최근 데이터 확인
print("\n📥 [1] raw_news 테이블 - 최근 수집된 뉴스")
result = sb.table('raw_news').select('id, title, search_keyword, created_at').order('created_at', desc=True).limit(5).execute()
for r in result.data:
    print(f"  {r['created_at']} | [{r['search_keyword']}] {r['title'][:30]}...")

# 마지막 수집 시간 계산
if result.data:
    last_time_str = result.data[0]['created_at']
    last_time = datetime.fromisoformat(last_time_str.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    diff = now - last_time
    hours = diff.total_seconds() / 3600
    print(f"\n  ⏱️ 마지막 수집: {hours:.1f}시간 전")

# 2. articles 최근 데이터 확인
print("\n📊 [2] articles 테이블 - 최근 분석된 뉴스")
result = sb.table('articles').select('id, title, category, created_at').order('created_at', desc=True).limit(5).execute()
for r in result.data:
    cat = r.get('category', 'N/A')
    print(f"  {r['created_at']} | [{cat}] {r['title'][:30]}...")

if result.data:
    last_time_str = result.data[0]['created_at']
    last_time = datetime.fromisoformat(last_time_str.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    diff = now - last_time
    hours = diff.total_seconds() / 3600
    print(f"\n  ⏱️ 마지막 분석: {hours:.1f}시간 전")

# 3. 미처리 뉴스 확인
print("\n⏳ [3] 분석 대기중인 뉴스 (status='pending')")
result = sb.table('raw_news').select('id', count='exact').eq('status', 'pending').execute()
print(f"  🔢 미분석 뉴스: {result.count}개")

# 4. 날짜별 수집 현황
print("\n📅 [4] 날짜별 수집 현황")
kst = timezone(timedelta(hours=9))
now_kst = datetime.now(kst)
today_kst = now_kst.strftime('%Y-%m-%d')
yesterday_kst = (now_kst - timedelta(days=1)).strftime('%Y-%m-%d')

# 오늘 raw_news
result = sb.table('raw_news').select('id', count='exact').gte('created_at', f'{today_kst}T00:00:00+09:00').execute()
print(f"  📥 오늘({today_kst}) raw_news: {result.count}개")

# 어제 raw_news
result = sb.table('raw_news').select('id', count='exact').gte('created_at', f'{yesterday_kst}T00:00:00+09:00').lt('created_at', f'{today_kst}T00:00:00+09:00').execute()
print(f"  📥 어제({yesterday_kst}) raw_news: {result.count}개")

# 오늘 articles
result = sb.table('articles').select('id', count='exact').gte('created_at', f'{today_kst}T00:00:00+09:00').execute()
print(f"  📊 오늘({today_kst}) articles: {result.count}개")

print("\n" + "=" * 60)
print("💡 진단 결론")
print("=" * 60)
