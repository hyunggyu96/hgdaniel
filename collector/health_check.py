import requests
import datetime
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

def log_to_firestore(status, latency):
    # Try to initialize with service account from env, otherwise use default (for local)
    try:
        if not firebase_admin._apps:
            cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
            if cred_json:
                cred = credentials.Certificate(json.loads(cred_json))
                firebase_admin.initialize_app(cred)
            else:
                # Local check might fail if not authenticated, but we'll try
                firebase_admin.initialize_app()
        
        db = firestore.client()
        kst_now = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
        
        data = {
            "timestamp": kst_now.isoformat(),
            "status": "online" if status else "offline",
            "latency": latency,
            "agent": "Antigravity-Monitor"
        }
        
        db.collection("heartbeats").add(data)
        print("📊 Heartbeat logged to Firestore.")
    except Exception as e:
        print(f"⚠️ Failed to log to Firestore: {e}")

def check_status():
    url = "https://aesthetics-intelligence.vercel.app/"
    try:
        start_time = datetime.datetime.now()
        response = requests.get(url, timeout=10)
        end_time = datetime.datetime.now()
        latency = (end_time - start_time).total_seconds()
        
        is_online = response.status_code == 200
        if is_online:
            print(f"✅ Site is Online. Latency: {latency:.2f}s")
        else:
            print(f"⚠️ Site returned status: {response.status_code}")
        
        log_to_firestore(is_online, latency)
        return is_online
    except Exception as e:
        print(f"❌ Site is Offline or Error: {e}")
        log_to_firestore(False, 0)
        return False

if __name__ == "__main__":
    check_status()
