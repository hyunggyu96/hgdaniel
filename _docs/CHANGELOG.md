# 📝 변경 이력 (Changelog)

**프로젝트**: 뉴스 대시보드 백엔드  
**최종 업데이트**: 2026-01-04

---

## 2026-01-04

### 🔧 리팩토링

- **백엔드 가이드라인 재구성**
  - `BACKEND_GUIDELINES.md`: 592줄 → 150줄 (핵심만)
  - `TROUBLESHOOTING.md`: 트러블슈팅 사례집 분리
  - `CHANGELOG.md`: 변경 이력 분리
  - 목적: 긴급 상황 빠른 체크, AI 읽기 부담 감소

### ✅ 버그 수정

- **Google Sheets Warning 제거**
  - Grid ID 에러를 조용히 무시 (non-critical)
  - Supabase 저장 우선순위

---

## 2026-01-03

### 🚨 긴급 수정

- **Qwen 연결 실패 해결** (23:34 ~ 00:01)
  - 포트 불일치 문제 (11434 → 8080)
  - `collector/inference_engine.py` Line 57 수정
  - `collector/.env` OLLAMA_HOST 수정
  - 상세: `TROUBLESHOOTING.md` 섹션 1

### 🎯 최적화

- **GPU 하이브리드 모드 확정**
  - Qwen 2.5 7B: `-ngl 20` (최적값)
  - 성능: CPU 대비 2~3배 향상
  - 안정성: 시스템 크래시 방지

---

## 2026-01-02

### 🐛 버그 수정

- **keyword 필드 분류 오류**
  - 네이버 검색어 대신 AI 분석 결과 사용
  - `processor.py` Line 446 수정
  - 영향: 원텍 레이저 기사 17개
  - 상세: `TROUBLESHOOTING.md` 섹션 3

### 🔨 필터 강화

- **동음이의어 주의사항 추가**
  - "바임" = 의료기기 ✅ vs 노벨문학상 ❌
  - `BAD_KEYWORDS`에 문학 키워드 추가

---

## 2026-01-01

### 🚨 긴급 수정

- **프로세스 중복 사건**
  - 6개 중복 프로세스 발견
  - 로그 vs 실제 동작 불일치
  - 해결: 삼중 검증 프로토콜 도입
  - 상세: `TROUBLESHOOTING.md` 섹션 2

### ❌ DB 스키마 불일치

- **컬럼 누락 문제**
  - `ai_summary`, `issue_nature` 컬럼 없음
  - 임시: 코드에서 주석 처리
  - 영구 해결: SQL ALTER TABLE 필요
  - 상세: `TROUBLESHOOTING.md` 섹션 4

### 🎨 프론트엔드

- **V4.2 노이즈 필터 업데이트**
  - `CAR_BRANDS` 동기화 (백엔드 ↔ 프론트엔드)
  - 자동차 브랜드 원천 차단

---

## 2025-12-31

### 🔄 동기화 개선

- **Google Sheets Prepend 수정**
  - 최신 데이터 상단 배치 (역순 정렬)
  - `google-spreadsheet` v4 API 호환

---

## 2025-12-30

### 📱 태블릿 자동화

- **24/7 파이프라인 안정화**
  - Termux wakelock 적용
  - 스마트 스케줄링 (시간대별 폴링)
  - `start_tablet_solo.sh` 자동 정리 기능

---

## 2025-12-26

### 🔗 Google Sheets 통합

- **키워드 제안 시스템**
  - `키워드제안` 탭 생성
  - 중복 제안 시 누적 카운트

---

## 2025-12-24

### 🤖 AI 분석 개선

- **멀티 티어 Fallback**
  - Gemini → Claude → Qwen → Local
  - 70자 요약 규칙

### 📊 데이터 품질

- **중복 제거 로직**
  - 링크 + 제목 유사도 (85%)
  - Jaccard Similarity

---

## 주요 마일스톤

- **2025-12-31**: Google Sheets 완벽 동기화
- **2026-01-01**: 삼중 검증 프로토콜 도입
- **2026-01-02**: AI 분석 결과 우선순위 확립
- **2026-01-03**: Qwen GPU 하이브리드 모드 안정화
- **2026-01-04**: 문서 구조 개선 (가독성 ↑)

---

> 📌 **Convention**: 변경사항은 최신순 (위 → 아래)
