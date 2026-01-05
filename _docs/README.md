# 📰 Hybrid AI News Dashboard (Legion Y700 + Next.js)

**Market Intelligence Platform powered by Local AI**

이 프로젝트는 태블릿(Android Termux) 내의 로컬 AI가 24/7 뉴스를 수집/분석하고, Next.js 웹사이트가 이를 시각화하는 하이브리드 시스템입니다.

🌐 **공식 서비스**: [https://aesthetics-intelligence.vercel.app/](https://aesthetics-intelligence.vercel.app/)

---

## 📚 문서 구조 (Documentation Map)

| 문서 | 용도 | 중요도 |
|------|------|--------|
| **[BACKEND_GUIDELINES.md](./BACKEND_GUIDELINES.md)** | 백엔드 운영, 노이즈 필터링, 태블릿 관리 | ⭐⭐⭐⭐⭐ |
| **[FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md)** | UI/UX 디자인, 컴포넌트, 카테고리 분류 | ⭐⭐⭐⭐ |
| **[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** | 전체 시스템 구조, 데이터 흐름도 | ⭐⭐⭐⭐ |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 문제 해결 사례집 | ⭐⭐⭐ |
| [CHANGELOG.md](./CHANGELOG.md) | 변경 이력 | ⭐⭐ |
| [backend-ops.md](./backend-ops.md) | 태블릿 운영 4대 철칙 (워크플로우) | ⭐⭐⭐ |
| [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md) | GA4 설정 가이드 | ⭐ |
| [archive/](./archive/) | 완료된 작업 기록 보관 | - |

---

## 🚀 빠른 시작 (Quick Start)

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

## 🔑 핵심 파일 위치

| 파일 | 용도 |
|------|------|
| `_shared/keywords.json` | 키워드 SSOT (단일 진실 공급원) |
| `collector/.env` | 수집 키워드, API 키 |
| `collector/processor.py` | 뉴스 분석/필터링 엔진 |
| `web/src/lib/constants.ts` | 프론트엔드 카테고리 분류 |

---

## ⚠️ 핵심 주의사항

1. **키 파일 관리**: `service_account.json`, `.env` 등은 절대 GitHub에 올리지 않습니다.
2. **PowerShell**: `&&` 연산자 사용 금지 → `;` 사용
3. **한자/일어 제거**: 모든 데이터는 저장 전 엄격한 언어 필터링을 거칩니다.

---

**Last Updated**: 2026-01-06 (v3.3)
