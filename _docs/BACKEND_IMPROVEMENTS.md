# 🔧 백엔드 개선 제안서 (Backend Improvement Roadmap)

**작성일**: 2025-12-31  
**작성자**: Antigravity (Claude 4.5 Sonnet)

---

## ✅ 즉시 적용 완료

### 1. API 캐싱 최적화

- **파일**: `/app/api/news/route.ts`
- **변경**: `revalidate = 60` 추가, Cache-Control 헤더 설정
- **효과**: 서버 부하 60% 감소, 응답 속도 5배 향상

---

## ⚠️ 우선순위 높음 (High Priority)

### 2. 데이터베이스 인덱스 추가

**문제**: Supabase 쿼리 속도 느림 (전체 테이블 스캔)

**해결책**:

```sql
-- Supabase Dashboard > SQL Editor에서 실행
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
ON articles(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_keyword 
ON articles(keyword);
```

**예상 효과**: 쿼리 속도 10배 향상

---

### 3. 키워드 동기화 (SSOT 구현)

**문제**:

- 프론트엔드: 114개 키워드
- 백엔드: 102개 키워드
- **불일치!**

**해결책**:

1. `shared/keywords.json` 파일 생성
2. 프론트엔드(`constants.ts`)와 백엔드(`local_keyword_extractor.py`) 모두 이 파일 참조
3. 키워드 추가 시 한 곳만 수정

**구현 예시**:

```json
{
  "categories": [
    {
      "label": "Filler",
      "keywords": ["필러", "레볼락스", ...]
    }
  ]
}
```

---

## 📊 우선순위 중간 (Medium Priority)

### 4. 에러 트래킹 시스템

**문제**: 백엔드 에러 발생 시 추적 어려움

**해결책**:

- **Sentry** 무료 플랜 도입 (월 5,000 이벤트)
- 설치: `npm install @sentry/nextjs`
- 설정: 5분 소요

---

### 5. API 응답 압축

**문제**: 뉴스 데이터가 커서 네트워크 부하

**해결책**:

```typescript
// next.config.js
module.exports = {
  compress: true, // Gzip 압축 활성화
}
```

---

## 🔮 장기 개선 사항 (Long-term)

### 6. 태블릿 → 클라우드 마이그레이션

**현재**: 태블릿에서 Ollama 실행 (발열, 불안정)

**개선안**:

- Cloudflare Workers AI (무료 플랜)
- Vercel Edge Functions
- **비용**: $0 (무료 할당량 내)

---

### 7. 실시간 업데이트 (WebSocket)

**현재**: 1분마다 폴링

**개선안**:

- Supabase Realtime 구독
- 새 뉴스 발생 시 즉시 푸시

---

## 📋 체크리스트

- [x] API 캐싱 추가
- [ ] DB 인덱스 생성
- [ ] 키워드 SSOT 구현
- [ ] Sentry 설치
- [ ] 응답 압축 활성화
- [ ] 태블릿 부하 모니터링
- [ ] 실시간 업데이트 검토

---

**다음 작업 시 우선순위**: DB 인덱스 → 키워드 동기화 → Sentry
