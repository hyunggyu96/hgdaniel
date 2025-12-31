# ⚙️ News Dashboard 백엔드 통합 가이드라인 (Legion Y700 최적화)

> [!IMPORTANT]
> **백엔드 제1원칙 (The First Principle)**
> 인공지능(AI)과 개발자는 모든 백엔드 관련 명령을 수행하기 전, **본 가이드라인을 반드시 1회 정독**한다.

---

## 🚨 0. 절대 준수 및 금지 사항 (Critical Restrictions)

작업 시작 전 이 섹션을 가장 먼저 확인하십시오.

1. **명령어 연결 연산자**: Windows PowerShell 환경에서 명령어 연결 시 **`&&`를 절대 사용하지 마십시오.** 대신 **`;`**를 사용해야 합니다.
2. **태블릿 인터랙션**: `screencap`(스크린샷)이나 `input text`(키 입력) 등 태블릿 화면에 영향을 주는 작업은 **반드시 사용자에게 먼저 묻고 허가를 받은 뒤 실행**하십시오. 임의로 실행하는 것은 금지됩니다.
3. **환경 상태 확인**: 새로운 패키지를 설치하거나 코드를 실행하기 전, 현재 설치 상태를 먼저 확인하고 사용자에게 보고하십시오.

---

## 📱 1. 인프라 및 환경 (Infrastructure)

새로운 주의사항이나 합의된 규칙이 발생할 경우, 즉시 본 문서의 **'7. 트러블슈팅 히스토리'** 섹션에 기록하여 맥락을 보존한다.

---

---

우리 시스템은 안정성을 위해 여러 클라우드 서비스를 분산 활용합니다.

- **데이터 저장 (Main)**: Supabase (PostgreSQL)
  - **장치**: Legion Y700 2nd Gen (Z4 Pro)
  - **CPU**: Snapdragon 8+ Gen 1 (고성능 모델, AI 분석 시 CPU 100% 점유)
  - **RAM**: 12GB LPDDR5X (넉넉한 자원, Ollama와 다중 스크립트 병렬 구동 최적)
  - **특징**: 8인치 소형 기기로 고부하 작업 시 쓰로틀링(Throttling) 발생 가능.
  - `raw_news`: 수집된 원본 데이터 (Status: pending/processed)
  - `articles`: AI 분석이 완료된 정제 데이터
- **OS**: Termux Environment (Stable version)
  - `heartbeats`: 시스템 가동 상태 로그
  - `critical_alerts`: 긴급 장애 발생 알림
- **대시보드 (Display)**: Google Sheets
  - 실시간으로 큐레이팅된 뉴스를 엑셀 형태로 시각화
- **AI 엔진**: Ollama (`llama3.2:3b`) locally on Tablet

---

## 🔒 2. 외부 서비스 연결 및 보안 (External Services)

### ☁️ Supabase & Database Flow

- **연합 구조**: `async_collector.py`가 날것의 뉴스를 `raw_news`에 넣으면, `processor.py`가 이를 가져와 분석 후 `articles`와 구글 시트로 뿌려줍니다.
- **주의**: `raw_news`의 `status` 컬럼은 분석 완료 시 반드시 `processed`로 업데이트되어야 무한 분석 루프를 방지할 수 있습니다.

### 📊 Google Sheets API

- **인증**: `collector/service_account.json`은 절대 노출 금지 및 위치 고수.
- **할당량 (Quota)**: Google Sheets API는 쓰기 제한이 엄격합니다. `processor.py` 내의 `asyncio.sleep(1)`은 이를 방지하기 위한 최소한의 안전장치이므로 제거하지 마세요.

---

### 🔑 API Keys 및 환경 변수

- **관리**: `.env` 파일은 절대 Git에 포함시키지 말 것. (태블릿 내 로컬 보관)
- **멀티 키**: `GEMINI_API_KEY`와 `GEMINI_API_KEY_2`를 배열로 관리하여 하나가 차단(429)되어도 폴백이 가능하도록 유지.

### 🐙 GitHub & Automation (CI/CD)

- **Repository**: 모든 코드는 GitHub 원격 저장소(`hgdaniel`)와 동기화되어야 함.
- **GitHub Actions**:
  - `.github/workflows/email_report.yml`: 매 2시간마다 `report_generator.py`를 실행하여 이메일 보고서를 발송.
  - **Secrets**: 관련 API 키 및 SMTP 비번은 GitHub Settings > Secrets에 안전하게 보관됨.
- **Commit Convention**: 히스토리 가독성을 위해 접두사 사용 준수 (`feat`, `fix`, `chore`).

---

## 🛡️ 4. 보안 및 GitHub 동기화 규칙 (Security & Sync)

### 🔒 보안의 핵심: `.gitignore`

- **파일 보호**: `.env`, `service_account.json`, `*.log` 등 모든 민감 정보와 개인 키는 `.gitignore`에 등록되어 **GitHub 서버에 절대 업로드되지 않습니다.**
- **안전성**: GitHub에는 순수 소스 코드(뼈대)만 존재하며, 실제 작동에 필요한 열쇠(Key)는 오직 태블릿과 PC 내부에만 로컬로 보관됩니다.

### 🔄 GitHub → 태블릿 동기화 워크플로우

1. **PC 수정**: 로컬 워크스페이스에서 코드나 가이드라인을 수정합니다.
2. **Push**: `git push origin main`으로 수정사항을 GitHub에 올립니다.
3. **Tablet Pull**: 태블릿 Termux에서 다음 명령어로 최신화합니다.

   ```bash
   git pull origin main
   ```

4. **결과**: PC에서 작성한 최신 가이드라인과 분석 로직이 즉시 태블릿에 반영됩니다. (ADB 연결 불요)

---

## 🛠 3. 핵심 파일 및 관리 (Critical Files)

- **`.env`**: API 키 및 검색 키워드(`KEYWORDS`) 관리. 수정 후 반드시 프로세스 재시작 필요.
- **`last_update.json`**: 시스템의 **심장박동(Heartbeat)** 및 **수집 기준점**.
  - 수집기(`async_collector.py`)가 마지막으로 읽은 시간을 기록하여 중복 수집을 방지합니다.
  - 이 파일이 삭제되면 아주 오래전 데이터부터 다시 수집을 시작하여 토큰 낭비가 발생합니다.

---

## 🧹 4. 데이터 정제 및 보정 (Data Hygiene)

### 🚫 비토종 문자(일어/한자) 완전 제거 (Nuclear Clean)

- **원칙**: 구글 시트 대시보드는 **한국어(한글), 영어, 숫자**만 허용합니다.
- **제거 대상**:
  - **한자(Hanja)**: Unicode `\u4e00-\u9fff` 전역 제거.
  - **일어(Japanese)**: 히라가나(`\u3040-\u309f`), 가타카나(`\u30a0-\u30ff`) 전역 제거.
  - **특수 기호**: 제어 문자 및 불필요한 특수 기호 제거 (기본 문장 부호 제외).
- **정규식**: `re.sub(r'[\\u4e00-\\u9fff]', '', text)`를 통해 모든 한자를 제거합니다.

### 🎯 키워드 추출 정밀도 (Precision Tagging)

- **원칙**: 양보다 질입니다. 기사의 핵심과 관련 없는 부수적인 키워드 남발을 금지합니다.
- **AI 필터링**: `included_keywords`는 기사의 핵심 주제와 직접 관련된 항목 2~4개로 제한합니다.
- **로컬 필터링**: 본문 빈도수 기반 로컬 키워드 추출도 상위 5개(기존 10개)로 축소하여 분석 노이즈를 줄입니다.

---

## 🚀 5. 운영 및 유지보수 (Maintenance)

### 🔧 유지보수 및 감사 스크립트 (Audit Tools)

문제가 발생하거나 데이터 품질을 점검할 때 다음 스크립트를 활용하세요.

1. **`diagnose.py`**: 전체 시스템(Vercel, Supabase, Firebase, GSheets)의 연결 상태를 한눈에 진단합니다.
2. **`check_integrity.py`**: 구글 시트의 최신 데이터를 스캔하여 **한자 포함 여부, AI 오타(휴zel), 빈 요약본** 등 무결성 항목을 전수 조사합니다. (데이터 깨짐 확인용)
3. **`organize_sheet.py`**: 구글 시트의 데이터를 링크 기준으로 중복 제거하고 발행 시간순으로 자동 정렬합니다.
4. **`health_check.py`**: 웹 사이트 응답 속도를 체크하고 Firestore에 상태를 기록합니다.

### 🔄 재가동 워크플로우 (Stop & Start)

1. **중단**: `ps -ef | grep python`으로 프로세스 확인 후 `kill` 혹은 `Ctrl+C`.
2. **실행**: `bash start_tablet_solo.sh` 명령어로 Ollama와 수집기 세트를 일괄 가동합니다.

---

## 📌 6. 핵심 주의사항 (Precautions)

- **CPU 사용량**: Y700은 성능이 좋지만 AI 분석 시 CPU를 100% 사용합니다. 충전 시 발열에 주의하세요.
- **타임아웃**: 태블릿 환경에서 Ollama 응답은 PC보다 느리므로 **120초** 설정을 반드시 유지하세요.
- **리셋 방지**: 라이브러리가 이미 설치된 상태라면 무의미한 `pip install` 반복을 피하세요 (토큰 및 시간 낭비).
- **맥락 보존**: 모든 대화에서 결정된 백엔드 규칙은 휘발되지 않도록 이 가이드라인에 즉시 업데이트해야 합니다.

---

## 🌡️ 8. 하드웨어 부하 및 발열 관리 (Hardware Health)

Legion Y700의 성능을 유지하고 기기 수명을 보호하기 위한 규칙입니다.

- **CPU 과부하 판단**: `processor.py`가 가동 중인 상태에서 `Ollama` 추론이 시작되면 CPU 점유율이 즉시 100%에 도달합니다. 이는 정상이나, 이 상태로 **1시간 이상 지속될 경우** 기기 온도를 확인해야 합니다.
- **충전 중 주의사항**: AI 분석 부하가 높을 때 동시에 초고속 충전을 하면 배터리 온도가 급상승합니다. 분석 작업이 몰리는 시간에는 일반 충전을 권장하거나 통풍이 잘 되는 곳에 비치하세요.
- **자원 할당 (12GB RAM)**: 메모리가 넉넉하므로 `collector.py`와 `processor.py` 외에 간단한 모니터링 스크립트를 상시 띄워두는 것은 안전합니다. 다만 8B 이상의 대형 모델로 교체할 경우 메모리 압박이 시작될 수 있음을 인지하세요.
- **쓰로틀링 감지**: 처리 속도가 갑자기 평소보다 2배 이상 느려진다면 하드웨어 쓰로틀링(열에 의한 성능 저하)을 의심하고 프로세스를 잠시 중단하거나 기기를 식혀야 합니다.

---

## 🛰️ 9. 24/7 자율 가동 및 프로세스 생존 (Autonomy)

컴퓨터가 꺼져 있어도 태블릿 단독으로 뉴스를 수집하고 분석하기 위한 **'감시망 유지'** 규칙입니다.

### 🔋 프로세스 지속성 (Persistence)

- **Wake Lock 활성화**: Termux 알림창에서 `Acquire wakelock`을 반드시 클릭하세요. (CPU 취면 방지)
- **배터리 최적화 제외**: 안드로이드 설정에서 `Termux` 앱을 '배터리 최적화 제외'로 설정해야 백그라운드에서 킬(Kill)되지 않습니다.
- **백그라운드 실행 (`nohup`)**:
  - 모든 스크립트는 `nohup <명령어> >> log파일 2>&1 &` 형태로 실행하여 터미널이 닫혀도 생존하게 합니다.
  - `start_tablet_solo.sh`가 이 역할을 일괄 수행하므로, 개별 실행보다 스크립트 실행을 권장합니다.

### 🔄 자가 회복 (Self-Healing)

- **메모리 보호**: Legion Y700은 12GB RAM으로 여유가 있지만, 안드로이드 OS가 다른 앱을 위해 Termux를 강제 종료할 수 있습니다. 수시로 `diagnose.py`를 실행하여 모든 파이프라인이 살아있는지 확인하세요.
- **주기적 리포트**: GitHub Actions가 2시간마다 보고서를 보내지 않는다면, 태블릿의 프로세스가 죽었을 가능성이 가장 높습니다. 이때만 태블릿을 확인하면 됩니다.
