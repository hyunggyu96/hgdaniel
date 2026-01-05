# 🔧 트러블슈팅 가이드 (Troubleshooting Guide)

**최종 업데이트**: 2026-01-04

이 문서는 실제 발생한 문제와 해결 사례를 정리한 사례집입니다.

---

## 📋 목차

1. [Qwen 연결 실패 (2026-01-03/04)](#1-qwen-연결-실패)
2. [프로세스 중복 (2026-01-01)](#2-프로세스-중복)
3. [keyword 필드 분류 오류 (2026-01-02)](#3-keyword-필드-분류-오류)
4. [DB 스키마 불일치 (2026-01-01)](#4-db-스키마-불일치)

---

## 1. Qwen 연결 실패

**날짜**: 2026-01-03 23:34 ~ 2026-01-04 00:01

### 증상

```log
[Local LLM] Connection Error: Cannot connect to host 127.0.0.1:11434
⚠️ Local engine failed/offline. Falling back to Cloud...
[Gemini] Quota Exceeded (429). Trying next key...
⚠️ [FALLBACK] All AI models failed. Using local keyword extractor.
```

### 근본 원인

llama-server는 **포트 8080**에서 실행 중이었으나, 코드와 환경변수가 **포트 11434** (Ollama 기본 포트)를 참조.

**문제 발생 지점 3곳**:

1. `collector/inference_engine.py` Line 57 (fallback URL 하드코딩)
2. `collector/.env` OLLAMA_HOST 환경변수
3. 환경변수가 코드 기본값을 오버라이드

### 해결 방법

#### 1단계: 코드 수정

```python
# collector/inference_engine.py Line 57
# 수정 전
url = "http://127.0.0.1:11434/api/generate"

# 수정 후
url = "http://127.0.0.1:8080/api/generate"
```

#### 2단계: 환경변수 수정

```bash
# collector/.env
# 수정 전
OLLAMA_HOST=http://127.0.0.1:11434

# 수정 후
OLLAMA_HOST=http://127.0.0.1:8080
```

#### 3단계: 배포

```bash
# PC
git add collector/inference_engine.py
git commit -m "Fix: Port 11434→8080"
git push origin main

# 태블릿
cd ~/news_dashboard
git pull origin main
pkill python
bash start_tablet_solo.sh
```

### 검증 방법

**성공 로그**:

```log
🤖 Analyzing: [기사 제목]...
  [Local LLM] Connecting to: http://127.0.0.1:8080/v1/chat/completions
  ✅ Saved to Supabase DB (Description First)
```

**진단 명령어**:

```bash
# llama-server 포트 확인
ssh -p 8022 u0_a155@192.168.219.102 "ps aux | grep llama-server"

# 환경변수 확인
ssh -p 8022 u0_a155@192.168.219.102 "grep OLLAMA ~/news_dashboard/collector/.env"
```

### 교훈

1. 환경변수 (`.env`) > 코드 기본값
2. 코드 수정만으로는 안 될 수 있음
3. llama-server 포트 = 코드 URL = .env 값 (삼위일체)

---

## 2. 프로세스 중복

**날짜**: 2026-01-01

### 증상

- 로그 타임스탬프가 오래됨 (12/31 21:39)
- 하지만 Google Sheets에는 최신 데이터 존재 (1/1 14:02)
- 웹사이트에는 데이터 안 보임

### 원인

`start_tablet_solo.sh`를 여러 번 실행하여 **6개 이상의 Python 프로세스**가 동시 실행 중.  
각 프로세스가 별도 로그 파일을 사용하고 있었음.

### 해결

```bash
# 1. 프로세스 개수 확인
ssh -p 8022 u0_a155@192.168.219.102 "pgrep -fl python"

# 2. 모두 종료
ssh -p 8022 u0_a155@192.168.219.102 "pkill python"

# 3. 재시작
ssh -p 8022 u0_a155@192.168.219.102 "cd ~/news_dashboard && bash start_tablet_solo.sh"

# 4. 검증 (2개여야 정상)
ssh -p 8022 u0_a155@192.168.219.102 "pgrep -fl python"
```

### 교훈

- 로그만 믿지 말 것
- 프로세스 개수 + Google Sheets + 웹사이트 교차 검증

---

## 3. keyword 필드 분류 오류

**날짜**: 2026-01-02

### 증상

"원텍 제모 레이저" 기사가 **BOTULINUM TOXIN** 카테고리로 잘못 분류.

### 원인

1. 본문에 "보톡스" 1회 언급 → 네이버 "보톡스" 검색 결과 포함
2. `processor.py` Line 446에서 **검색어를 그대로 keyword 필드에 저장**:

   ```python
   "keyword": keyword,  # ← "보톡스" (검색어)
   ```

3. 프론트엔드에서 `keyword` 필드에 100점 가중치 부여
4. AI 분석 결과("레이저")보다 검색어("보톡스")가 우선

### 해결

```python
# processor.py Line 446
# 수정 전
"keyword": keyword,

# 수정 후
"keyword": final_main,  # AI 분석 결과 사용
```

### 임시 조치

```python
# PC에서 DB 직접 수정
from supabase import create_client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

supabase.table('articles')\
    .update({'keyword': '레이저'})\
    .ilike('title', '%원텍%레이저%')\
    .execute()
```

### 교훈

> **"네이버 검색 키워드 ≠ 기사의 실제 주제"**

검색어는 참고용일 뿐, DB 저장은 **AI 분석 결과 우선**.

---

## 4. DB 스키마 불일치

**날짜**: 2026-01-01

### 증상

```python
Column not found: ai_summary, issue_nature
```

### 원인

Supabase `articles` 테이블에 컬럼을 추가하지 않은 상태에서 코드만 업데이트.

### 해결

#### 임시 조치

```python
# processor.py에서 해당 필드 주석 처리
# "ai_summary": summary,  # DISABLED
# "issue_nature": issue_nature  # DISABLED
```

#### 근본 해결

```sql
-- Supabase Dashboard > SQL Editor
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS issue_nature TEXT;
```

### 교훈

1. DB 스키마 변경 시: SQL 먼저 → 코드 나중
2. API Key로는 DDL 불가 → Dashboard SQL Editor 사용

---

## 📌 빠른 참조

### 진단 명령어 모음

```bash
# 프로세스 확인
ssh -p 8022 u0_a155@192.168.219.102 "pgrep -fl python"

# llama-server 확인
ssh -p 8022 u0_a155@192.168.219.102 "ps aux | grep llama-server"

# 로그 확인
ssh -p 8022 u0_a155@192.168.219.102 "tail -50 ~/news_dashboard/processor.log"
ssh -p 8022 u0_a155@192.168.219.102 "tail -50 ~/news_dashboard/collector.log"

# 환경변수 확인
ssh -p 8022 u0_a155@192.168.219.102 "grep OLLAMA ~/news_dashboard/collector/.env"

# 재시작
ssh -p 8022 u0_a155@192.168.219.102 "pkill python"
ssh -p 8022 u0_a155@192.168.219.102 "cd ~/news_dashboard && bash start_tablet_solo.sh"
```

---

> 💡 **Tip**: 새로운 문제 해결 시 이 문서에 사례 추가하세요.
