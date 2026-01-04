
import json
import os
from supabase import create_client

# [1] Load Keywords & Categories (SSOT)
shared_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_shared')
keywords_path = os.path.join(shared_dir, 'keywords.json')

with open(keywords_path, 'r', encoding='utf-8') as f:
    CATEGORIES_CONFIG = json.load(f).get('categories', [])

def determine_category(title, description, search_keyword):
    content = f"{title or ''} {search_keyword or ''} {description or ''}"
    best_category = "Corporate News"
    highest_score = 0
    category_scores = {}
    
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
            if search_keyword == k: score += 100
            if title and k in title: score += 50
            if description and k in description: score += 10
            
        if is_corporate and is_multi_company:
            score += 150
            
        category_scores[label] = score
        if score > highest_score:
            highest_score = score
            best_category = label
            
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

# [2] Supabase Setup
SUPABASE_URL = "https://jwkdxygcpfdmavxcbcfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4NDY2NywiZXhwIjoyMDgyMDYwNjY3fQ.wpTvHzqa2yewcmBDWx-XURlMssAgOLQNr5m626R4_vo"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def backfill_supabase():
    print("🚀 DB 카테고리 전수 업데이트 시작 (Backfill)...")
    
    # 1. Fetch matches
    result = supabase.table('articles').select('id, title, description, keyword').execute()
    articles = result.data
    total = len(articles)
    print(f"   총 {total}개 기사 대상")
    
    count = 0
    for art in articles:
        cat = determine_category(art.get('title'), art.get('description'), art.get('keyword'))
        
        # 2. Update each
        try:
            supabase.table('articles').update({'category': cat}).eq('id', art['id']).execute()
            count += 1
            if count % 100 == 0:
                print(f"   {count}/{total} 완료...")
        except Exception as e:
            print(f"   ❌ Error updating ID {art['id']}: {e}")

    print(f"\n✅ 완료! {count}개 기사의 카테고리가 DB에 업데이트되었습니다.")

if __name__ == "__main__":
    backfill_supabase()
