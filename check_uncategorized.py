
import os
import asyncio
from supabase import create_client
from dotenv import load_dotenv

# Load local env
load_dotenv('collector/.env')

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

# Same config as web/src/lib/api.ts (Updated manually)
CATEGORIES_CONFIG = [
    { "label": "Filler", "keywords": ["필러", "레볼락스", "더채움", "쥬비덤", "레스틸레인", "벨로테로"] },
    { "label": "Botulinum Toxin", "keywords": ["톡신", "보톡스", "나보타", "제오민", "레티보", "코어톡스"] },
    { "label": "Collagen Stimulator", "keywords": ["PLLA", "PDLLA", "PLA", "쥬베룩", "레니스나", "스컬트라", "리프팅실", "실리프팅", "PDO"] },
    { "label": "Skinboosters", "keywords": ["PN", "PDRN", "엑소좀", "리쥬란", "스킨부스터"] },
    { "label": "Machines (EBD)", "keywords": ["HIFU", "RF", "고주파", "레이저", "울쎄라", "써마지", "슈링크", "인모드", "올리지오", "텐써마", "브이로"] },
    { "label": "Corporate Events", "keywords": ["제테마", "휴젤", "파마리서치", "종근당", "휴온스", "메디톡스", "바이오플러스", "원텍", "클래시스", "제이시스", "바임", "대웅제약", "갈더마", "멀츠", "앨러간", "시지바이오", "비엔씨"] }
]

async def check_uncategorized():
    print("🔍 Checking for uncategorized articles...")
    
    # 1. Fetch all articles (limit 1000 for check)
    res = supabase.table("articles").select("*").order("published_at", desc=True).limit(1000).execute()
    articles = res.data
    
    uncategorized = []
    
    for article in articles:
        # Check if article matches ANY category
        matched = False
        
        # Check fields: keyword (crawled), title, description
        crawled_keyword = article.get('keyword', '')
        title = article.get('title', '')
        desc = article.get('description', '')
        
        # Checking logic similar to web
        for config in CATEGORIES_CONFIG:
            for k in config['keywords']:
                if (crawled_keyword == k) or (k in title) or (k in desc):
                    matched = True
                    break
            if matched:
                break
        
        if not matched:
            uncategorized.append(f"[{article['published_at'][:10]}] {title} (MainKW: {article.get('main_keywords')})")
            
    print(f"\n📊 Result: {len(uncategorized)} uncategorized articles out of {len(articles)} checked.")
    if uncategorized:
        print("\n📝 Uncategorized List (Top 20):")
        for item in uncategorized[:20]:
            print(item)
    else:
        print("✨ All articles are perfectly categorized!")

if __name__ == "__main__":
    asyncio.run(check_uncategorized())
