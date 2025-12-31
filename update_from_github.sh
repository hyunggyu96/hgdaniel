#!/bin/bash
# GitHub 동기화 및 가동 스크립트

echo "--- 🔄 GitHub 최신 설정 동기화 시작 ---"

# 1. GitHub에서 최신 코드 및 가이드라인 가져오기
# (태블릿이 인터넷에 연결되어 있어야 함)
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ GitHub 동기화 성공."
else
    echo "⚠️ GitHub 동기화 실패. 네트워크 상태를 확인하세요."
fi

# 2. .env 파일이나 service_account.json은 GitHub에 없으므로 
# 로컬(/sdcard)에 백업본이 있다면 이를 복구하거나 유지함.
# (이 과정은 이미 환경이 구축되어 있다면 생략 가능)

echo "--- 🚀 시스템 재가동 ---"
# 기존 프로세스가 있다면 종료 후 재시작하는 로직 (선택 사항)
# pkill -f processor.py
# pkill -f async_collector.py

bash start_tablet_solo.sh
