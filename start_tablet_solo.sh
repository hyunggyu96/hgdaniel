#!/bin/bash

# 태블릿용 뉴스 대시보드 올인원 실행 스크립트 V2.0
# 중복 실행 방지 로직 추가 (2026-01-01)

echo "=== 태블릿 가동 시작 ($(date)) ==="

# Termux 홈 디렉토리로 이동 (안정성 확보)
cd /data/data/com.termux/files/home/news_dashboard 2>/dev/null || cd ~/news_dashboard

# 파이썬 명령어 감지
PYTHON_CMD="python"
if command -v python3 >/dev/null 2>&1; then PYTHON_CMD="python3"; fi

# ============================================
# 🚨 중복 프로세스 탐지 및 정리 (V2.0 추가)
# ============================================
COLLECTOR_COUNT=$(pgrep -f "async_collector.py" | wc -l)
PROCESSOR_COUNT=$(pgrep -f "processor.py" | wc -l)

echo "[체크] 현재 Collector 프로세스: ${COLLECTOR_COUNT}개"
echo "[체크] 현재 Processor 프로세스: ${PROCESSOR_COUNT}개"

if [ "$COLLECTOR_COUNT" -gt 0 ] || [ "$PROCESSOR_COUNT" -gt 0 ]; then
    echo "⚠️  경고: 기존 프로세스 발견! 중복 실행을 방지하기 위해 정리합니다..."
    pkill -f "async_collector.py"
    pkill -f "processor.py"
    pkill llama-server
    sleep 2
    echo "✅ 기존 프로세스 종료 완료"
fi

# ============================================
# Local LLM (llama-server) 체크 및 가동
# ============================================
if ! pgrep -f "llama-server" > /dev/null; then
    echo "[+] llama-server (Qwen 7B OpenCL GPU) 시작 중..."
    # Custom Built OpenCL Binary
    # Qwen 7B, Hybrid GPU Mode (-ngl 20), 8 threads, 8080 port
    # LD_LIBRARY_PATH required for libggml-opencl.so
    export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$HOME/llama.cpp/build/bin
    
    # Use the custom binary if exists, else fallback to pkg binary
    if [ -f "./llama-server-opencl" ]; then
        SERVER_BIN="./llama-server-opencl"
    else
        SERVER_BIN="llama-server"
    fi

    nohup $SERVER_BIN -m models/qwen7b.gguf -ngl 20 -t 8 -c 2048 --port 8080 --host 0.0.0.0 > server.log 2>&1 &
    echo "    ⏳ 모델 로딩 대기 (10초)..."
    sleep 10
else
    echo "[✓] llama-server 이미 실행 중"
fi

# ============================================
# 수집기 및 분석기 가동
# ============================================
echo "[+] Collector 시작 중..."
nohup $PYTHON_CMD collector/async_collector.py >> collector.log 2>&1 &
COLLECTOR_PID=$!

echo "[+] Processor 시작 중..."
nohup $PYTHON_CMD collector/processor.py >> processor.log 2>&1 &
PROCESSOR_PID=$!

echo "[+] Auto Sync Bot (감시자) 시작 중..."
nohup $PYTHON_CMD auto_sync_bot.py >> sync_bot.log 2>&1 &
BOT_PID=$!

sleep 2

# ============================================
# 🔍 최종 검증 (V2.0 추가)
# ============================================
FINAL_COLLECTOR=$(pgrep -f "async_collector.py" | wc -l)
FINAL_PROCESSOR=$(pgrep -f "processor.py" | wc -l)
FINAL_BOT=$(pgrep -f "auto_sync_bot.py" | wc -l)

echo ""
echo "=== 가동 결과 ==="
echo "  Collector: ${FINAL_COLLECTOR}개"
echo "  Processor: ${FINAL_PROCESSOR}개"
echo "  Sync Bot : ${FINAL_BOT}개"

if [ "$FINAL_COLLECTOR" -ge 1 ] && [ "$FINAL_PROCESSOR" -ge 1 ] && [ "$FINAL_BOT" -ge 1 ]; then
    echo "✅ 정상 가동 완료 (3대장 실행 중)"
else
    echo "🚨 경고: 일부 프로세스 미실행! 수동 확인 필요"
    echo "   pgrep -fl python 으로 확인하세요"
fi

echo "=== $(date) ==="
