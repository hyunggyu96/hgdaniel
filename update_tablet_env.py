import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('192.168.219.102', port=8022, username='u0_a43', password='aisapiens', timeout=10)

# Read current .env
stdin, stdout, stderr = c.exec_command('cat ~/news_dashboard/collector/.env')
content = stdout.read().decode()

# Update KEYWORDS line
new_keywords = "KEYWORDS=필러,톡신,보톡스,PLLA,PDLLA,HIFU,엑소좀,PDRN,PN,PDO,제테마,휴젤,파마리서치,메디톡스,휴메딕스,종근당바이오,바임,원텍,클래시스,제이시스메디칼,리투오,한스바이오메드,시지바이오,스킨부스터"

lines = content.split('\n')
new_lines = []
for line in lines:
    if line.startswith('KEYWORDS='):
        new_lines.append(new_keywords)
    else:
        new_lines.append(line)

new_content = '\n'.join(new_lines)

# Write back
sftp = c.open_sftp()
with sftp.file('/data/data/com.termux/files/home/news_dashboard/collector/.env', 'w') as f:
    f.write(new_content)
sftp.close()

print("✅ .env updated!")

# Verify
stdin, stdout, stderr = c.exec_command('grep KEYWORDS ~/news_dashboard/collector/.env')
print(stdout.read().decode())

c.close()
