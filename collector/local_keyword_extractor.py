# local_keyword_extractor.py
# Simple keyword extractor for historic news articles.
import os
import re
from collections import Counter
from typing import List

# Expert Analyst Keywords for Tagging/Analysis (NOT for search crawling)
EXPERT_ANALYSIS_KEYWORDS = [
    # 1. Filler (16)
    "필러", "레볼락스", "더채움", "쥬비덤", "주비덤", "레스틸레인", "벨로테로", "순수필", "엘라스티", "뉴라미스", "로리앙", "클레비엘", "이브아르", "테오시알", "스타일에이지", "리덴시티",
    
    # 2. Botulinum Toxin (8)
    "톡신", "보톡스", "나보타", "제오민", "레티보", "코어톡스", "하이톡스", "비에녹스",
    
    # 3. Collagen Stimulator (10)
    "PLLA", "PDLLA", "PLA", "쥬베룩", "레니스나", "스컬트라", "리프팅실", "실리프팅", "PDO", "에스테필",
    
    # 4. Skinboosters (14)
    "PN", "PDRN", "엑소좀", "리쥬란", "스킨부스터", "hADM", "인체조직", "리투오", "힐로웨이브", "리바이브", "스킨바이브", "프로파일로", "비타란", "동종진피",
    
    # 5. Machines/EBD (21)
    "HIFU", "RF", "고주파", "레이저", "울쎄라", "써마지", "슈링크", "인모드", "올리지오", "텐써마", "브이로", "더블로", "울트라포머", "리프테라", "포텐자", "시크릿", "실펌", "온다리프팅", "큐어젯", "노보젯", "엔파인더스",
    
    # 6. Corporate News (33)
    "제테마", "휴젤", "파마리서치", "종근당", "종근당바이오", "휴온스", "휴메딕스", "메디톡스", "바이오플러스", "원텍", "클래시스", "제이시스", "바임", "대웅제약", "갈더마", "멀츠", "앨러간", "시지바이오", "비엔씨", "엑소코", "에스테팜", "아크로스", "한스바이오베드", "비엠아이", "중헌제약", "MDR", "학회", "최소침습", "미용성형", "화장품", "제이월드", "네오닥터", "허가"
]

def extract_keywords(text: str, top_n: int = 5) -> List[str]:
    """Return matching keywords based on substring existence in the text."""
    counts = {}
    lower_text = text.lower()
    for kw in EXPERT_ANALYSIS_KEYWORDS:
        count = lower_text.count(kw.lower())
        if count > 0:
            counts[kw] = count
    
    # Sort by frequency descending
    sorted_kws = sorted(counts.keys(), key=lambda x: counts[x], reverse=True)
    return sorted_kws[:top_n]

def extract_main_keyword(text: str, title: str = "") -> str:
    """Select the best main keyword based on title priority and frequency."""
    # Priority 1: In title
    title_kws = []
    lower_title = title.lower()
    for kw in EXPERT_ANALYSIS_KEYWORDS:
        if kw.lower() in lower_title:
            title_kws.append(kw)
    
    if title_kws:
        # If multiple in title, pick the one that appears most in body
        counts = {kw: text.lower().count(kw.lower()) for kw in title_kws}
        return max(counts, key=counts.get)
        
    # Priority 2: In body
    kws = extract_keywords(text, top_n=1)
    return kws[0] if kws else "기타"
