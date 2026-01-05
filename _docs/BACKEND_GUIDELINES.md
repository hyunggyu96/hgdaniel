# 📄 백엔드 가이드라인 (Backend Guidelines Quick Reference)

**Version**: 3.2 (2026-01-04 워크플로우/에러 대응 추가)  
**최종 업데이트**: 2026-01-04  
**목적**: 긴급 상황 및 작업 시작 전 필수 체크사항 요약

> 📚 **상세 문서**: `ARCHITECTURE.md`, `TROUBLESHOOTING.md`, `CHANGELOG.md` 참조

---

## 🛑 0. 작업 전 필수 체크리스트 (4단계)

### ✅ Step 1: 환경 스캔

- DB 스키마 실제 확인 (추측 금지)
- 파일/경로 존재 여부 확인 (`view_file`)

### ✅ Step 2: 정보 조회

- SSH 정보: `192.168.219.102:8022` (user: `u0_a155`, pw: `aisapiens`)
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

**현재 총 173개 키워드** (V5.2):

- Filler (29종), Toxin (24종), PDRN/PN (9종)
- Exosome (6종), Collagen Stimulator (24종)
- Skinboosters/Threads (22종), Machines/EBD (32종)
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
ssh -p 8022 u0_a155@192.168.219.102 "pgrep -fl python"
# → 정확히 3개여야 정상!

# 2. 정상이면 → 아무것도 하지 않음!
# 3. 비정상이면 → start_tablet_solo.sh 실행 (자동 정리 후 재시작)
ssh -p 8022 u0_a155@192.168.219.102 "cd ~/news_dashboard && bash start_tablet_solo.sh"
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

### AI 엔진

- **모델**: Qwen 2.5 7B (Q4_K_M)
- **포트**: `8080` ⚠️
- **GPU**: `-ngl 20` (하이브리드)

### 태블릿

- **Host**: `192.168.219.102:8022`
- **User**: `u0_a155` / PW: `aisapiens`
- **프로세스**: Collector + Processor + Watchdog (정확히 3개)

### Watchdog (자동 복구)

- **스크립트**: `watchdog.sh`
- **기능**: 5분마다 Collector/Processor 감시, 누락 시 자동 재시작
- **로그**: `watchdog.log`
- **실행**: `nohup bash watchdog.sh > /dev/null 2>&1 &`

> ⚠️ **매일 프로세스 중단 문제 해결용** (2026-01-04 추가)

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
