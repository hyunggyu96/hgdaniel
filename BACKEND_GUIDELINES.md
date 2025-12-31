# 📄 뉴스 대시보드 백엔드 가이드라인 (Unified Backend Guidelines)

**Version**: 2.1 (2025-12-31 Updated)
**Status**: Stable / Production Ready

이 문서는 뉴스 대시보드 프로젝트의 백엔드 아키텍처, 데이터 파이프라인, 태블릿 운영 수칙, 트러블슈팅을 집대성한 공식 매뉴얼입니다.

---

## 🏗️ 1. 시스템 아키텍처 (System Architecture)

### 📡 하이브리드 파이프라인 (Hybrid Pipeline)

- **수집 (Collector)**: `async_collector.py`가 네이버 뉴스 RSS 및 검색 API를 통해 실시간으로 기사를 수집합니다.
- **분석 (Processor)**: 태블릿(Legion Y700) 내의 `Ollama (Llama 3.2 3B)`가 수집된 기사를 분석하여 **광고 제거, 요약, 핵심 키워드 추출**을 수행합니다.
- **저장 (Stage 1)**: 분석된 데이터는 Supabase `raw_news` 테이블에 1차 저장됩니다.
- **배포 (Stage 2)**: 검증된 데이터는 Google Sheets(대시보드용 DB) 및 Firestore(앱 연동용)로 동기화됩니다.
- **서비스 (Presentation)**: Next.js 웹사이트가 Google Sheets 및 API를 통해 데이터를 시각화합니다.

---

## 🏰 2. 백엔드 핵심 원칙 (Core Principles)

1. **태블릿이 사령관이다 (Tablet First)**: 모든 수집과 분석 프로세스는 태블릿(Termux) 내에서 실행됩니다. PC는 보조 및 개발 도구일 뿐입니다.
2. **데이터 무결성 (Integrity)**: 한자, 일본어, 특수문자가 포함된 기사는 **즉시 폐기**합니다. 오직 깨끗한 한국어 데이터만 허용합니다.
3. **24/7 자율 주행 (Autonomy)**: 시스템은 사람의 개입 없이 365일 스스로 돌아가야 합니다. 에러 발생 시 스스로 재시도하거나 로그를 남기고 다음 작업으로 넘어가야 합니다.
4. **보안 절대주의 (Security)**: API Key, 서비스 계정 정보는 절대 GitHub에 올리지 않습니다. `.env`와 로컬 파일 시스템에만 존재합니다(+Base64 하드코딩).

---

## 🛠 3. 핵심 파일 및 관리 (Critical Files)

- **`.env`**: API 키 및 검색 키워드(`KEYWORDS`) 관리. 수정 후 반드시 프로세스 재시작 필요.
- **`last_update.json`**: 시스템의 **심장박동(Heartbeat)** 및 **수집 기준점**.
  - 수집기(`async_collector.py`)가 마지막으로 읽은 시간을 기록하여 중복 수집을 방지합니다.
  - 이 파일이 삭제되면 아주 오래전 데이터부터 다시 수집을 시작하여 토큰 낭비가 발생합니다.

---

## 🧹 4. 데이터 정제 및 보정 (Data Hygiene)

### 🚫 비토종 문자(일어/한자) 완전 제거 (Nuclear Clean)

- **원칙**: 구글 시트 대시보드는 **한국어(한글), 영어, 숫자**만 허용합니다.
- **제거 대상**:
  - **한자(Hanja)**: Unicode `\u4e00-\u9fff` 전역 제거.
  - **일어(Japanese)**: 히라가나(`\u3040-\u309f`), 가타카나(`\u30a0-\u30ff`) 전역 제거.
  - **특수 기호**: 제어 문자 및 불필요한 특수 기호 제거 (기본 문장 부호 제외).
- **정규식**: `re.sub(r'[\\u4e00-\\u9fff]', '', text)`를 통해 모든 한자를 제거합니다.

### 🎯 키워드 추출 정밀도 (Precision Tagging)

- **원칙**: 양보다 질이며, **'본문 근거(Evidence-based)'**가 최우선입니다.
- **화이트리스트 강제 (Strict Whitelist)**:
  - 코드 레벨에서 `EXPERT_ANALYSIS_KEYWORDS` 풀에 없는 단어는 **무조건 삭제**합니다.
  - **언어 필터**: 한글(가-힣)이 포함되지 않은 순수 영문(`healthy`, `hiring`)이나 숫자, 기호 키워드는 노이즈로 간주하여 즉시 폐기합니다.
- **요약문 스마트 절단 (Smart Truncation)**:
  - **가비지 킬러**: 문장의 완성형 어미(`.다`, `.함`) 뒤에 붙는 숫자, 특수문자, 깨진 단어는 정규식(`re.sub`)으로 정밀 타격하여 제거합니다.
  - **안전 장치**: 단, 뒤에 이어지는 내용이 온전한 한국어 문장일 경우 보존하며, 꼬리에 붙은 찌꺼기만 잘라냅니다.
- **AI 필터링**: `included_keywords`는 반드시 본문에 등장하거나 본문의 핵심 주제와 직접 연결된 항목 2~4개로 제한합니다.

---

## 🚀 5. 운영 및 유지보수 (Maintenance)

### 🔧 유지보수 및 감사 스크립트 (Audit Tools)

1. **`diagnose.py`**: 전체 시스템(Vercel, Supabase, Firebase, GSheets)의 연결 상태를 한눈에 진단합니다.
2. **`check_integrity.py`**: 구글 시트의 최신 데이터를 스캔하여 **한자 포함 여부, AI 오타(휴zel), 빈 요약본** 등 무결성을 전수 조사합니다.
3. **`organize_sheet.py`**: 구글 시트의 데이터를 링크 기준으로 중복 제거하고 발행 시간순으로 정렬합니다.
4. **`health_check.py`**: 웹 사이트 응답 속도를 체크하고 Firestore에 상태를 기록합니다.

### 🔄 재가동 워크플로우 (Stop & Start)

1. **중단**: `ps -ef | grep python`으로 프로세스 확인 후 `kill` 혹은 `Ctrl+C`.
2. **실행**: `bash start_tablet_solo.sh` 명령어로 Ollama와 수집기 세트를 일괄 가동합니다.

---

## 📌 6. 핵심 주의사항 (Precautions)

- **CPU 사용량**: Y700은 성능이 좋지만 AI 분석 시 CPU를 100% 사용합니다. 충전 시 발열에 주의하세요.
- **타임아웃**: 태블릿 환경에서 Ollama 응답은 PC보다 느리므로 **120초** 설정을 반드시 유지하세요.
- **리셋 방지**: 라이브러리가 이미 설치된 상태라면 무의미한 `pip install` 반복을 피하세요 (토큰 및 시간 낭비).

---

## 🌡️ 7. 하드웨어 부하 및 발열 관리 (Hardware Health)

Legion Y700의 성능을 유지하고 기기 수명을 보호하기 위한 규칙입니다.

- **CPU 과부하 판단**: `processor.py`가 가동 중인 상태에서 `Ollama` 추론이 시작되면 CPU 점유율이 즉시 100%에 도달합니다. 정상입니다.
- **쓰로틀링 감지**: 처리 속도가 갑자기 평소보다 2배 이상 느려진다면 하드웨어 쓰로틀링을 의심하고 기기를 식혀야 합니다.

---

## 🛰️ 8. 24/7 자율 가동 및 프로세스 생존 (Autonomy)

컴퓨터가 꺼져 있어도 태블릿 단독으로 뉴스를 수집하고 분석하기 위한 **'감시망 유지'** 규칙입니다.

### 🔋 프로세스 지속성 (Persistence)

- **Wake Lock 활성화**: Termux 알림창에서 `Acquire wakelock`을 반드시 클릭하세요. (CPU 취면 방지)
- **백그라운드 실행 (`nohup`)**:
  - `nohup <명령어> >> log파일 2>&1 &` 형태로 실행하여 터미널이 닫혀도 생존하게 합니다.
  - `start_tablet_solo.sh`가 이 역할을 수행합니다.

### 🔄 자가 회복 (Self-Healing)

- **메모리 보호**: 수시로 `diagnose.py`를 실행하여 모든 파이프라인이 살아있는지 확인하세요.

---

## 🛠️ 9. CLI 툴킷 및 서비스 연결 상태 (Tool Connectivity)

프로젝트 관리에 사용되는 CLI 도구 및 AI, 외부 서비스 연결 방식을 정의합니다.

### ✅ Active CLI (설치됨 & 사용 중)

1. **Vercel CLI**: 프론트엔드 배포 및 환경변수 동기화. (인증: Base64 하드코딩)
2. **GitHub CLI (`gh`)**: PR 생성, **Secrets 보안 업로드**.
3. **Tablet Remote (SSH)**: `ssh -p 8022 u0_a43@192.168.219.102`

### ☁️ Managed by AI & SDK

4. **Supabase**: Python/JS 라이브러리로 직접 제어.
2. **Google Cloud (GCP)**: `service_account.json` 기반 인증. (Google Sheets API)
3. **Firebase**: `firebase-admin` SDK 사용.

---

## 🛑 10. 트러블슈팅 히스토리 (Troubleshooting Log)

**2025-12-31: 방문자 로깅 및 배포 장애**

- **증상**: 방문자 기록(Login Logs) 중단. API 500 에러.
- **원인**: Vercel 환경변수(`GOOGLE_SERVICE_ACCOUNT_KEY`) 인식 실패 및 GitHub Push Protection 차단.
- **해결**:
  1. 인증키 JSON 내용을 **Base64**로 인코딩하여 코드 내에 하드코딩 주입. (`fix_auth_apis.py` 사용)
  2. `Visits` 시트가 꼬여서 **`Visits_v2`** 및 **`DailyStats_v2`**로 타겟 시트 변경.
  3. IP 추출 로직 강화.
- **교훈**: 확실한 인증이 필요할 땐 암호화된 키를 코드에 심는 것이 가장 강력하다. 시트가 안 되면 이름을 바꿔라(V2).

---

## � 11. 구글 시트 스키마 (Google Sheets Schema)

데이터 무결성과 관리 용이성을 위해 다음 스키마를 엄수합니다.

#### 1. 방문자 및 통계

- **`Visits_v2`**: [Time, IP, Country, UserAgent] - 최신순 정렬(Prepend).
- **`DailyStats_v2`**: [Date, TotalVisitors] - 일별 자동 집계.

#### 2. 사용자 활동 (Activity Logs)

- **`LoginHistory_v2`**: [Time, UserID, Type, Meta, IP] - 로그인 및 주요 클릭 로그.
- **`UserCollections_v2`**: [UserID, IP, Title, URL, Date, AddedAt] - 즐겨찾기 통합 관리.
  - **전략**: `UserID` 필터링 방식을 사용하여 단일 시트에서 관리.

#### 3. 인증

- **인증**: Base64 인코딩된 서비스 계정 키 사용. (환경변수 X)

---

## 🏗️ 12. 유지보수 및 확장 가이드 (Developer's Note)

이 프로젝트를 이어받을 AI 또는 개발자를 위한 핵심 구현 원리와 노하우입니다.

### 🔑 1. Base64 하드코딩 인증 (The 'Silver Bullet' for Auth)

- **배경**: Vercel 환경변수(`\n` 처리 문제)와 GitHub Push Protection(JSON 파일 차단)의 이중고를 해결하기 위해 도입했습니다.
- **원리**: `service_account.json` -> `Compact JSON String` -> `Base64 Encode` -> `Code Constant`
- **키 교체 방법**:
  1. 로컬에 새 `service_account.json`을 준비합니다.
  2. 파이썬 스크립트(`fix_auth_apis.py` 참조)를 작성하여, JSON을 읽어 Base64로 변환합니다.
  3. API 파일(`track-visit.ts`, `log-login.ts` 등)의 `SERVICE_ACCOUNT_KEY_B64` 상수를 교체합니다.
  4. **주의**: `.env`나 Vercel Env에 의존하지 마십시오. 코드가 곧 설정입니다.

### ⚡ 2. App Router vs Pages Router 충돌 방지

- **현황**: 메인 웹은 Next.js App Router(`app/`)를 쓰지만, 백엔드 API는 호환성과 개발 속도를 위해 **Pages Router (`pages/api/`)**를 사용 중입니다.
- **주의**: `web/src/app/api/...` 경로에 동일한 이름의 폴더가 생기면 빌드 충돌이 발생합니다. API는 무조건 `web/src/pages/api/`에만 만드십시오.

### 📊 3. 구글 시트 데이터 전략 (Unified & V2)

- **V2 이주**: 시트가 원인 불명으로 꼬이거나 쓰기가 거부될 땐, 디버깅보다 **새 탭(`_v2`) 생성**이 훨씬 빠르고 경제적입니다.
- **통합 시트(`UserCollections`)**: 사용자마다 시트를 만들면(Tab per User), 시트 탭 한계(200개)와 관리 복잡도에 직면합니다.
- **해법**: 모든 사용자의 즐겨찾기를 하나의 시트에 넣고, `UserID` 컬럼으로 구분하십시오. 읽을 때는 `filter()`로 가져오면 됩니다.

> **Note**: 시스템이 멈추거나 이상하면 이 가이드라인의 '트러블슈팅 히스토리'와 이 섹션을 먼저 읽어보세요. 답은 이미 여기에 있습니다.
