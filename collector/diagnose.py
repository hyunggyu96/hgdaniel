import os
import requests
import datetime
import json
from supabase import create_client
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

def diagnose():
    print("📋 [Aesthetics Intelligence System Diagnosis]")
    print("-" * 50)
    
    # 1. Vercel Frontend
    url = "https://aesthetics-intelligence.vercel.app/"
    try:
        resp = requests.get(url, timeout=5)
        print(f"🌐 Vercel Frontend: [{'OK' if resp.status_code == 200 else 'ERR'}] ({resp.status_code})")
    except:
        print("🌐 Vercel Frontend: [OFFLINE]")

    # 2. Supabase
    try:
        sb_url = os.getenv("SUPABASE_URL")
        sb_key = os.getenv("SUPABASE_KEY")
        supabase = create_client(sb_url, sb_key)
        count = supabase.table("articles").select("id", count="exact").limit(1).execute().count
        print(f"🗄️ Supabase DB: [OK] ({count} articles total)")
    except Exception as e:
        print(f"🗄️ Supabase DB: [FAIL] ({e})")

    # 3. Firestore
    try:
        if not firebase_admin._apps:
            cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
            if cred_json:
                cred = credentials.Certificate(json.loads(cred_json))
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()
        db = firestore.client()
        alerts = db.collection("critical_alerts").limit(5).get()
        print(f"🔥 Firestore: [OK] ({len(alerts)} recent critical alerts found)")
    except Exception as e:
        print(f"🔥 Firestore: [FAIL] ({e})")

    # 4. Google Sheets
    sheet_url = os.getenv("GOOGLE_SHEET_URL")
    if sheet_url:
        print(f"📊 Google Sheets: [LINKED] ({sheet_url[:50]}...)")
    else:
        print("📊 Google Sheets: [NOT CONFIGURED]")

    print("-" * 50)
    print(f"⏰ Diagnosis complete at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    diagnose()
