import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment
load_dotenv('collector/.env')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 노이즈 키워드 리스트
NOISE_KEYWORDS = [
    # 스포츠
    "홍현석", "헨트", "복귀전", "배구", "4대 2 승리", "최전방", "66분 활약", 
    "안델레흐트", "4-2 승리", "프로배구",
    # 자동차
    "G70", "2026 G70", "럭셔리 세단", "스포티함 감성",
    # 요리
    "요리 못해도", "기죽지 마라", "잘하는 걸 찾아", "끝장 보는 게 세프",
    # 금융
    "알더인베스트먼트", "LGA", "초고액자산가", "슬게 고민의 해법",
    # 스포츠 (농구/NBA)
    "NBA", "농구", "무릎 부상", "전체 9순위"
]

print("🗑️  노이즈 뉴스 삭제 시작...")
total_deleted = 0

for keyword in NOISE_KEYWORDS:
    try:
        # 제목 또는 설명에 키워드가 포함된 뉴스 검색
        response = supabase.table("articles").select("id, title").or_(
            f"title.ilike.%{keyword}%,description.ilike.%{keyword}%"
        ).execute()
        
        if response.data:
            print(f"\n🔍 '{keyword}' 관련 뉴스 {len(response.data)}건 발견:")
            for article in response.data:
                print(f"   - {article['title'][:60]}...")
                # 삭제
                supabase.table("articles").delete().eq("id", article['id']).execute()
                total_deleted += 1
    except Exception as e:
        print(f"⚠️  '{keyword}' 처리 중 오류: {e}")

print(f"\n✅ 총 {total_deleted}건의 노이즈 뉴스 삭제 완료!")
