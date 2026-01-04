
import os
import json
import datetime
from supabase import create_client
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv(os.path.join(os.path.dirname(__file__), 'collector', '.env'))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

# 키워드 로드
shared_dir = os.path.join(os.path.dirname(__file__), '_shared')
keywords_path = os.path.join(shared_dir, 'keywords.json')
CATEGORIES_CONFIG = []

try:
    with open(keywords_path, 'r', encoding='utf-8') as f:
        CATEGORIES_CONFIG = json.load(f).get('categories', [])
    print(f"✅ Loaded Categories: {[c['label'] for c in CATEGORIES_CONFIG]}")
except Exception as e:
    print(f"❌ Failed to load keywords: {e}")
    exit(1)

def determine_category(title, description, search_keyword):
    """processor.py와 동일한 분류 로직"""
    content = f"{title or ''} {search_keyword or ''} {description or ''}"
    best_category = "Corporate News"
    highest_score = 0
    category_scores = {}
    
    # Identify corporate keywords
    corporate_config = next((c for c in CATEGORIES_CONFIG if c['label'] == "Corporate News"), None)
    corporate_keywords = corporate_config['keywords'] if corporate_config else []
    mentioned_companies = [k for k in corporate_keywords if k in content]
    is_multi_company = len(mentioned_companies) >= 2
    
    for config in CATEGORIES_CONFIG:
        label = config['label']
        keywords = config['keywords']
        score = 0
        is_corporate = (label == "Corporate News")
        
        for k in keywords:
            if search_keyword and k in search_keyword: score += 100
            if title and k in title: score += 50
            if description and k in description: score += 10
            
        if is_corporate and is_multi_company:
            score += 150
            
        category_scores[label] = score
        if score > highest_score:
            highest_score = score
            best_category = label
            
    # 제품 우선 규칙
    if best_category == "Corporate News":
        best_product_cat = None
        max_product_score = 0
        for label, score in category_scores.items():
            if label != "Corporate News" and score > max_product_score:
                max_product_score = score
                best_product_cat = label
        if best_product_cat and max_product_score >= 50:
            best_category = best_product_cat
            
    return best_category

def backfill():
    print("🚀 Starting Backfill for recent articles...")
    
    # 최근 14일치 데이터 가져오기 (넉넉하게)
    days_ago = (datetime.datetime.now() - datetime.timedelta(days=14)).isoformat()
    
    # category가 비어있거나 '기타'인 것만? 아니면 전체 다시? 
    # 안전하게 전체 다시 계산해서 덮어씌우는 게 정확함. (Processor 로직이 바뀌었으므로)
    res = supabase.table("articles").select("*").gte("published_at", days_ago).execute()
    articles = res.data
    print(f"🔎 Found {len(articles)} articles to process.")
    
    updated_count = 0
    for article in articles:
        old_cat = article.get('category')
        new_cat = determine_category(article.get('title'), article.get('description'), article.get('keyword'))
        
        # 값이 다르거나 없으면 업데이트
        if old_cat != new_cat:
            supabase.table("articles").update({"category": new_cat}).eq("id", article['id']).execute()
            print(f"  📝 Updated: {article['title'][:20]}... [{old_cat} -> {new_cat}]")
            updated_count += 1
            
    print(f"✅ Backfill Complete. Updated {updated_count} articles.")

if __name__ == "__main__":
    backfill()
