#!/bin/bash

# 태블릿용 뉴스 대시보드 올인원 실행 스크립트 V2.0
# 중복 실행 방지 로직 추가 (2026-01-01)

echo "=== 태블릿 가동 시작 ($(date)) ==="

# Termux 홈 디렉토리로 이동 (안정성 확보)
cd /data/data/com.termux/files/home/news_dashboard 2>/dev/null || cd ~/news_dashboard

# [V3.0] CPU Awake 강제 (백그라운드 종료 방지)
termux-wake-lock
echo "[+] WakeLock 활성화됨 (시스템 잠자기 방지)"

# 파이썬 명령어 감지
PYTHON_CMD="python"
if command -v python3 >/dev/null 2>&1; then PYTHON_CMD="python3"; fi

# ============================================
# 🚨 중복 프로세스 탐지 및 정리 (V3.0 - 정상이면 스킵)
# ============================================
COLLECTOR_COUNT=$(pgrep -f "async_collector.py" | wc -l)
PROCESSOR_COUNT=$(pgrep -f "processor.py" | wc -l)
SYNCBOT_COUNT=$(pgrep -f "auto_sync_bot.py" | wc -l)
LLAMA_COUNT=$(pgrep -f "llama-server" | wc -l)

echo "[체크] 현재 Collector: ${COLLECTOR_COUNT}개, Processor: ${PROCESSOR_COUNT}개, SyncBot: ${SYNCBOT_COUNT}개, LLaMA: ${LLAMA_COUNT}개"

# 모든 프로세스가 정확히 1개씩 실행 중이면 스킵 (재시작 없음)
if [ "$COLLECTOR_COUNT" -eq 1 ] && [ "$PROCESSOR_COUNT" -eq 1 ] && [ "$SYNCBOT_COUNT" -eq 1 ] && [ "$LLAMA_COUNT" -ge 1 ]; then
    echo "✅ 모든 프로세스 정상 실행 중! 재시작 불필요."
    echo "=== $(date) ===" 
    exit 0
fi

# 비정상 상태 (0개 or 2개 이상) → 정리 후 재시작
echo "⚠️  비정상 상태 감지! 기존 프로세스 정리 후 재시작..."
pkill -f "async_collector.py" 2>/dev/null
pkill -f "processor.py" 2>/dev/null
pkill -f "auto_sync_bot.py" 2>/dev/null
# llama-server는 유지 (재시작 비용 큼)
sleep 2
echo "✅ 정리 완료"

# ============================================
# Local LLM (llama-server) 체크 및 가동
# ============================================
if ! pgrep -f "llama-server" > /dev/null; then
    echo "[+] llama-server (Qwen 7B OpenCL GPU) 시작 중..."
    # Custom Built OpenCL Binary
    # Qwen 7B, Hybrid GPU Mode (-ngl 20), 8 threads, 8080 port
    # LD_LIBRARY_PATH required for libggml-opencl.so
    export LD_LIBRARY_PATH=/system/vendor/lib64:/vendor/lib64:$LD_LIBRARY_PATH:$HOME/llama.cpp/build/bin
    
    # Use the custom binary if exists, else fallback to pkg binary
    if [ -f "./llama-server-opencl" ]; then
        SERVER_BIN="./llama-server-opencl"
    else
        SERVER_BIN="llama-server"
    fi

    nohup $SERVER_BIN -m models/qwen7b.gguf -ngl 33 -t 4 -c 4096 -b 4096 -ub 4096 -ctk q8_0 -ctkv q8_0 --slots 1 --port 8080 --host 0.0.0.0 > server.log 2>&1 &
    echo "    ⏳ 모델 GPU 로딩 대기 (30초)..."
    sleep 30
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
