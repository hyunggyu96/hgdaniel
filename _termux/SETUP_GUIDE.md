# 📱 Termux 자동 시작 설정 가이드

## 🎯 목표

Termux가 꺼졌다가 다시 켜져도 뉴스 파이프라인이 자동으로 시작되게 합니다.

---

## 방법 1: Termux:Boot 사용 (추천 ⭐)

### 장점

- 안드로이드 기기 재부팅 시에도 자동 실행
- 가장 안정적인 방법

### 설치 순서

1. **Termux:Boot 앱 설치**
   - F-Droid 앱에서 "Termux:Boot" 검색 후 설치
   - 또는: <https://f-droid.org/packages/com.termux.boot/>

2. **Termux:Boot 앱 한 번 실행**
   - 앱 아이콘을 터치해서 실행 (권한 활성화됨)

3. **스크립트 복사**

   ```bash
   mkdir -p ~/.termux/boot
   cp ~/news_dashboard/_termux/boot/start_on_boot.sh ~/.termux/boot/
   chmod +x ~/.termux/boot/start_on_boot.sh
   ```

4. **테스트**
   - 기기 재부팅 후 파이프라인 자동 시작 확인

---

## 방법 2: .bashrc 사용 (간단)

### 장점

- 추가 앱 설치 불필요
- Termux 앱 열면 자동 시작

### 단점

- Termux 앱을 수동으로 한 번 열어야 함

### 설치 순서

1. **코드 추가**

   ```bash
   cat ~/news_dashboard/_termux/bashrc_autostart.sh >> ~/.bashrc
   ```

2. **적용**

   ```bash
   source ~/.bashrc
   ```

---

## 🔧 두 방법 모두 사용 (권장)

가장 확실한 방법은 **두 가지 모두 설정**하는 것입니다:

- Termux:Boot → 기기 부팅 시 자동 시작
- .bashrc → Termux 앱 열 때 자동 시작 (백업용)

---

## ⚠️ 배터리 최적화 해제

안드로이드 설정에서 Termux의 배터리 최적화를 해제해야 합니다:

1. 설정 → 앱 → Termux
2. 배터리 → "제한 없음" 선택

---

## 🧪 확인 방법

```bash
# 프로세스 확인
pgrep -fl python

# 로그 확인
tail -f ~/news_dashboard/collector.log
tail -f ~/news_dashboard/processor.log
```
