# Google Analytics 4 설정 가이드

## 📊 Google Analytics 4 계정 생성

### 1. Google Analytics 접속
<https://analytics.google.com>

### 2. 계정 생성

1. 좌측 하단 톱니바퀴 (관리) 클릭
2. "계정 만들기" 선택
3. 계정 이름: `Aesthetic Intelligence`
4. 데이터 공유 설정: 원하는 대로 선택
5. "다음" 클릭

### 3. 속성 만들기

1. 속성 이름: `News Dashboard`
2. 보고 시간대: `(GMT+09:00) 서울`
3. 통화: `대한민국 원 (₩)`
4. "다음" 클릭

### 4. 비즈니스 정보 (선택사항)

- 업종: `기타`
- 비즈니스 규모: 적절한 것 선택
- "다음" 클릭

### 5. 비즈니스 목표 (선택사항)

- 원하는 목표 선택 또는 스킵
- "만들기" 클릭

### 6. 웹 스트림 설정

1. "웹" 선택
2. 웹사이트 URL: `https://aesthetics-intelligence.vercel.app`
3. 스트림 이름: `Main Website`
4. "스트림 만들기" 클릭

### 7. 측정 ID 복사

- 생성된 화면에서 **측정 ID** 확인 (형식: `G-XXXXXXXXXX`)
- 이 ID를 복사합니다

---

## ⚙️ 프로젝트 설정

### 1. 로컬 환경 (.env.local)

웹 폴더의 `.env.local` 파일에 측정 ID 추가:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Vercel 환경 변수 설정

1. Vercel 대시보드 접속: <https://vercel.com>
2. 프로젝트 선택 (`aesthetics-intelligence`)
3. **Settings** → **Environment Variables** 클릭
4. 새 변수 추가:
   - **Name**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX` (복사한 측정 ID)
   - **Environment**: `Production`, `Preview`, `Development` 모두 체크
5. **Save** 클릭

### 3. 배포

환경 변수를 추가한 후, 변경사항을 푸시하면 자동 배포됩니다:

```bash
git add .
git commit -m "feat: add Google Analytics 4"
git push
```

또는 Vercel 대시보드에서 **Deployments** → **Redeploy** 클릭

---

## ✅ 작동 확인

### 1. 실시간 확인

1. Google Analytics 대시보드 접속
2. 좌측 메뉴에서 **보고서** → **실시간** 클릭
3. 웹사이트 방문
4. 실시간 사용자 수가 표시되는지 확인

### 2. 디버그 모드 (개발 환경)

브라우저 콘솔에서 확인:

```javascript
// GA4가 로드되었는지 확인
console.log(window.gtag);  // function이 출력되어야 함
```

---

## 📊 주요 지표 확인

### 대시보드에서 볼 수 있는 데이터

- ✅ **실시간 사용자**: 현재 접속 중인 사용자
- ✅ **페이지뷰**: 페이지 조회 수
- ✅ **세션**: 방문 세션 수
- ✅ **이벤트**: 클릭, 스크롤 등 사용자 행동
- ✅ **국가/도시**: 사용자 위치
- ✅ **기기**: 데스크톱/모바일/태블릿
- ✅ **브라우저**: Chrome, Safari 등

### 맞춤 보고서 설정 (선택)

1. 좌측 메뉴 → **탐색** 클릭
2. 템플릿 선택 또는 빈 보고서 생성
3. 원하는 측정기준과 측정항목 추가

---

## 🔒 프라이버시 설정 (GDPR 대응)

### Cookie Banner (선택사항)

유럽 사용자가 있다면 쿠키 동의 배너 권장:

```bash
npm install @cookiebot/react
```

또는 간단하게:

```tsx
// 약관 페이지에 명시
<p>본 사이트는 Google Analytics를 사용합니다.</p>
```

---

## 🚫 기존 track-visit API 제거 (선택)

Google Analytics로 전환하면 기존 Google Sheets API는 불필요합니다:

### 삭제 가능한 파일

- `web/src/pages/api/track-visit.ts` (방문 추적 API)
- `web/src/components/HeaderStatus.tsx` (방문자수 표시) - 또는 GA에서 가져온 숫자로 대체

### HeaderStatus 대안

```tsx
// GA4의 실시간 API를 사용하거나
// 단순히 "활성 사용자" 텍스트만 표시
export default function HeaderStatus() {
  return (
    <div className="text-xs text-white/40">
      <span className="text-green-400">●</span> Live
    </div>
  );
}
```

---

## 📞 문제 해결

### GA가 작동하지 않는 경우

1. ✅ `.env.local`에 `NEXT_PUBLIC_GA_ID` 추가했는지 확인
2. ✅ Vercel 환경 변수 설정했는지 확인
3. ✅ 재배포 했는지 확인
4. ✅ 광고 차단기 비활성화 후 테스트
5. ✅ 측정 ID 형식 확인 (`G-`로 시작)

### 데이터가 표시되지 않는 경우

- GA4는 데이터 수집 후 **24시간 뒤부터** 일부 보고서에 표시됩니다
- **실시간 보고서**는 즉시 표시됩니다

---

**작성일**: 2026-01-02
