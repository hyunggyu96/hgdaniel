import paramiko
import time
import sys
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

# Tablet Config
HOST = os.getenv("SSH_HOST", "")
PORT = int(os.getenv("SSH_PORT", "8022"))
USER = os.getenv("SSH_USERNAME", "")
PASS = os.getenv("SSH_PASSWORD", "")

def run_ssh_command():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"🔌 Connecting to {HOST}:{PORT}...")
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=10)
        print("✅ SSH Connected!")
        
        # 1. Check Patch Status (Look for V3 Smart Clean Logic)
        print("🔍 Checking processor.py patch status (V3 Smart Clean)...")
        check_cmd = "grep -F \"matches = list(re.finditer\" ~/news_dashboard/collector/processor.py"
        stdin, stdout, stderr = client.exec_command(check_cmd)
        result = stdout.read().decode().strip()
        
        if result:
            print("✅ Patch FOUND! Code is up to date.")
            print(f"   -> Found: {result[:50]}...")
        else:
            print("❌ Patch NOT FOUND. Forcing git update...")
            # Force Update
            update_cmd = "cd ~/news_dashboard && git fetch origin && git reset --hard origin/main"
            stdin, stdout, stderr = client.exec_command(update_cmd)
            out = stdout.read().decode()
            err = stderr.read().decode()
            print(f"   -> Git Output: {out}")
            if err: print(f"   -> Git Error: {err}")
            
            # Re-check
            stdin, stdout, stderr = client.exec_command(check_cmd)
            if stdout.read().decode().strip():
                print("✅ Update Successful! Patch is now applied.")
            else:
                print("🚨 Update FAILED. Check network or repo state.")
                return

        # 2. Restart Process
        print("🔄 Restarting Services (Kill & Start)...")
        # Kill python
        client.exec_command("pkill -f python")
        time.sleep(2)
        
        # Start Script (Using nohup via SSH needs care)
        # We execute the wrapper script
        start_cmd = "cd ~/news_dashboard && bash start_tablet_solo.sh > /dev/null 2>&1 &"
        client.exec_command(start_cmd)
        print("🚀 Start command sent.")
        
        time.sleep(3)
        
        # 3. Verify Running
        stdin, stdout, stderr = client.exec_command("pgrep -fl python")
        final_procs = stdout.read().decode()
        print(f"👀 Active Python Processes:\n{final_procs}")

    except Exception as e:
        print(f"🔥 SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    run_ssh_command()
