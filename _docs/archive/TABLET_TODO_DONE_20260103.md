# 🏠 집 도착 후 태블릿 작업 체크리스트

**작성일**: 2026-01-02  
**중요도**: ⭐⭐⭐ (HIGH)  
**예상 소요 시간**: 15분

---

## 🎯 작업 목표

**keyword 필드 분류 오류 근본 해결**: 네이버 검색어가 아닌 AI 분석 결과를 기준으로 기사를 분류하도록 백엔드 수정

### 📌 발견된 문제

- **원텍 레이저 기사**가 **BOTULINUM TOXIN** 카테고리로 잘못 분류됨
- **원인**: 본문에 "보톡스" 1회 언급 → 네이버 "보톡스" 검색 결과에 포함 → `keyword` 필드에 "보톡스" 저장 → 프론트엔드에서 높은 점수(100점) 부여
- **임시 조치**: PC에서 DB 직접 수정으로 해당 기사들 수정 완료 (17개)
- **근본 해결 필요**: 태블릿 `processor.py` 수정

---

## ✅ 체크리스트

### 1️⃣ 태블릿 SSH 접속

```bash
ssh -p 8022 u0_a43@192.168.219.102
# Password: aisapiens
```

### 2️⃣ 최신 코드 가져오기

```bash
cd ~/news_dashboard
git pull
```

### 3️⃣ processor.py 수정

**파일**: `collector/processor.py`

#### 변경 1: keyword 필드 수정 (라인 446번 근처)

##### ❌ 수정 전 (현재 코드)

```python
prod_data = {
    "title": title, 
    "description": desc,
    "link": link,
    "published_at": pub_date, 
    "source": "Naver",
    "keyword": keyword,  # ← 네이버 검색어 그대로 (문제!)
    "main_keywords": final_all_kws,
}
```

##### ✅ 수정 후 (권장 코드)

```python
prod_data = {
    "title": title, 
    "description": desc,
    "link": link,
    "published_at": pub_date, 
    "source": "Naver",
    "keyword": final_main,  # ← AI 분석 결과 사용 (개선!)
    "main_keywords": final_all_kws,
}
```

**변경 사항**: `keyword` 필드에 검색어(`keyword`) 대신 AI가 분석한 실제 주제(`final_main`)를 저장

---

#### 변경 2: BAD_KEYWORDS에 문학 필터 추가 (라인 120번 근처)

##### ❌ 수정 전

```python
BAD_KEYWORDS = [
    "캐시워크", "캐시닥", "용돈퀴즈", "돈버는퀴즈", "정답", "퀴즈",  # 리워드 앱
    "신차", "제네시스", "SUV", "GV90", "A-필러", "B-필러", "C-필러", # 자동차
    "디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아"
]
```

##### ✅ 수정 후

```python
BAD_KEYWORDS = [
    "캐시워크", "캐시닥", "용돈퀴즈", "돈버는퀴즈", "정답", "퀴즈",  # 리워드 앱
    "신차", "제네시스", "SUV", "GV90", "A-필러", "B-필러", "C-필러", # 자동차
    "디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아",
    "작가", "문학", "소설", "출판", "노벨문학상", "포세"  # 문학 (바임 동음이의어)
]
```

**이유**: "바임"이 의료기기 회사 (VIME)와 노벨문학상 소설 제목 두 가지로 사용됨. 문학 뉴스 필터링 필요.

### 4️⃣ 프로세스 재시작

```bash
# 기존 프로세스 종료
pkill python

# 재시작
bash start_tablet_solo.sh
```

### 5️⃣ 검증 (PC에서 실행)

```bash
# 로그 확인 (SSH로)
ssh -p 8022 u0_a43@192.168.219.102 "tail -50 ~/news_dashboard/processor.log"

# 새로 처리된 기사 확인 (PC에서)
python check_articles.py
```

**확인 포인트**:

- 새로 수집된 기사의 `keyword` 필드가 검색어가 아닌 실제 주제를 반영하는지
- 예: 레이저 기사는 "레이저", 필러 기사는 "필러"

---

## 🔍 선택사항 (시간 있으면)

### A. DB 스키마 확장 (검색어 추적용)

```sql
-- Supabase Dashboard > SQL Editor에서 실행
ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_keyword TEXT;
```

그 다음 `processor.py` 446번 라인을 추가 수정:

```python
"keyword": final_main,
"search_keyword": keyword,  # 검색어는 별도 보관
"main_keywords": final_all_kws,
```

### B. 프론트엔드 로직 보완

**파일**: `web/src/lib/constants.ts`  
**라인**: 43번

현재는 `keyword` 필드에 100점을 주는데, 이게 과도할 수 있음. 추후 조정 고려.

---

## 📊 예상 효과

✅ 기사가 올바른 카테고리에 분류됨  
✅ "본문에 1회 언급" 수준의 노이즈로 인한 오분류 방지  
✅ AI 분석 결과를 최대한 활용하는 구조로 개선  

---

## 🚨 주의사항

1. **반드시 `git pull` 먼저!**: 로컬(PC)과 태블릿 코드가 달라서 충돌 가능
2. **백업 필수**: 수정 전 `cp processor.py processor.py.backup` 실행
3. **로그 모니터링**: 재시작 후 최소 5분간 `processor.log` 실시간 확인

---

## ✅ 완료 후 체크

- [ ] `processor.py` 수정 완료
- [ ] 프로세스 재시작 완료
- [ ] 새 기사가 올바르게 분류되는지 확인
- [ ] 이 TODO 파일 삭제 또는 아카이브

---

**문제 발생 시**: Antigravity에게 "태블릿 processor.py 수정 중 에러 발생" 이라고 전달
