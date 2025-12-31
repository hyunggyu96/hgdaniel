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
