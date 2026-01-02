---
description: 태블릿 keyword 필드 분류 오류 수정 작업
---

# 🏠 태블릿 processor.py 수정 워크플로우

> **중요도**: ⭐⭐⭐ HIGH  
> **작업일**: 2026-01-02  
> **목표**: keyword 필드를 네이버 검색어가 아닌 AI 분석 결과로 저장하도록 개선

---

## 📋 작업 단계

### 1. 상세 가이드 확인

```bash
# 상세 가이드 열기
code _docs/TABLET_TODO.md
```

**설명**: 전체 작업 배경, 문제점, 해결 방법이 상세히 기록되어 있습니다.

---

### 2. 태블릿 SSH 접속

// turbo

```bash
ssh -p 8022 u0_a43@192.168.219.102
```

**비밀번호**: `aisapiens`

---

### 3. 최신 코드 동기화 (태블릿에서)

```bash
cd ~/news_dashboard
git fetch
git status
git pull
```

**확인 포인트**: 충돌 없이 `Already up to date` 또는 `Fast-forward` 메시지 확인

---

### 4. 백업 생성 (태블릿에서)

// turbo

```bash
cd ~/news_dashboard/collector
cp processor.py processor.py.backup_$(date +%Y%m%d_%H%M%S)
```

---

### 5. processor.py 수정 (태블릿에서)

**파일**: `collector/processor.py`

#### 변경 1: keyword 필드 (446번 라인)

```python
# 수정 전
"keyword": keyword,

# 수정 후  
"keyword": final_main,
```

#### 변경 2: BAD_KEYWORDS에 문학 필터 추가 (120번 라인)

```python
# 수정 전
BAD_KEYWORDS = [
    ...,
    "디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아"
]

# 수정 후 (마지막에 문학 키워드 추가)
BAD_KEYWORDS = [
    ...,
    "디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아",
    "작가", "문학", "소설", "출판", "노벨문학상", "포세"  # 문학
]
```

**방법 1 - Nano 에디터**:

```bash
nano collector/processor.py
# Ctrl+W로 검색 → 수정 → Ctrl+O (저장) → Ctrl+X (종료)
# 두 곳 모두 수정해야 함!
```

**방법 2 - sed 명령어 (두 줄 실행)**:

```bash
sed -i 's/"keyword": keyword,/"keyword": final_main,/' collector/processor.py
sed -i 's/"디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아"/"디지털키", "파노라마디스플레이", "전동화", "테슬라", "현대차", "기아",\n    "작가", "문학", "소설", "출판", "노벨문학상", "포세"/' collector/processor.py
```

---

### 6. 변경 사항 확인 (태블릿에서)

// turbo

```bash
grep -n "keyword.*final_main" collector/processor.py
```

**기대 결과**: `446:    "keyword": final_main,` 같은 라인이 표시되어야 함

---

### 7. 프로세스 재시작 (태블릿에서)

```bash
pkill python
sleep 3
bash start_tablet_solo.sh
```

**확인**: "Starting collector..." 및 "Starting processor..." 메시지 확인

---

### 8. 로그 모니터링 (태블릿에서)

```bash
tail -f processor.log
```

**확인 포인트**:

- 에러 메시지 없음
- 새 기사 처리 로그 정상 출력
- Ctrl+C로 종료

---

### 9. PC에서 결과 검증

// turbo

```bash
python check_articles.py
```

**확인**: 새로 처리된 기사의 keyword 필드가 올바르게 설정되었는지 확인

---

### 10. 작업 결과 처리

#### ✅ 작업 성공 시 (완료)

// turbo

```bash
# 알림 파일과 TODO 삭제
rm ❗TABLET_WORK_PENDING.md _docs/TABLET_TODO.md
```

또는 아카이브 (기록 보관):

```bash
mkdir -p _docs/archive
mv _docs/TABLET_TODO.md _docs/archive/TABLET_TODO_DONE_$(date +%Y%m%d).md
rm ❗TABLET_WORK_PENDING.md
```

---

#### ⏸️ 작업 보류 또는 실패 시 (중요!)

**절대 강제로 파일을 삭제하지 마세요!** 대신 코멘트를 남깁니다:

```bash
# 알림 파일에 보류 사유 추가
echo "" >> ❗TABLET_WORK_PENDING.md
echo "---" >> ❗TABLET_WORK_PENDING.md
echo "## ⏸️ 작업 보류" >> ❗TABLET_WORK_PENDING.md
echo "**일시**: $(date +%Y-%m-%d\ %H:%M:%S)" >> ❗TABLET_WORK_PENDING.md
echo "**사유**: [여기에 이유 작성]" >> ❗TABLET_WORK_PENDING.md
echo "" >> ❗TABLET_WORK_PENDING.md
```

**보류 사유 예시**:

- SSH 접속 실패 (태블릿 네트워크 문제)
- git pull 충돌 발생 (수동 해결 필요)
- 프로세스 재시작 후 에러 (백업으로 복원함)
- 시간 부족 (나중에 다시 시도)

**다음 작업 시**: 알림 파일에 기록된 보류 사유를 읽고 문제 해결 후 재시도

---

## ✅ 완료 기준

- [ ] processor.py 수정 완료 (keyword 필드 + BAD_KEYWORDS)
- [ ] 프로세스 재시작 성공
- [ ] 로그에 에러 없음
- [ ] 새 기사가 올바른 카테고리로 분류됨
- [ ] 문학/출판 뉴스가 차단되는지 확인
- [ ] 알림 파일 처리 (삭제 또는 보류 코멘트)

---

## 🚨 문제 발생 시

### 문제 1: SSH 접속 안 됨

**원인**: 태블릿 IP 변경 또는 Termux 종료  
**해결**: 태블릿에서 Termux 앱 실행 후 `sshd` 재시작

### 문제 2: git pull 충돌

**원인**: 태블릿과 PC 코드 불일치  
**해결**:

```bash
git stash
git pull
git stash pop
```

### 문제 3: 프로세스 재시작 후 에러

**원인**: 문법 오류  
**해결**: 백업 파일로 복원 후 다시 수정

```bash
cp processor.py.backup_* processor.py
```

---

**워크플로우 실행 방법**: `/tablet-fix` 명령어 입력
