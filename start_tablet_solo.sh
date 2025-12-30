#!/bin/bash

# 태블릿용 뉴스 대시보드 올인원 실행 스크립트

echo "--- 태블릿 독립 가동을 시작합니다 ---"

# 1. Ollama가 켜져 있는지 확인 (태블릿 로컬)
if ! pgrep -x "ollama" > /dev/null
then
    echo "[!] Ollama가 실행 중이지 않습니다. Ollama를 먼저 실행해 주세요."
    # Ollama 실행 명령 (배경에서 실행)
    # nohup ollama serve > ollama.log 2>&1 &
    # sleep 5
fi

# 2. 뉴스 수집기 실행 (백그라운드)
echo "[+] 뉴스 수집기(Async Collector) 시작 중..."
nohup python collector/async_collector.py > collector.log 2>&1 &

# 3. 뉴스 분석기 실행 (백그라운드)
echo "[+] 뉴스 분석기(Processor) 시작 중..."
# 태블릿 로컬 Ollama를 사용하도록 OLLAMA_HOST를 설정 (이미 설정되어 있다면 무시)
export OLLAMA_HOST=127.0.0.1:11434
nohup python collector/processor.py > processor.log 2>&1 &

echo "--- 모든 프로세스가 백그라운드에서 가동 중입니다 ---"
echo "로그 확인: 'tail -f processor.log' 또는 'tail -f collector.log'"
