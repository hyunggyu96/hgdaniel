# ============================================
# .bashrc에 추가할 자동 시작 코드
#
# 설치 방법:
# 이 내용을 ~/.bashrc 맨 아래에 추가하세요:
#   cat ~/news_dashboard/_termux/bashrc_autostart.sh >> ~/.bashrc
# ============================================

# 뉴스 대시보드 자동 시작 (Termux 열릴 때마다)
# bashrc_autostart 마커 (중복 추가 방지용)
if [ -f ~/news_dashboard/start_tablet_solo.sh ]; then
    # 3대장 프로세스 개수 확인
    COLLECTOR_RUNNING=$(pgrep -f "async_collector.py" | wc -l)
    PROCESSOR_RUNNING=$(pgrep -f "processor.py" | wc -l)
    SYNCBOT_RUNNING=$(pgrep -f "auto_sync_bot.py" | wc -l)
    
    # 모든 프로세스가 1개씩 정상 실행 중일 때만 스킵
    if [ "$COLLECTOR_RUNNING" -eq 1 ] && [ "$PROCESSOR_RUNNING" -eq 1 ] && [ "$SYNCBOT_RUNNING" -eq 1 ]; then
        echo "✅ 뉴스 파이프라인 이미 정상 실행 중 (Collector:$COLLECTOR_RUNNING, Processor:$PROCESSOR_RUNNING, SyncBot:$SYNCBOT_RUNNING)"
    else
        echo "🚀 뉴스 파이프라인 자동 시작 중... (Collector:$COLLECTOR_RUNNING, Processor:$PROCESSOR_RUNNING, SyncBot:$SYNCBOT_RUNNING)"
        cd ~/news_dashboard
        
        # Git에서 최신 코드 가져오기
        git pull origin main 2>/dev/null
        
        # 파이프라인 시작 (start_tablet_solo.sh가 기존 프로세스 정리 후 시작함)
        bash start_tablet_solo.sh
    fi
fi
