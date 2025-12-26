
import sys
import os

# Add collector to path
sys.path.append('collector')
from local_keyword_extractor import extract_keywords, extract_main_keyword

title = '"미국·유럽 빅파마도 붙었다"... 제테마 톡신 기술수출 어디까지 왔나'
desc = '이에 톡신·필러 쪽도 관심을 갖는 분위기다. 또 현재 미국에서 임상 중...'

print(f"Title: {title}")
print(f"Desc: {desc}")

main = extract_main_keyword(desc, title=title)
sub = extract_keywords(f"{title} {desc}")

print(f"Main (Local): {main}")
print(f"Sub (Local): {sub}")
