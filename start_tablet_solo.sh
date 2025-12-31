#!/bin/bash

# 태블릿용 뉴스 대시보드 올인원 실행 스크립트 V1.2
echo "--- 태블릿 가동 시작 ($(date)) ---"

# Termux 홈 디렉토리로 이동 (안정성 확보)
cd /data/data/com.termux/files/home/news_dashboard 2>/dev/null || cd ~/news_dashboard

# 파이썬 명령어 감지
PYTHON_CMD="python"
if command -v python3 >/dev/null 2>&1; then PYTHON_CMD="python3"; fi

# Ollama 체크 및 가동
if ! pgrep -x "ollama" > /dev/null; then
    echo "[+] Ollama 시작 중..."
    export OLLAMA_HOST=0.0.0.0
    nohup ollama serve > ollama.log 2>&1 &
    sleep 5
fi

# 수집기 및 분석기 가동
echo "[+] Collector/Processor 시작 중..."
nohup $PYTHON_CMD collector/async_collector.py >> collector.log 2>&1 &
nohup $PYTHON_CMD collector/processor.py >> processor.log 2>&1 &

echo "--- 가동 완료 ---"
