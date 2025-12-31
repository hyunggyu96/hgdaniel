# 📰 Hybrid AI News Dashboard (Legion Y700 + Next.js)

**Market Intelligence Platform powered by Local AI**

이 프로젝트는 태블릿(Android Termux) 내의 로컬 AI가 24/7 뉴스를 수집/분석하고, Next.js 웹사이트가 이를 시각화하는 하이브리드 시스템입니다.

---

## 📚 1. 필독 가이드라인 (Must Read)

**이 시스템을 유지보수하거나 수정하려는 AI/개발자는 다음 문서를 반드시 먼저 정독하십시오.**

### 🛠️ [백엔드 가이드라인 (BACKEND_GUIDELINES.md)](./BACKEND_GUIDELINES.md)
>
> **핵심 중요도: ⭐⭐⭐⭐⭐**
>
> - **인증(Auth)**: Vercel 환경변수 대신 **Base64 하드코딩** 방식을 사용합니다. (필독!)
> - **데이터(Data)**: 구글 시트(`Visits_v2`, `UserCollections_v2`) 스키마 정의.
> - **운영(Ops)**: 태블릿 프로세스(`start_tablet_solo.sh`) 관리 및 문제 해결 로그.

### 🎨 [프론트엔드 가이드라인 (FRONTEND_GUIDELINES.md)](./FRONTEND_GUIDELINES.md)
>
> - **UI/UX**: 디자인 원칙, 컴포넌트 구조, 테마 설정.
> - **State**: `UserContext`, `CollectionContext` 등 상태 관리 로직.

### 🏗️ [시스템 아키텍처 (SYSTEM_ARCHITECTURE.md)](./SYSTEM_ARCHITECTURE.md)
>
> - 전체 데이터 흐름도 및 기술 스택(Supabase, Firebase, Ollama) 명세.

---

## 🚀 2. 빠른 시작 (Quick Start)

### 태블릿 (Collector & Processor)

```bash
# Termux 접속 후
bash start_tablet_solo.sh
```

### 웹사이트 (Frontend)

```bash
cd web
npm run dev
```

---

## ⚠️ 3. 핵심 주의사항 (Critical Warning)

1. **키 파일 관리**: `service_account.json`, `.env` 등은 절대 GitHub에 올리지 않습니다.
2. **시트 무결성**: 구글 시트가 꼬이면 디버깅보다 **V2 시트 생성**이 더 빠릅니다. 가이드라인을 참조하세요.
3. **한자/일어 제거**: 모든 데이터는 저장 전 엄격한 언어 필터링을 거쳐야 합니다.

---

**Last Updated**: 2025-12-31 (v2.1 Stable)
