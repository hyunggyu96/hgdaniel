# 🏗️ News Dashboard System Architecture

이 문서는 **Legion Y700 태블릿(Local AI)**과 **Next.js(Vercel)**가 결합된 하이브리드 뉴스 시스템의 구조를 설명합니다.

## 🗺️ 시스템 전체 흐름도 (Visual Overview)

```mermaid
graph TD
    %% Nodes
    subgraph Sources[🌐 뉴스 소스]
        Naver[네이버 뉴스 RSS]
        Search[검색 API]
    end

    subgraph Tablet[📱 태블릿 (Legion Y700)]
        direction TB
        Collector(수집기: async_collector.py)
        Processor(분석기: processor.py)
        Ollama[🧠 Local AI: Ollama 3.2 3B]
        
        Collector -->|1. 키워드 수집| Sources
        Processor <-->|3. 요약 및 정제| Ollama
    end

    subgraph DataStore[💾 데이터 저장소]
        Supabase[(Supabase: 원본 저장)]
        GSheets[(Google Sheets: 서비스 DB)]
        Visits[방문자/로그 v2]
    end

    subgraph Frontend[🖥️ 서비스 (Vercel)]
        Web[Next.js Dashboard]
        User((사용자))
        Sentry[🚨 Monitoring: Sentry]
    end

    %% Data Flow
    Collector -->|2. Raw 데이터 저장| Supabase
    Processor -->|3. Raw 데이터 로드| Supabase
    Processor -->|4. 분석 데이터 동기화| GSheets
    
    Web <-->|5. 뉴스 조회 (Indexed/Cached)| Supabase
    User -->|6. 접속/로그인| Web
    Web -->|7. 로그 기록 (Prepend)| Visits
    Web -.->|Error Tracking| Sentry
    
    %% Styling
    style Tablet fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Ollama fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style GSheets fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

---

## 🏛️ 핵심 설계 철학 (Core Philosophy)

시스템은 **PC 독립적**이며, 태블릿과 클라우드 서비스만으로 24시간 자동 운영됩니다.

**🌐 공식 서비스 주소**: [https://aesthetics-intelligence.vercel.app/](https://aesthetics-intelligence.vercel.app/)

---

## 1. 📱 태블릿 (The Worker - 24/7 운영)

**역할**: 뉴스 수집, AI 분석, 데이터 저장
**위치**: Termux (Android)
**실행 상태**: 백그라운드 상시 가동 (`start_tablet_solo.sh`)

| 프로세스 | 기능 설명 | 비유 |
| :--- | :--- | :--- |
| **Collector** (`async_collector.py`) | 30분 주기로 네이버 뉴스 API에서 최신 기사 수집 (Supabase `raw_news` 저장) | 부지런한 배달원 |
| **AI Engine** (`Ollama`) | Llama 3.2 모델 구동 (`localhost:11434`), 인터넷 없이 로컬에서 분석 수행 | 똑똑한 비서 |
| **Processor** (`processor.py`) | 수집된 기사를 하나씩 꺼내 AI에게 분석 지시(핵심 키워드, 요약, 중요도 평가) | 편집장 |
| **Data Pusher** | 분석 결과를 **Supabase**와 **Google Sheets**에 동시에 업로드 | 동시 발송 시스템 |

---

## 2. 👩‍💼 비서 (The Secretary - 정기 보고)

**역할**: 시스템 생존 신고, 업무량 모니터링, 뉴스 요약 보고
**위치**: GitHub Actions (Cloud Serverless)
**실행 주기**: 매 2시간 (`02:00`, `04:00`, `06:00`... KST)

---

## 3. ☁️ Vercel (The Presenter - 웹 대시보드)

**역할**: 사용자 인터페이스 제공, 실시간 조회
**최적화**: **60초 API 캐싱** 및 **Supabase DB 인덱싱** 적용 (속도 5~10배 향상)
**모니터링**: **Sentry**를 통한 실시간 에러 트래킹 및 성능 분석

| 기능 | 설명 | 저장소 |
| :--- | :--- | :--- |
| **뉴스 피드** | 인덱싱된 Supabase 데이터를 60초 캐싱과 함께 고속 서빙 | Supabase |
| **키워드 제안** | 사용자가 입력한 키워드를 **구글 시트(키워드제안)**에 저장 (파일 인증 방식) | Google Sheet |
| **방문자/로그인** | 로깅 v2 전략 적용 (Visits_v2, LoginHistory_v2) | Google Sheet |

---

## 4. 💾 데이터 저장소 (The Memory)

모든 데이터는 클라우드에 안전하게 저장됩니다.

* **Supabase (DB)**: 웹사이트용 고속 정보 저장소. (Indices: `published_at`, `keyword`)
* **Google Sheets**: 전문가용 엑셀 데이터 및 사용자 로그. (V2 시트 전략 준수)

### 📋 전문가용 9대 컬럼 구조 (Google Sheets)

| 순서 | 컬럼명 | 내용 설명 |
| :--- | :--- | :--- |
| 1 | **분석 시각** | 데이터가 분석된 실시간 타임스탬프 |
| 2 | **검색 키워드** | 수집 시 사용된 키워드 (정제된 텍스트) |
| 3 | **헤드라인** | 기사 제목 (HTML 태그 제거 완료) |
| 4 | **링크** | 기사 원문 URL (Unique ID 역할) |
| 5 | **메인 키워드** | 전문가 키워드 풀 중 가장 핵심적인 1순위 키워드 |
| 6 | **포함 키워드** | 본문 내 언급된 모든 전문가 키워드 리스트 |
| 7 | **발행 시각** | 실제 뉴스 보도 날짜 및 시간 (ISO 형식) |
| 8 | **이슈 성격** | 기사의 전략적 분류 (7종 고정 카테고리) |
| 10 | **본문 발췌** | 원본 기사 본문에서 전문가 관점으로 추출한 **70자 내외** 핵심 발췌 |

---

## 5. 🎯 시스템 강점 (Optimized)

1. **고성능 스택**: Vercel 캐싱 + DB 인덱싱으로 초고속 응답 보장.
2. **데이터 일관성(SSOT)**: `_shared/keywords.json` 하나로 프론트/백엔드 키워드 동기화.
3. **무정전 운영**: 로컬 AI와 클라우드 로깅의 절묘한 결합.

---

## 6. 🔑 키워드 관리 전략 (SSOT)

현재 시스템은 **단일 진실 공급원(Single Source of Truth)** 원칙을 따릅니다.

* **관리 위치**: `_shared/keywords.json`
* **역할**:
  1. **Frontend**: 네비게이션 카테고리 기차 및 필터 생성.
  2. **Backend**: `local_keyword_extractor.py`가 해당 파일을 로드하여 분석 수행.
* **장점**: 키워드 추가/수정 시 JSON 파일 하나만 고치면 모든 레이어에 즉시 반영됩니다.

---

## 7. 🛠️ 유지보수 가이드 (Maintenance)

| 작업 | 방법 |
| :--- | :--- |
| **카테고리/태그 수정** | `_shared/keywords.json` 수정 후 배포 |
| **수집 키워드 추가** | `collector/.env` → `KEYWORDS` 업데이트 |
| **백엔드 리셋** | 태블릿에서 `./start_tablet_solo.sh` 재실행 |
| **성능 체크** | Sentry 대시보드 또는 Vercel Analytics 확인 |

---

*최종 업데이트: 2025-12-31 (v2.2)*
*작성자: Antigravity*
