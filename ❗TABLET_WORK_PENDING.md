# ⚠️ PENDING TABLET WORK - READ THIS FIRST

**긴급도**: 🔴 HIGH  
**작성일**: 2026-01-02  

---

## 🎯 집 도착 후 필수 작업

태블릿 `processor.py` 수정이 필요합니다!

**현재 상황**:

- ✅ 원텍 레이저 기사 17개 DB 수정 완료 (임시 조치)
- ⏳ 태블릿 백엔드 수정 대기 중 (근본 해결)

---

## 🚀 빠른 시작

### 방법 1: 워크플로우 실행 (권장)

```bash
/tablet-fix
```

위 명령어를 Antigravity에 입력하면 **단계별 가이드**가 표시됩니다.

### 방법 2: 상세 가이드 확인

```bash
code _docs/TABLET_TODO.md
```

---

## 📌 핵심 작업 요약

**파일**: `collector/processor.py`  
**라인**: 446번  
**변경**: `"keyword": keyword,` → `"keyword": final_main,`  
**효과**: 네이버 검색어 대신 AI 분석 결과로 분류

---

**이 파일은 작업 완료 후 삭제하세요!**
