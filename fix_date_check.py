import paramiko
import json

HOST = "192.168.219.102"
PORT = 8022
USER = "u0_a43"
PASS = "aisapiens"

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, port=PORT, username=USER, password=PASS, timeout=10)
    
    print("🔌 Connected to Tablet")

    # 1. 파일 내용 확인
    stdin, stdout, stderr = c.exec_command('cat ~/news_dashboard/collector/last_update.json')
    current_content = stdout.read().decode().strip()
    print(f"📄 Current Content: {current_content}")

    # 2. 강제 수정 (echo 명령어 사용)
    # JSON 형식 정확히 맞춤
    new_json = '{"last_update": "2025-12-31 00:01:00.000000"}'
    
    # 리눅스 명령어로 덮어쓰기 (sftp보다 더 직접적)
    cmd = f"echo '{new_json}' > ~/news_dashboard/collector/last_update.json"
    c.exec_command(cmd)
    print("🛠️  Overwriting file...")

    # 3. 재확인
    stdin, stdout, stderr = c.exec_command('cat ~/news_dashboard/collector/last_update.json')
    updated_content = stdout.read().decode().strip()
    print(f"✅ Updated Content: {updated_content}")

    if "2025-12-31" in updated_content:
        print("🎉 SUCCESS! Now run async_collector.py")
    else:
        print("🚨 FAIL! Something prevented the update.")

    c.close()

except Exception as e:
    print(f"🔥 Error: {e}")
