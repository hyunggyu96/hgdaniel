# 🌌 News Dashboard Front-end Guidelines

## 🛑 0. 작업 시작 전 필수 절차 (Mandatory Protocol for AI)

**모든 AI 작업자는 프론트엔드 작업을 시작하기 전, 다음 수칙을 반드시 먼저 확인하십시오.**

### Rule 1: 답변(Output) 정독 필수 (Critical)

- 터미널 명령어(예: `npm run build`, `git push`) 실행 후 반환되는 **로그를 한 글자도 빠짐없이 읽으십시오.**
- "Done" 뒤에 숨은 `Failed`, `Warning`, `Error` 메시지를 놓치면 무한 수정 루프에 빠집니다.

### Rule 2: 환경 가설 검증

- `package.json`이나 `node_modules`가 있다고 가정하지 말고, `view_file` 등으로 실제 환경을 확인하십시오.

---

이 문서는 프로젝트의 UI/UX 일관성과 프론트엔드 개발 효율을 위해 작성되었습니다. **기능/주제별로 구조화**되어 있어 특정 작업 시 해당 섹션만 빠르게 참조할 수 있습니다.

---

## 🎨 디자인 철학 (Design Philosophy)

- **Concept**: Premium, Modern, Aesthetics Intelligence.
- **Inspiration**: Toss 앱의 심플함과 애플의 세련된 마이크로 인터렉션.
- **Theme**: 고도화된 다크 모드 (Deep Navy/Black 기반).
- **Core Styles**:
  - **Glassmorphism**: `glass-card`, `glass-panel` 유틸리티 적극 활용 (블러 및 투명도).
  - **Premium Blue**: `#3182f6` (Toss Blue) 컬러를 포인트로 사용.
  - **Layout**: 데스크탑 기준 **5열 그리드** (`2xl:grid-cols-5`) 확장형 레이아웃 적용.

---

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js 14 (App Router).
- **Styling**: Tailwind CSS.
- **Animation**: Framer Motion (Staggered Fade-in 효과 중심).
- **Components**: Radix UI, Lucide React (Icons).
- **Data Fetching**: SWR (클라이언트 사이드 캐싱).

---

## 🚨 운영 수칙 (Strict Operational Rules)

파워쉘이나 터미널 작업, 혹은 일반적인 개발 진행 시 다음 수칙을 반드시 준수합니다.

1. **답변 정독 (Read Carefully)**: 모든 에러 로그와 시스템 메시지를 끝까지 읽고 분석한 뒤 행동한다.
2. **에러 즉시 정지 (Stop on Error)**: 빌드 에러나 런타임 예외 발생 시, 무리하게 진행하지 않고 즉시 멈춰서 원인을 분석한다.
3. **환경 검증 우선 (Verify Environment First)**: 배포나 실행 전 `node_modules`, `package.json` 등 환경 설정이 올바른지 먼저 확인한다.
4. **PowerShell 연산자 제한 (No '&' Operator)**: PowerShell에서 명령어 연결 시 `&` (Ampersand) 사용을 금지한다. 반드시 `;` (Semicolon)을 사용하거나 여러 단계로 나누어 실행한다.
5. **답변 자가 검증 (Self-Correction)**: 명령어를 실행하거나 코드를 수정하기 전, 해당 작업이 현재 환경(Windows/PowerShell)에서 유효한지 스스로 질문하고 검증한다. '무지성 실행'을 금지한다.

---

## 📐 아키텍처 (Architecture)

### Server/Client Separation (CRITICAL)

`framer-motion`과 같은 브라우저 전용 라이브러리는 서버 컴포넌트(`NewsList`)에서 직접 사용할 수 없음. 반드시 `"use client"`가 선언된 `NewsListContainer` 등으로 분리하여 데이터를 Props로 전달할 것. (런타임 에러 방지)

### SWR 기반 클라이언트 캐싱 (중요!)

- **문제**: 네비게이션 시 매번 서버에서 전체 데이터를 다시 페칭하여 느림.
- **해결**: `swr` 라이브러리 도입으로 클라이언트 사이드 캐싱 구현.
- **변경 사항**:
  - `page.tsx`: 서버 컴포넌트 → **클라이언트 컴포넌트** (`'use client'`)
  - `NewsList.tsx`: 서버 컴포넌트 → **클라이언트 컴포넌트** (`useNews` 훅 사용)
  - 새로운 API: `/api/news` (뉴스 데이터 제공)
  - 새로운 훅: `hooks/useNews.ts` (SWR 래퍼)
- **효과**:
  - 첫 로딩 후 카테고리 전환이 **즉시(0.01초)** 일어남
  - 1분마다 백그라운드 자동 갱신 (`refreshInterval: 60000`)
  - 중복 요청 방지 (`dedupingInterval: 60000`)
- **⚠️ 주의사항**:
  - `page.tsx`와 `NewsList`는 이제 **클라이언트 컴포넌트**입니다.
  - 서버 사이드 렌더링(SSR)이 필요한 경우 별도 처리 필요.
  - `searchParams`는 `useSearchParams()` 훅으로 접근.

### Type Safety

Next.js 빌드 시 `Optional Props`(`searchQuery`, `selectedCategory` 등)는 반드시 `|| null` 혹은 `|| false` 처리를 통해 명시적인 값을 전달해야 빌드 실패를 방지할 수 있음.

---

## 🎯 3D Integration (Spline)

### 현재 구현: iframe 방식

- **위치**: 랜딩페이지 Hero 섹션
- **방식**: iframe 임베드
- **제약**: 마우스 추적이 iframe 내부로 제한됨

### 네이티브 통합 시도 (실패)

- **시도 라이브러리**: `@splinetool/react-spline`, `@splinetool/runtime`
- **발생 문제**:
  - Next.js 14 Webpack/ESM과의 호환성 문제 (`Package path . is not exported`)
  - 빌드 성공 후에도 런타임 403 Forbidden 에러 (Spline 서버 측 접근 제한)
  - `scene.splinecode` 파일에 대한 직접 접근 차단
- **결론**: **iframe 방식만 Spline의 보안 정책상 허용됨**
- **교훈**: 외부 3D 리소스는 제공 방식을 먼저 확인하고, 통합 방법은 공식 문서 우선.

### 성능 고려사항

- 외부 리소스 로딩으로 초기 속도에 영향 → `dynamic import` 또는 `loading="lazy"` 고려 가능
- 모바일에서는 별도 최적화 필요할 수 있음

---

## 📄 Pagination & Navigation

### Load More 버튼 (현재 구현)

- **목적**: 페이지 이동 없이 콘텐츠 누적 로딩으로 UX 개선
- **구현**:
  - `useState`로 `displayCount` 관리 (초기 20개)
  - "Load More (남은 개수)" 버튼 클릭 시 20개씩 추가
  - 기존 pagination (이전/다음 버튼) 완전 제거
- **효과**: 모바일 친화적, 컨텍스트 유지, 연속적인 읽기 플로우
- **Props 변경**: `paginatedNews`, `currentPage`, `totalPages` → `filteredNews`로 단순화
- **버튼 텍스트**: "Load More" (영어, UI 일관성)

### 네비게이션 최적화

- 모든 내부 `Link`에 `prefetch={true}` 적용 → 뷰포트 진입 시 다음 페이지 미리 로딩
- `scroll={false}` 적용 → 페이지 전환 시 불필요한 스크롤 점프 방지, 앱처럼 부드러운 전환

---

## 📊 Data Display & Layout

### 랜딩페이지 뉴스 표시

- **카테고리별 뉴스 개수**: **5개** (최종)
- **이유**: 스크롤 길이 감소, 정보 밀도와 가독성 균형
- **그리드**: 5열 레이아웃 (`2xl:grid-cols-5`)

### 트렌드 그래프 표시 규칙

- **랜딩페이지**: 표시 (isLandingPage 체크)
- **카테고리 페이지**: 숨김 (Load More로 인한 스크롤 고려)
- **구현**: `page.tsx`에서 `isLandingPage` 조건부 렌더링

### 트렌드 차트 설정 (중요!)

- **모드**: Overlay (누적 그래프 사용 금지 - 데이터 왜곡 방지)
- **투명도**: `fillOpacity: 0.15` 적용
- **레이어 순서**: 작은 값이 앞에 오도록 최적화
- **정렬**: API에서 빈도순 정렬 로직 제거, `constants.ts`의 고정 순서 준수

### 레이아웃 압축 (정보 밀도 증가)

#### 카테고리 페이지 (NewsRow)

- 패딩: `py-4 px-6` → `py-2 px-4` (50% 축소)
- 제목: `16px` → `14px`
- 요약: `13px` → `11px`
- 키워드: `8px` → `7px` → **11px** (최종)
- 간격: `gap-4` → `gap-2.5`

#### 랜딩 페이지 (NewsCard)

- 패딩 및 간격 최소화
- 폰트 크기 일관성 유지 (14px 제목)
- 정보 밀도 최대화하되 가독성 확보

**결과**: 약 40~50% 더 많은 뉴스를 한 화면에 표시 가능

---

## 🎨 Typography & Readability

### 텍스트 가독성 개선 (최종)

#### 제목

- **NewsCard & NewsRow**: `text-gray-100` → `text-white/90`
- **효과**: 더 밝고 명확하게, 오늘 날짜 아닌 뉴스도 충분히 눈에 잘 들어옴

#### 설명

- **랜딩페이지 NewsCard**: `text-white/40` → `text-white/55`
- **카테고리 NewsRow**: `text-white/35` → `text-white/55`
- **호버**: NewsCard `text-white/60` → `text-white/70`
- **효과**: 충분한 대비와 가독성 확보

#### 키워드

- **크기**: `7px` → `9px` → **11px** (최종)
- **색상 통일**:
  - 랜딩페이지: `text-blue-400/60`, `bg-blue-500/10` (파란색)
  - 카테고리 페이지: `text-white/15` → `text-blue-400/60` (파란색 통일)
- **효과**: 랜딩/카테고리 페이지 일관성, 키워드 가독성 극대화

#### Line Clamp

- 제목: 2줄 → 3줄 확장 (정보 전달력 강화)

### 대소문자 통일 (Typography Consistency)

- **문제**: 네비게이션은 대문자, 페이지 제목은 Capitalize로 불일치
- **해결**: 카테고리 페이지 제목에 `uppercase` 클래스 추가
- **결과**:
  - "Filler" → "FILLER"
  - "Market Intelligence" → "MARKET INTELLIGENCE"
  - 네비게이션과 페이지 제목 완벽 통일

---

## 🎭 Styling & Interactions

### NewsRow 배경 효과

- **기본 배경**: `bg-white/[0.02]` (미묘한 밝기)
- **호버 효과**:
  - 배경: `hover:bg-white/[0.05]` (더 밝게)
  - 크기: `hover:scale-[1.01]` (살짝 확대)
  - 전환: `duration-300` (부드러운 애니메이션)
- **효과**: 뉴스 항목 구분 명확, 프리미엄한 인터랙션

### Micro-interactions

- 뉴스 카드 호버 시 파란색 글로우 효과와 부드러운 스케일 변화 유지
- 'NEW' 배지: 빨간색 펄스 효과 (`animate-pulse`) - 랜딩/카테고리 페이지 통일

### Glassmorphism

- `glass-card`, `glass-panel` 유틸리티 적극 활용
- 블러 효과와 투명도로 프리미엄한 느낌 연출

---

## 🗂 Category & Classification

### Category 순서 (CRITICAL)

- **SSOT**: `constants.ts`의 `CATEGORIES_CONFIG`가 유일한 진실 공급원
- **금지**: `Object.keys()` 등 순서가 보장되지 않는 메서드 사용 금지
- **사용**: `CATEGORIES_CONFIG.map()` 사용하여 순서 보장

### 뉴스 분류 원칙 (2026-01-06 업데이트)

1. **DB category 우선**: 백엔드에서 이미 분류된 `article.category` 값이 있으면 그대로 사용
2. **제목에 카테고리 키워드** 있음 → 해당 **제품 카테고리 우선** (회사 개수 무관)
   - 예: "메디톡스 vs 대웅제약 **보톡스** 전쟁" → **Toxin** (회사 2개지만 "보톡스" 키워드)
   - 예: "휴젤, **필러** 시장 공략" → **Filler**
3. **기업명 단독 키워드** (제품 키워드 없음) → **Corporate News**
   - 해당 기업: 파마리서치, 휴젤, 메디톡스, 제테마, 대웅제약, 동국제약, 종근당, 휴메딕스, 휴온스, 케어젠, 갈더마, 멀츠, 앨러간, 시지바이오, 한스바이오메드, 원텍, 클래시스, 제이시스메디칼, 리투오
   - 예: "파마리서치, KLPGA 개막전 개최" → **Corporate News** (리쥬란 키워드 없음)
4. **키워드 리스트 업데이트**: 중복 여부 반드시 체크 (Live Monitoring 숫자: 173개)

### 카테고리 상세 페이지

- 트래킹 키워드 목록 표시 (`CATEGORIES_CONFIG.keywords`)
- 각 카테고리별 특성에 맞는 필터링 구현

---

## ⚡ Performance Optimization

### ISR 활성화

- **설정**: `page.tsx`에 `revalidate = 60` 설정
- **효과**: 1분 캐싱으로 체감 속도 대폭 향상
- **변경**: `lib/api.ts`의 `noStore()` 비활성화 → 데이터 캐싱 허용
- **주의**: 캐싱이 활성화되어도 방문자 추적(`HeaderStatus`)은 `use client` + API 호출 방식이라 영향 없음

### SWR (재확인)

- 클라이언트 사이드 캐싱으로 네비게이션 속도 극대화
- 1분마다 자동 갱신, 중복 요청 방지

### SEO & Performance

- 각 페이지별 메타 정보 최적화
- 이미지 Lazy Loading 기본 적용

---

## 📅 최근 업데이트 (Recent Updates)

### 2026-01-02: 사용성 개선 패치

#### 1. 랜딩페이지 시간 표시 추가

- **변경**: NewsCard 컴포넌트에 시간 표시 추가
- **위치**: `NewsListContainer.tsx` (214번 라인)
- **형식**: `01.02 15:30` (날짜 + 시간)
- **효과**: 카테고리 페이지와 동일한 정보 밀도, 뉴스 신선도 명확화

#### 2. 방문자수 IP 기준 집계

- **변경**: 중복 방문 제거, 고유 IP만 카운트
- **파일**: `pages/api/track-visit.ts`
- **Before**: 페이지 로드 횟수 (같은 사용자도 중복 카운트)
- **After**: 고유 방문자 수 (IP 기준 일일 1회)
- **로직**:
  - Visits_v2 시트에서 오늘 날짜 필터링
  - `Set`으로 고유 IP 개수 계산
  - DailyStats_v2에 저장
- **주의**: 날짜 포맷 매칭 (KST `YYYY-MM-DD` vs 시트 `YYYY. M. D.`)

#### 3. 트렌드 그래프 개선

- **변경**: Corporate News 제외, 시각화 강화
- **파일**: `TrendChartInner.tsx`
- **개선사항**:
  - 제품 카테고리만 표시 (7개 → 6개)
  - 색상 팔레트 개선 (더 선명한 대비)
  - 높이 증가 (`h-72` → `h-96`)
  - 데이터 포인트 표시 (`dot`, `activeDot`)
  - Y축 레이블 추가 ("뉴스 개수")
  - 그라데이션 투명도 조정 (0.6 → 0.05)
- **주의**: 데이터와 카테고리 모두 Corporate News 제거 필요

---

## ❌ 시도했으나 롤백한 기능 (Failed Attempts)

미래 작업 시 참고용 - **이 기능들은 사용자 선호도 미달로 제거됨**

### Animated Gradient Background

- 카테고리 페이지 제목 배경에 파란색/보라색 그라데이션 애니메이션
- **사유**: 과도한 장식, 깔끔함 우선

### Gradient Text Effect

- 제목 텍스트에 그라데이션 + 발광 효과
- **사유**: 가독성 저하, 불필요한 화려함

### 3D Tilt Effect

- 뉴스 카드 마우스 추적 3D 기울기 효과
- **사유**: 페이지 전반적으로 적용 시 어지러움

### Spline 네이티브 통합

- `@splinetool/react-spline` 사용한 직접 통합
- **사유**: 기술적 제약 (상세 내용은 "3D Integration" 섹션 참조)

---

## 🤖 AI 모델 추천 (UI/UX 작업용)

작업 종류에 따라 아래 모델들을 추천합니다:

| 작업 유형 | 추천 모델 | 이유 |
|----------|----------|------|
| **코딩 + UI 로직** | Claude 3.5 Sonnet / Claude 4 Sonnet | 코드 이해력 및 디자인 감각 우수 |
| **빠른 디자인 피드백** | GPT-4o | 멀티모달 지원, 이미지 분석 가능 |
| **CSS/스타일링** | Claude Sonnet | Tailwind, CSS 작업에 특화 |
| **UI 목업 생성** | Midjourney / DALL-E 3 | 비주얼 컨셉 빠르게 확인 |
| **복잡한 시스템 설계** | Claude 4 Opus | 장기 컨텍스트, 아키텍처 설계에 강점 |
