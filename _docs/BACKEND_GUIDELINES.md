# 📄 백엔드 가이드라인 (Backend Guidelines Quick Reference)

**Version**: 3.4 (2026-01-08: Collector 로직 개선 & 시트 Prepend 수정)  
**최종 업데이트**: 2026-01-08  
**목적**: 긴급 상황 및 작업 시작 전 필수 체크사항 요약

> 📚 **상세 문서**: `ARCHITECTURE.md`, `TROUBLESHOOTING.md`, `CHANGELOG.md` 참조

---

## 🛑 0. 작업 전 필수 체크리스트 (4단계)

### ✅ Step 1: 환경 스캔

- DB 스키마 실제 확인 (추측 금지)
- 파일/경로 존재 여부 확인 (`view_file`)

### ✅ Step 2: 정보 조회

- SSH 정보: `192.168.219.104:8022` (user: `u0_a155`, pw: `aisapiens`)
- Supabase DB 비밀번호: `AISapience111$`
- 키워드: `_shared/keywords.json` (SSOT)

### ✅ Step 3: 원자적 실행

- 명령어 분리 (**`&&` 금지**)
- 한 줄 실행 → 결과 정독 → 다음 줄
- **Output 전체 읽기** (숨은 에러 확인)

### ✅ Step 4: 변경 전파

- PC 수정 → `git push` → 태블릿 `git pull` → 재시작

---

## 🚫 절대 금기사항 (DO NOT)

### 1. PowerShell `&&` 사용 금지

```bash
# ❌ 금지
git pull && ./start.sh

# ✅ 허용
git pull
./start.sh
```

### 2. GPU Full Offloading 금지

- ❌ `-ngl 999` 또는 All Layers
- ✅ `-ngl 20` (Qwen 2.5 7B 최적값)
- ⚠️ SSH 끊김 = GPU OOM

### 3. 로그만 보고 판단 금지

- ✅ **삼중 검증**: 프로세스 개수 + Supabase + Google Sheets

### 4. 포트 불일치 주의

- llama-server: **포트 8080** 고정
- `collector/.env` OLLAMA_HOST 확인
- `inference_engine.py` URL 확인

### 5. Ollama 직접 사용 금지

- ❌ `ollama serve` (Segmentation Fault)
- ✅ `llama-server` (Termux llama-cpp)

### 6. 키워드 관리 (SSOT)

**절대 원칙**: `_shared/keywords.json`이 유일한 진실의 원천 (Single Source of Truth)

- ❌ 코드에 하드코딩 금지
- ✅ JSON 파일 로드하여 사용
- ⚠️ 키워드 추가 시 **양방향 체크**:
  - `collector/.env` KEYWORDS (수집용)
  - `_shared/keywords.json` (AI 분석용)

**현재 수집 키워드 (25개, 2026-01-06 업데이트)**:

```
필러,톡신,보톡스,리쥬란,쥬베룩,PLLA,PDLLA,HIFU,엑소좀,PDRN,PN,PDO,
제테마,휴젤,파마리서치,메디톡스,휴메딕스,종근당바이오,바임,원텍,
클래시스,제이시스메디칼,리투오,시지바이오,스킨부스터
```

**분석용 키워드 (173개, keywords.json)**:

- Filler (29종), Toxin (24종), PDRN/PN (9종)
- Exosome (6종), Collagen Stimulator (24종)
- Skinboosters/Threads (22종), Energy-Based Devices (32종)
- Corporate/Other (26종)

**주의사항**:

- 동음이의어 확인 (예: "바임" = 의료기기 vs 소설)
- 새 키워드 추가 → 두 곳 모두 업데이트
- 삭제 시에도 두 곳 모두 확인

### 7. 태블릿 = 실행 전용 (No Local Edits)

**규칙**: 태블릿에서 직접 파일 생성/수정 금지

```bash
# ❌ 금지 (태블릿에서)
vim some_script.py
nano fix_something.py

# ✅ 올바른 워크플로우
PC에서 수정 → git push → 태블릿 git pull → 실행
```

**이유**: 태블릿 로컬 파일 → PC push 시 git 충돌 발생

### 8. Google Sheets 에러 대응

**증상**: `APIError: No grid with id: XXXXXXX`

**원인**: 시트 구조 변경/삭제 시 gspread 캐시가 stale 됨

**해결**: 자동 재연결 로직 적용됨 (processor.py v3.2)

- 에러 발생 시 worksheet 재연결 후 재시도
- 수동 조치 불필요

---

## ✅ 필수 검증 체크리스트

**"완료" 보고 전 반드시 확인**:

| # | 확인 항목 | 명령어 | 정상 기준 |
|---|----------|--------|-----------|
| 1 | 프로세스 개수 | `ssh ... "pgrep -fl python"` | 정확히 **3개** (Collector, Processor, SyncBot) |
| 2 | Supabase | `python check_articles.py` | 오늘 날짜 존재 |
| 3 | Google Sheets | 시트 직접 확인 | 최신 타임스탬프 |
| 4 | 웹사이트 | URL 방문 | 오늘 뉴스 표시 |

---

## � 긴급 트러블슈팅

### Qwen 연결 실패 (`Cannot connect to 127.0.0.1:11434`)

**빠른 진단**:

```bash
# 1. llama-server 포트 확인
ssh -p 8022 u0_a155@192.168.219.102 "ps aux | grep llama-server"
# → --port 8080 확인

# 2. 환경변수 확인
ssh -p 8022 u0_a155@192.168.219.102 "grep OLLAMA ~/news_dashboard/collector/.env"
# → OLLAMA_HOST=http://127.0.0.1:8080 확인
```

**해결**: `TROUBLESHOOTING.md` 섹션 1 참조

### 프로세스 중복 방지 (V3.0)

> ⚠️ **핵심 원칙: 정상 프로세스는 절대 건드리지 않는다!**

**정상 상태 (터치 금지)**:

- Python 프로세스: 정확히 **3개** (async_collector.py, processor.py, auto_sync_bot.py)
- llama-server: **1개**

**비정상 상태 (조치 필요)**:

- 프로세스가 0개 → 재시작 필요
- 프로세스가 2개 이상 중복 → 정리 후 재시작

```bash
# 1. 현재 상태 확인
ssh -p 8022 u0_a155@192.168.219.104 "pgrep -fl python"
# → 정확히 3개여야 정상!

# 2. 정상이면 → 아무것도 하지 않음!
# 3. 비정상이면 → start_tablet_solo.sh 실행 (자동 정리 후 재시작)
ssh -p 8022 u0_a155@192.168.219.104 "cd ~/news_dashboard && bash start_tablet_solo.sh"
# → V3.0: 정상이면 "재시작 불필요" 출력 후 exit
```

**절대 하지 말 것**:

- ❌ 정상 상태에서 `pkill python` 실행
- ❌ start_tablet_solo.sh 반복 실행 (V3.0은 안전하지만 불필요)

---

## 🎯 핵심 원칙

1. **태블릿 우선** (Tablet First)
2. **데이터 무결성** (한자/일본어 즉시 폐기)
3. **24/7 자율 주행**
4. **보안 절대주의** (API Key GitHub 노출 금지)
5. **삼중 검증** (로그 + DB + 시트)

---

## � 시스템 구성 (Quick Ref)

### AI 엔진 (Tablet Optimized)

- **모델**: **Qwen 2.5 7B (Instruct)** (qwen7b.gguf)
- **포트**: `8080` ⚠️
- **가속 설정**:
  - `gpu-layers`: **`-ngl 0`** (CPU Only - 안정성 최우선)
  - `threads`: **`-t 4`** (Snapdragon 고성능 코어 4개만 사용 必)
  - `context`: **`-c 8192`** (긴 뉴스/복합 문맥 처리용 - 상향 조정 V3.3)
  - `batch`: `-b 128 -ub 64` (반응성 향상)

### 🧹 데이터 필터링 정책 (Noise Filtering V2.0 - 2026-01-06)

1. **즉시 차단 (Blacklist) - BAD_KEYWORDS**:
    - **리워드 앱**: 캐시워크, 돈버는퀴즈, 정답 등
    - **자동차**: 신차, 제네시스, SUV, A/B/C-필러, 테슬라, 현대차, 기아, BMW
    - **디스플레이**: LG디스플레이, 삼성디스플레이
    - **증시/금융**: 코스피, 코스닥, 증시, 주가지수, 마이크론, 미 증시
    - **세금/조세**: OECD최저세, 글로벌최저한세, 조세회피, 미 재무부, JP모건/JP모간
    - **장비**: 캐터필러, Caterpillar

2. **스마트 필터 (정확 매칭 - EXACT_MATCH_KEYWORDS)**:
    - **스킨부스터**: "스킨부스터" 또는 "스킨 부스터" 정확 매칭 필수
    - **온다**: "온다리프팅", "온다 리프팅", "온다기기" 정확 매칭 필수
      - ❌ "돌아온다", "내려온다" 등 일반 동사에서 부분 매칭 차단
      - ✅ "온다리프팅", "온다 리프팅", "onda lifting" 허용

3. **기업명 단독 분류 (COMPANY_ONLY_KEYWORDS → Corporate News)**:
    - 검색 키워드가 **기업명만** 있고 제품 키워드(필러, 톡신, 리쥬란 등)가 없으면 **Corporate News**로 분류
    - 해당 기업: 파마리서치, 휴젤, 메디톡스, 제테마, 대웅제약, 동국제약, 종근당, 휴메딕스, 휴온스, 케어젠, 갈더마, 멀츠, 앨러간, 시지바이오, 한스바이오메드, 원텍, 클래시스, 제이시스메디칼, 리투오

4. **동음이의어 문맥 필터 (CONTEXT_NOISE_FILTER)**:
    - **바임**: "호텔", "문학", "작가", "소설" 등의 문맥이면 노이즈로 처리

5. **AI 문맥 기반 필터링 강화 (V3.3)**:
    - **full_text 검사**: 제목뿐만 아니라 본문까지 검사하여 "A필러" 등의 노이즈가 본문에만 있어도 차단.
    - **AI 프롬프트 강화**: "자동차 필러"와 "안면 필러"를 구분하고, "A vs B" 비교 기사에서 주인공을 찾아내는 로직 추가.
    - **카테고리 분류 개선**: 검색 키워드 의존도를 낮추고(100→40), 제목 매칭 점수를 높여(50→80) "필러" 검색어로 수집된 "스컬트라" 기사가 올바르게 분류되도록 개선.

6. **에러 자동 복구**:
    - **ai_error**: AI 분석 실패 시 **대기 시간 없이 즉시** 다시 시도 (`pending`으로 자동 전환).
    - **Google Sheets**: 연결 끊김 시 자동 재연결 및 재시도.

7. **수집기 신뢰성 강화 (Collector Reliability V3.4)**:
    - **문제**: 태블릿 재부팅 시 Collector의 런타임 메모리가 초기화되어, 재시작 시점 이후 뉴스만 수집하는 문제 발생 (공백 생김).
    - **해결**: 실행 시 **DB(`articles` 테이블)의 가장 최신 `published_at`** 을 조회하여, 그 시점 이후의 뉴스부터 수집 시작.
    - **효과**: 태블릿이 꺼져있던 동안의 뉴스도 놓치지 않고 백필(Backfill) 가능.

8. **Google Sheets 로깅 개선 (Prepend)**:
    - 모든 로그(방문자, 로그인, 키워드 제안)는 **최신순(Prepend)** 으로 기록.
    - `insert_row(..., index=2)` 사용하여 헤더 아래에 최신 데이터 삽입.

### 태블릿

- **Host**: `192.168.219.104:8022`
- **User**: `u0_a155` / PW: `aisapiens`
- **프로세스**: Collector + Processor + Watchdog (정확히 3개)

### Watchdog (자동 복구)

- **스크립트**: `watchdog.sh`
- **기능**: 5분마다 Collector/Processor 감시, 누락 시 자동 재시작
- **로그**: `watchdog.log`
- **실행**: `nohup bash watchdog.sh > /dev/null 2>&1 &`

### 🔄 자동 실행 메커니즘 (Auto-Start)

1. **전원 재부팅 (Reboot)**: `Termux:Boot`가 `~/.termux/boot/start_auto.sh`를 실행하여 **자동 시작**. (터치 불필요)
2. **앱 재실행**: 실수로 앱을 껐다면, 앱 아이콘만 누르면 `.bashrc`가 동작하여 **자동 복구**.
3. **⚠️ 필수 조건**:
    - `Termux:Boot` 앱 설치 필요.
    - 최초 1회 `Termux:Boot` 앱을 실행하여 권한을 허용해야 함.

### 데이터베이스

- **Supabase URL**: `jwkdxygcpfdmavxcbcfe.supabase.co`
- **테이블**: `raw_news` (원본) → `articles` (대표)

### Google Sheets

- **Market Analysis**: `1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic`
- **Main Tab**: `Synced_Articles`

---

## 📚 상세 문서

- **ARCHITECTURE.md**: 전체 시스템 아키텍처
- **TROUBLESHOOTING.md**: 트러블슈팅 사례집
- **CHANGELOG.md**: 변경 이력
- **keywords.json**: 키워드 SSOT

---

> ⚡ **긴급**: 문제 발생 시 본 문서 먼저 체크 → 해결 안 되면 `TROUBLESHOOTING.md` 참조
