import requests
import datetime
import os

def check_status():
    url = "https://aesthetics-intelligence.vercel.app/"
    try:
        start_time = datetime.datetime.now()
        response = requests.get(url, timeout=10)
        end_time = datetime.datetime.now()
        latency = (end_time - start_time).total_seconds()
        
        if response.status_code == 200:
            print(f"✅ Site is Online. Latency: {latency:.2f}s")
            return True
        else:
            print(f"⚠️ Site returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Site is Offline or Error: {e}")
        return False

if __name__ == "__main__":
    check_status()
