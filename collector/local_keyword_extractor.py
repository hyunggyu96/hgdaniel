# local_keyword_extractor.py
# Updated: 2025-12-31 (SSOT Integration)
import os
import json
import re
from collections import Counter
from typing import List

# Single Source of Truth: Load from shared folder
KEYWORDS_JSON_PATH = os.path.join(os.path.dirname(__file__), '..', '_shared', 'keywords.json')

def load_expert_keywords() -> List[str]:
    """Load keywords from shared JSON file."""
    try:
        with open(KEYWORDS_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_kws = []
            for cat in data.get('categories', []):
                all_kws.extend(cat.get('keywords', []))
            return all_kws
    except Exception as e:
        print(f"Error loading keywords.json: {e}")
        # Fallback to a minimal list if file not found
        return ["필러", "톡신", "보톡스", "리쥬란", "휴젤", "메디톡스"]

EXPERT_ANALYSIS_KEYWORDS = load_expert_keywords()

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
