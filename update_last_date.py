import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.219.102', port=8022, username='u0_a43', password='aisapiens', timeout=10)

sftp = c.open_sftp()
f = sftp.file('/data/data/com.termux/files/home/news_dashboard/collector/last_update.json', 'w')
f.write('{"last_update": "2025-12-31 00:01:00"}')
f.close()
sftp.close()

print('✅ Updated to 2025-12-31 00:01!')
c.close()
