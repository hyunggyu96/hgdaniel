# ============================================
# .bashrc에 추가할 자동 시작 코드
#
# 설치 방법:
# 이 내용을 ~/.bashrc 맨 아래에 추가하세요:
#   cat ~/news_dashboard/_termux/bashrc_autostart.sh >> ~/.bashrc
# ============================================

# 뉴스 대시보드 자동 시작 (Termux 열릴 때마다)
if [ -f ~/news_dashboard/start_tablet_solo.sh ]; then
    # 이미 실행 중인지 확인
    COLLECTOR_RUNNING=$(pgrep -f "async_collector.py" | wc -l)
    PROCESSOR_RUNNING=$(pgrep -f "processor.py" | wc -l)
    
    if [ "$COLLECTOR_RUNNING" -eq 0 ] || [ "$PROCESSOR_RUNNING" -eq 0 ]; then
        echo "🚀 뉴스 파이프라인 자동 시작 중..."
        cd ~/news_dashboard
        
        # Git에서 최신 코드 가져오기
        git pull origin main 2>/dev/null
        
        # 파이프라인 시작
        bash start_tablet_solo.sh
    else
        echo "✅ 뉴스 파이프라인 이미 실행 중"
    fi
fi
