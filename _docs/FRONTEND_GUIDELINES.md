# 🌌 News Dashboard Front-end Guidelines

이 문서는 프로젝트의 UI/UX 일관성과 프론트엔드 개발 효율을 위해 작성되었습니다. 모든 프론트엔드 작업 시 이 가이드를 최우선으로 준수합니다.

## 🎨 디자인 철학 (Design Philosophy)

- **Concept**: Premium, Modern, Aesthetics Intelligence.
- **Inspiration**: Toss 앱의 심플함과 애플의 세련된 마이크로 인터렉션.
- **Theme**: 고도화된 다크 모드 (Deep Navy/Black 기반).
- **Core Styles**:
  - **Glassmorphism**: `glass-card`, `glass-panel` 유틸리티 적극 활용 (블러 및 투명도).
  - **Premium Blue**: `#3182f6` (Toss Blue) 컬러를 포인트로 사용.
  - **Layout**: 데스크탑 기준 **5열 그리드** (`2xl:grid-cols-5`) 확장형 레이아웃 적용.

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js 14 (App Router).
- **Styling**: Tailwind CSS.
- **Animation**: Framer Motion (Staggered Fade-in 효과 중심).
- **Components**: Radix UI, Lucide React (Icons).

## 🚀 개발 규칙 (Development Rules)

1. **Server/Client Separation (CRITICAL)**: `framer-motion`과 같은 브라우저 전용 라이브러리는 서버 컴포넌트(`NewsList`)에서 직접 사용할 수 없음. 반드시 `"use client"`가 선언된 `NewsListContainer` 등으로 분리하여 데이터를 Props로 전달할 것. (런타임 에러 방지)
2. **Type Safety**: Next.js 빌드 시 `Optional Props`(`searchQuery`, `selectedCategory` 등)는 반드시 `|| null` 혹은 `|| false` 처리를 통해 명시적인 값을 전달해야 빌드 실패를 방지할 수 있음.
3. **Micro-interactions**: 뉴스 카드 호버 시 파란색 글로우 효과와 부드러운 스케일 변화를 유지한다.
4. **SEO & Performance**: 각 페이지별 메타 정보 최적화 및 이미지 Lazy Loading을 기본으로 한다.

## 📌 주요 결정 사항 및 트러블슈팅 (History)

- **2025-12-31**:
  - [Layout] 랜딩 페이지 그리드 3열에서 5열로 확장 완료.
  - [UI] Glassmorphism 전면 도입 및 `framer-motion` 애니메이션 적용.
  - [Bugfix] 서버 사이드 예외(framer-motion 충돌) 해결을 위해 `NewsListContainer`(Client) 분리 구조 도입.
  - [Bugfix] 빌드 시 `Type Error` 발생 건 해결 (SelectedCategory 등 Props 캐스팅 처리).
  - [Visualization] **Trend Chart 개선**:
    - 누적(Stacked) 그래프 사용 금지 → **Overlay 모드** 사용 (데이터 왜곡 방지).
    - 투명도(`fillOpacity: 0.15`) 적용 및 작은 값이 앞에 오도록 레이어 순서 최적화.
    - API에서 빈도순 정렬 로직 제거, `constants.ts`의 고정 순서 준수.
  - [Ordering] **Category 순서**:
    - `constants.ts`를 유일한 진실 공급원(SSOT)으로 사용.
    - `Object.keys()` 등 순서가 보장되지 않는 메서드 사용 금지 → `CATEGORIES_CONFIG.map()` 사용.
  - [Classification Rules] **뉴스 분류 원칙 (2025-12-31 업데이트)**:
    - **단일 회사명**만 등장 시 → `Corporate News`.
    - **브랜드 + 회사명** 등장 시 → 해당 제품 카테고리(`Product Category`) 우선 (예: 휴젤 보툴렉스 → Toxin).
    - **다수 회사명(2개 이상)** 등장 시 → `Corporate News` (시장 동향/분쟁 이슈로 간주).
    - 키워드 리스트 업데이트 시 중복 여부 반드시 체크 (Live Monitoring 숫자: 114개).
  - [Performance] **성능 최적화 (중요!)**:
    - **ISR 활성화**: `page.tsx`에 `revalidate = 60` 설정 → 1분 캐싱으로 체감 속도 대폭 향상.
    - `lib/api.ts`의 `noStore()` 비활성화 → 데이터 캐싱 허용.
    - **주의**: 캐싱이 활성화되어도 방문자 추적(`HeaderStatus`)은 `use client` + API 호출 방식이라 영향 없음.
  - [Navigation] **네비게이션 최적화**:
    - 모든 내부 `Link`에 `prefetch={true}` 적용 → 뷰포트 진입 시 다음 페이지 미리 로딩.
    - `scroll={false}` 적용 → 페이지 전환 시 불필요한 스크롤 점프 방지, 앱처럼 부드러운 전환.
  - [Readability] **뉴스 가독성 개선**:
    - 제목 폰트: `13px` → `15px`로 확대, 색상 `white/70` → `gray-100` 밝게.
    - `line-clamp`: 2줄 → 3줄로 확장하여 정보 전달력 강화.
    - 카테고리 상세 페이지: 트래킹 키워드 목록 복원 (`CATEGORIES_CONFIG.keywords` 표시).
    - 'NEW' 배지 디자인 통일: 랜딩/카테고리 페이지 모두 빨간색 펄스 효과 적용.
  - [Hero] **Spline 3D 주의사항**:
    - 랜딩 페이지 Hero에 `iframe`으로 Spline 3D 로봇 임베드 중.
    - 외부 리소스 로딩으로 초기 속도에 영향 → `dynamic import` 또는 `loading="lazy"` 고려 가능.
    - 모바일에서는 별도 최적화 필요할 수 있음.
  - [Architecture] **🚨 SWR 도입 (중요한 아키텍처 변경!)**:
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
  - [Layout] **레이아웃 압축 최적화 (정보 밀도 증가)**:
    - **목표**: 같은 화면에 더 많은 뉴스 표시, 스크롤 최소화.
    - **카테고리 페이지 (`NewsRow`) 압축**:
      - 패딩: `py-4 px-6` → `py-2 px-4` (50% 축소)
      - 제목: `16px` → `14px`
      - 요약: `13px` → `11px`
      - 키워드: `8px` → `7px`
      - 간격: `gap-4` → `gap-2.5`
    - **랜딩 페이지 (`NewsCard`) 압축**:
      - 패딩 및 간격 최소화
      - 폰트 크기 일관성 유지 (14px 제목)
      - 정보 밀도 최대화하되 가독성 확보
    - **결과**: 약 40~50% 더 많은 뉴스를 한 화면에 표시 가능.

## 🤖 AI 모델 추천 (UI/UX 작업용)

작업 종류에 따라 아래 모델들을 추천합니다:

| 작업 유형 | 추천 모델 | 이유 |
|----------|----------|------|
| **코딩 + UI 로직** | Claude 3.5 Sonnet / Claude 4 Sonnet | 코드 이해력 및 디자인 감각 우수 |
| **빠른 디자인 피드백** | GPT-4o | 멀티모달 지원, 이미지 분석 가능 |
| **CSS/스타일링** | Claude Sonnet | Tailwind, CSS 작업에 특화 |
| **UI 목업 생성** | Midjourney / DALL-E 3 | 비주얼 컨셉 빠르게 확인 |
| **복잡한 시스템 설계** | Claude 4 Opus | 장기 컨텍스트, 아키텍처 설계에 강점 |
