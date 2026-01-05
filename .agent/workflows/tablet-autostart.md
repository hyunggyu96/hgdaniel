---
description: 태블릿 Termux 자동 시작 설정 및 파이프라인 복구
---

# 🔧 태블릿 자동시작 설정 워크플로우

이 워크플로우는 태블릿에 자동 시작 기능을 설정하고 파이프라인을 복구합니다.

## 사전 조건

- PC와 태블릿이 같은 네트워크에 연결되어 있어야 함
- 태블릿 Termux가 실행 중이어야 함

## 실행 단계

// turbo-all

### 1. 태블릿 SSH 연결

```bash
ssh -o StrictHostKeyChecking=no u0_a374@192.168.45.21 -p 8022
```

비밀번호: `aisapiens`

### 2. 최신 코드 받기

```bash
cd ~/news_dashboard && git pull origin main
```

### 3. .bashrc에 자동시작 추가 (이미 있으면 스킵)

```bash
grep -q "bashrc_autostart" ~/.bashrc || cat ~/news_dashboard/_termux/bashrc_autostart.sh >> ~/.bashrc
```

### 4. 기존 프로세스 정리 후 파이프라인 재시작

```bash
pkill -f "async_collector.py"
pkill -f "processor.py"
pkill -f "auto_sync_bot.py"
sleep 2
bash ~/news_dashboard/start_tablet_solo.sh
```

### 5. 프로세스 확인

```bash
pgrep -fl python
```

## 성공 기준

- Collector, Processor, Sync Bot 3개 프로세스가 실행 중이어야 함
- `collector.log`, `processor.log`에 최신 로그가 기록되어야 함
