# 📄 뉴스 대시보드 백엔드 가이드라인 (Unified Backend Guidelines)

**Version**: 2.2 (2025-12-31 Updated)
**Status**: Stable / Production Ready

이 문서는 뉴스 대시보드 프로젝트의 백엔드 아키텍처, 데이터 파이프라인, 태블릿 운영 수칙, 트러블슈팅을 집대성한 공식 매뉴얼입니다.

---

## 🏗️ 1. 시스템 아키텍처 (System Architecture)

### 📡 하이브리드 파이프라인 (Hybrid Pipeline)

- **수집 (Collector)**: `async_collector.py`가 네이버 뉴스 RSS 및 검색 API를 통해 실시간으로 기사를 수집합니다.
- **분석 (Processor)**: 태블릿(Legion Y700) 내의 `Ollama (Llama 3.2 3B)`가 수집된 기사를 분석하여 **광고 제거, 요약, 핵심 키워드 추출**을 수행합니다.
- **저장 (Stage 1)**: 분석된 데이터는 Supabase `raw_news` 테이블에 1차 저장됩니다.
- **배포 (Stage 2)**: 검증된 데이터는 Google Sheets(대시보드용 DB) 및 Firestore(앱 연동용)로 동기화됩니다.
- **서비스 (Presentation)**: Next.js 웹사이트가 고성능 인덱싱 및 캐싱(60s)이 적용된 전용 API를 통해 데이터를 시각화합니다.

---

## 🏰 2. 백엔드 핵심 원칙 (Core Principles)

1. **태블릿이 사령관이다 (Tablet First)**: 수집과 분석 프로세스는 태블릿(Termux) 내에서 실행됩니다.
2. **데이터 무결성 (Integrity)**: 한자, 일본어, 특수문자가 포함된 기사는 **즉시 폐기**합니다.
3. **24/7 자율 주행 (Autonomy)**: 에러 발생 시 스스로 재시도하며 로그를 남깁니다.
4. **보안 절대주의 (Security)**: API Key는 `.env`와 **Base64 하드코딩**으로만 관리하며 GitHub 노출을 엄격히 금지합니다.

---

## 🧹 3. 데이터 정제 및 보정 (Data Hygiene)

### 🚫 비토종 문자 완전 제거

- **원칙**: 모든 텍스트는 **한국어(한글), 영어, 숫자**만 허용합니다.
- **처리**: 한자(`\u4e00-\u9fff`), 일어 히라가나/가타카나 발견 시 정규식으로 즉시 제거하거나 기사를 폐기합니다.

### 🎯 키워드 분석 및 SSOT (Single Source of Truth)

- **SSOT 원칙**: 모든 키워드 분석은 **`_shared/keywords.json`** 파일을 절대적 기준으로 삼습니다.
- **백엔드 연동**: 분석기(`local_keyword_extractor.py`)는 하드코딩 대신 위 JSON 파일을 실시간 로드하여 화이트리스트 필터링을 수행합니다.

### ✍️ AI 요약문 50자 규칙

- **가이드**: 프론트엔드 카드 UI 최적화를 위해 AI 요약은 **50자 내외(최대 70자)**로 제한합니다.
- **방어 로직**: 요약이 너무 길 경우 백엔드에서 강제 절단하거나 재요약을 요청하여 레이아웃 깨짐을 방지합니다.

---

## 🚀 4. 성능 최적화 및 모니터링 (Performance & Monitoring)

### ⚡ 성능 최적화 (Optimization)

- **DB 인덱스 필수**: Supabase `articles` 테이블의 `published_at` (DESC) 및 `keyword` 컬럼에 인덱스를 생성하여 대량 데이터 처리 속도를 보장합니다.
- **API 캐싱**: 모든 뉴스 조회 API는 `export const revalidate = 60;`을 적용하여 서버 부하를 최소화합니다.

### 🚨 에러 모니터링

- **Sentry**: 백엔드 API 및 태블릿 분석 프로세스의 모든 런타임 에러는 Sentry 대시보드로 전송되어 실시간 추적합니다.

---

## 📊 5. 구글 시트 스키마 (v2.2)

사용자 활동과 데이터 무결성을 위해 다음 탭 구조를 유지합니다.

#### 1. 방문자 및 통계

- **`Visits_v2`**: [Time, IP, Country, UserAgent] - 최신순 정렬(Prepend).
- **`DailyStats_v2`**: [Date, TotalVisitors] - 일별 자동 집계.

#### 2. 사용자 활동 (Activity Logs)

- **`LoginHistory_v2`**: [Time, UserID, Type, Meta, IP] - 로그인 및 클릭 로그.
- **`UserCollections_v2`**: [UserID, IP, Title, URL, Date, AddedAt] - 즐겨찾기 통합 관리.
- **`키워드제안`**: 사용자가 입력한 새로운 시장 키워드 제안서.

---

## 🏗️ 6. 유지보수 및 확장 가이드 (Developer's Note)

### 🔑 Base64 하드코딩 인증

- Vercel 환경변수 오류를 피하기 위해 `service_account.json`을 Base64로 인코딩하여 코드에 직접 삽입합니다.

### ⚡ App Router vs Pages Router

- API는 호환성을 위해 무조건 **`web/src/pages/api/`** 경로에 생성합니다.

### 📊 구글 시트 마이그레이션 전략

- 시트 탭이 꼬이거나 쓰기가 거부될 땐 지체 없이 **새 탭(`_v2` 등)**을 생성하여 타겟을 변경하는 것이 가장 빠릅니다.

> **Note**: 문제가 생기면 로그를 확인하기 전에 이 가이드라인을 먼저 읽으십시오. 90%의 정답은 이미 여기에 있습니다.
