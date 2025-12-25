import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load Env
if os.path.exists('.env.local'):
    load_dotenv('.env.local')
else:
    load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Credentials failed.")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Categories ( Simplified from constants.ts )
CATEGORIES = {
    "Filler": ["필러", "레볼락스", "더채움", "쥬비덤", "레스틸레인"],
    "Botulinum Toxin": ["톡신", "보톡스", "나보타", "제오민", "레티보"],
    "Collagen Stimulator": ["PLLA", "PDLLA", "PLA", "쥬베룩", "스컬트라", "실리프팅"],
    "Skinboosters": ["PN", "PDRN", "엑소좀", "리쥬란", "스킨부스터"],
    "Machines (EBD)": ["HIFU", "RF", "고주파", "레이저", "울쎄라", "써마지", "슈링크", "인모드", "올리지오", "텐써마", "브이로", "더블로", "리프테라", "포텐자", "원텍", "클래시스", "제이시스"],
    "Corporate News": ["제테마", "휴젤", "파마리서치", "종근당", "휴온스", "메디톡스", "대웅제약", "갈더마", "멀츠", "앨러간", "시지바이오", "학회", "허가", "수출", "실적"]
}

# Fetch all articles
print("Fetching all articles...")
res = supabase.table("articles").select("title, main_keywords, keyword").execute()
articles = res.data

counts = {k: 0 for k in CATEGORIES.keys()}
counts["Uncategorized"] = 0

for a in articles:
    # Logic approximation: Check Main Keyword first
    mks = a.get('main_keywords', [])
    search_kw = a.get('keyword', '')
    
    # Extract real main keyword from tag string setup "[Main | ...]"
    real_mk = ""
    if mks and isinstance(mks[0], str):
        if mks[0].startswith('['):
            # Parse [Keyword | ... ]
            try:
                real_mk = mks[0][1:-1].split('|')[0].strip()
            except:
                real_mk = mks[0]
        else:
            real_mk = mks[0]
            
    # Normalize
    best_cat = None
    
    # Check against categories
    for cat, kws in CATEGORIES.items():
        if real_mk in kws:
            best_cat = cat
            break
        # Also check title/search_kw if no direct match (Simple version)
        if not best_cat and (real_mk in kws or search_kw in kws):
            best_cat = cat
            break
            
    if best_cat:
        counts[best_cat] += 1
    else:
        # Fallback to Corporate if nothing else fits (as per JS logic)
        # But here let's just count 'Corporate News' loosely
        # JS Logic has complex fallback. Let's assume 'Corporate News' is default for most
        counts["Corporate News"] += 1 

print("\n📊 Estimated Category Counts:")
for cat, count in counts.items():
    print(f"  {cat}: {count}")
