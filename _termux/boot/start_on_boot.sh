#!/data/data/com.termux/files/usr/bin/bash
# ============================================
# Termux:Boot 자동 시작 스크립트
# 
# 설치 방법:
# 1. F-Droid에서 Termux:Boot 앱 설치
# 2. Termux:Boot 앱을 한 번 실행 (권한 활성화)
# 3. 이 파일을 ~/.termux/boot/ 폴더에 복사:
#    cp ~/news_dashboard/_termux/boot/start_on_boot.sh ~/.termux/boot/
#    chmod +x ~/.termux/boot/start_on_boot.sh
# ============================================

# Wake Lock 활성화 (배터리 최적화 무시)
termux-wake-lock

# 파이프라인 시작
cd ~/news_dashboard
bash start_tablet_solo.sh >> ~/news_dashboard/boot.log 2>&1

# 완료 알림 (선택사항)
termux-notification --title "뉴스 대시보드" --content "파이프라인 자동 시작됨" --id boot_notify
