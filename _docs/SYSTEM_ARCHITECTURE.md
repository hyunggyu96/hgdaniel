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
    end

    %% Data Flow
    Collector -->|2. Raw 데이터 저장| Supabase
    Processor -->|3. Raw 데이터 로드| Supabase
    Processor -->|4. 분석 데이터 동기화| GSheets
    
    Web <-->|5. 뉴스 조회| GSheets
    User -->|6. 접속/로그인| Web
    Web -->|7. 로그 기록 (Prepend)| Visits
    
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

| 업무 | 설명 |
| :--- | :--- |
| **업무량 체크** | 지난 2시간 수집/분석 건수 및 **현재 대기 중(Pending) 업무량** 파악 |
| **생존 신고** | 시스템이 정상 작동 중인지(Healthy) 아니면 과부하 상태인지 판단 |
| **뉴스 브리핑** | 주요 뉴스 제목과 키워드를 요약하여 **사용자 이메일**로 발송 |

---

## 3. ☁️ Vercel (The Presenter - 웹 대시보드)

**역할**: 사용자 인터페이스 제공, 실시간 조회
**배포 방식**: GitHub Push 시 자동 배포 (Event-based)
**데이터 갱신**: 사용자 접속 시마다 DB에서 즉시 조회 (SSR/Dynamic, `no-cache`)
**비유**: 깔끔한 전광판 (책장의 정보를 보기 좋게 표시)

| 기능 | 설명 | 저장소 |
| :--- | :--- | :--- |
| **뉴스 피드** | 태블릿이 저장한 Supabase 데이터를 실시간으로 가져와 화면에 표시 | Supabase |
| **키워드 제안** | 사용자가 입력한 키워드를 **구글 시트(키워드제안)**에 저장 (파일 인증 방식) | Google Sheet |
| **방문자 집계** | 접속자의 IP를 분석하여 일일 방문자 수를 **구글 시트(Visits)**에 저장 | Google Sheet |
| **로그인 로그** | 사용자 로그인 기록을 **구글 시트(개인별 시트)**에 저장 | Google Sheet |

---

## 4. 💾 데이터 저장소 (The Memory)

모든 데이터는 클라우드에 안전하게 저장되며, 태블릿이나 PC가 고장 나도 데이터는 유지됩니다.
**비유**: 거대한 책장 (모든 정보를 기록해둠)

* **Supabase (DB)**: 웹사이트용 고속, 구조화 데이터. (Table: `articles`, `raw_news`)
* **Google Sheets**: 관리자(사용자)용 엑셀 데이터. (Market Analysis 시트)
  * *동기화 상태: 태블릿이 두 곳에 쌍둥이 데이터를 동시에 쏘아 올림.*

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
| 8 | **이슈 성격** | 기사의 전략적 분류 (제품 출시/허가, 임상/연구데이터, 실적/수출/경영, 법적분쟁/규제, 투자/M&A, 학회/마케팅, 기타) |
| 9 | **AI 한 줄 요약** | 전문가 관점의 50자 내외 핵심 요약 |

---

## 5. 💻 PC (The Architect - 개발 도구)

**역할**: 코드 수정, 기능 추가, 배포 지시
**상태**: **꺼둬도 됨.** (시스템 운영에 관여하지 않음)

* PC에서 코드를 고치고 `git push`를 하면, Vercel이 웹사이트 디자인을 바꿉니다.
* PC가 꺼져 있어도 태블릿과 Vercel은 멈추지 않습니다.

---

## 6. 🎯 시스템 장점

| 장점 | 설명 |
| :--- | :--- |
| **100% 무료 유지** | 각 서비스의 무료 할당량만 영리하게 사용하여 운영비가 **0원** |
| **컴퓨터를 꺼도 됨** | 모든 작업이 내 컴퓨터가 아닌 **태블릿/클라우드** 상에서 실행 |
| **안정성** | 로컬 AI(Ollama)를 사용하여 외부 API 장애에 영향받지 않음 |
| **편의성** | 개발자가 아니어도 **구글 시트**만 열면 뉴스가 업데이트되는 것을 실시간으로 확인 |

---

## 7. 🔑 키워드 관리 전략

### 🎣 크롤링 키워드 (그물)

* **용도**: 뉴스 수집 시 검색어로 사용 (Naver API 호출용)
* **관리 위치**: `collector/.env` → `KEYWORDS`
* **현재 리스트**: `필러, 톡신, 보톡스, PLLA, PDLLA, HIFU, 엑소좀, PDRN, PN, PDO, 제테마, 휴젤, 파마리서치, 메디톡스, 대웅제약, 휴온스, 종근당바이오, 바임, 원텍, 클래시스, 제이시스메디칼`

### 🧠 AI 분석 키워드 (필터)

* **용도**: 기사 내용에서 핵심 정보를 매칭하고 태깅할 때 사용 (전문가 분류용)
* **관리 위치**: `collector/local_keyword_extractor.py` → `EXPERT_ANALYSIS_KEYWORDS`
* **전체 리스트 (카테고리별, 총 102개)**:
  * **Filler (16개)**: 필러, 레볼락스, 더채움, 쥬비덤, 주비덤, 레스틸레인, 벨로테로, 순수필, 엘라스티, 뉴라미스, 로리앙, 클레비엘, 이브아르, 테오시알, 스타일에이지, 리덴시티
  * **Botulinum Toxin (8개)**: 톡신, 보톡스, 나보타, 제오민, 레티보, 코어톡스, 하이톡스, 비에녹스
  * **Collagen Stimulator (10개)**: PLLA, PDLLA, PLA, 쥬베룩, 레니스나, 스컬트라, 리프팅실, 실리프팅, PDO, 에스테필
  * **Skinboosters (14개)**: PN, PDRN, 엑소좀, 리쥬란, 스킨부스터, hADM, 인체조직, 리투오, 힐로웨이브, 리바이브, 스킨바이브, 프로파일로, 비타란, 동종진피
  * **Machines/EBD (21개)**: HIFU, RF, 고주파, 레이저, 울쎄라, 써마지, 슈링크, 인모드, 올리지오, 텐써마, 브이로, 더블로, 울트라포머, 리프테라, 포텐자, 시크릿, 실펌, 온다리프팅, 큐어젯, 노보젯, 엔파인더스
  * **Corporate News (33개)**: 제테마, 휴젤, 파마리서치, 종근당, 종근당바이오, 휴온스, 휴메딕스, 메디톡스, 바이오플러스, 원텍, 클래시스, 제이시스, 바임, 대웅제약, 갈더마, 멀츠, 앨러간, 시지바이오, 비엔씨, 엑소코, 에스테팜, 아크로스, 한스바이오베드, 비엠아이, 중헌제약, MDR, 학회, 최소침습, 미용성형, 화장품, 제이월드, 네오닥터, 허가

---

## 8. 🛠️ 유지보수 가이드

| 작업 | 방법 |
| :--- | :--- |
| **뉴스 키워드 추가** | `collector/.env` 파일의 `KEYWORDS`에 추가 |
| **분석 키워드 추가** | `collector/local_keyword_extractor.py`의 `EXPERT_ANALYSIS_KEYWORDS` 리스트에 추가 |
| **디자인 수정** | `web/` 폴더의 코드를 고치고 GitHub에 올리면 **Vercel**이 자동 배포 |
| **태블릿 재시작** | Termux에서 `./start_tablet_solo.sh` 실행 |
| **DB 초기화** | 필요 시 `supabase.table('articles').delete()` 명령어 사용 |

---

*최종 업데이트: 2025-12-31*
*작성자: Antigravity*
