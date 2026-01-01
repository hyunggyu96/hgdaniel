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
    
    print("🔌 Connected")

    # 루트 경로의 last_update.json 수정
    path = "~/news_dashboard/last_update.json"
    new_json = '{"last_run": "2025-12-31T00:01:00"}'
    
    cmd = f"echo '{new_json}' > {path}"
    c.exec_command(cmd)
    
    stdin, stdout, stderr = c.exec_command(f'cat {path}')
    print(f"✅ Updated {path}: {stdout.read().decode().strip()}")
    
    c.close()

except Exception as e:
    print(f"🔥 Error: {e}")
