#!/bin/bash
# Watchdog Script - 프로세스 감시 및 자동 재시작
# 5분마다 Collector/Processor 확인, 없으면 재시작

LOG_FILE=~/news_dashboard/watchdog.log
SCRIPT_DIR=~/news_dashboard

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_and_restart() {
    COLLECTOR_COUNT=$(pgrep -f "async_collector.py" | wc -l)
    PROCESSOR_COUNT=$(pgrep -f "processor.py" | wc -l)
    
    if [ "$COLLECTOR_COUNT" -eq 0 ] || [ "$PROCESSOR_COUNT" -eq 0 ]; then
        log "⚠️  프로세스 누락 감지! Collector: $COLLECTOR_COUNT, Processor: $PROCESSOR_COUNT"
        log "🔄 파이프라인 재시작 중..."
        
        # 기존 프로세스 정리
        pkill -f "async_collector.py" 2>/dev/null
        pkill -f "processor.py" 2>/dev/null
        pkill -f "auto_sync_bot.py" 2>/dev/null
        sleep 2
        
        # 재시작
        cd "$SCRIPT_DIR"
        bash start_tablet_solo.sh >> "$LOG_FILE" 2>&1
        
        log "✅ 재시작 완료"
    fi
}

log "🐕 Watchdog 시작됨 (5분 간격 감시)"

while true; do
    check_and_restart
    sleep 300  # 5분
done
