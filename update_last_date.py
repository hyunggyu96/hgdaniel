import paramiko
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(
    os.getenv("SSH_HOST", ""),
    port=int(os.getenv("SSH_PORT", "8022")),
    username=os.getenv("SSH_USERNAME", ""),
    password=os.getenv("SSH_PASSWORD", ""),
    timeout=10
)

sftp = c.open_sftp()
f = sftp.file('/data/data/com.termux/files/home/news_dashboard/collector/last_update.json', 'w')
f.write('{"last_update": "2025-12-31 00:01:00"}')
f.close()
sftp.close()

print('✅ Updated to 2025-12-31 00:01!')
c.close()
