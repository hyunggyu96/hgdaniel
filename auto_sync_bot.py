import time
import subprocess
import os

# 설정
CHECK_INTERVAL = 600  # 10분마다 검사
SYNC_SCRIPT = "sync_sheet_from_supabase.py"
VERIFY_SCRIPT = "verify_sync.py"

def run_script(script_name):
    """스크립트 실행 및 결과 반환"""
    try:
        # python3 명령어로 실행
        result = subprocess.run(
            ["python3", script_name], 
            capture_output=True, 
            text=True, 
            encoding='utf-8',
            errors='ignore'
        )
        return result.stdout, result.returncode
    except Exception as e:
        return str(e), 1

def main():
    print(f"🤖 Auto Sync Bot Started (Interval: {CHECK_INTERVAL}s)")
    
    while True:
        print(f"\n[Time: {time.strftime('%Y-%m-%d %H:%M:%S')}] Checking Sync Status...")
        
        # 1. 검증 스크립트 실행
        # verify_sync.py는 DB 최신글과 시트 2행을 비교함
        # 매칭되면 0(성공), 틀리면 1(실패)이나 에러 메시지 출력 예상
        # 하지만 현재 verify_sync.py는 exit(1)을 명시적으로 안 하므로 수정 필요할 수 있음
        # 일단 출력 메시지로 파악
        
        output, _ = run_script(VERIFY_SCRIPT)
        
        if "SYNC MISMATCH" in output or "Error" in output:
            print("⚠️ Mismatch Detected! Triggering Force Sync...")
            print(f"   [Verify Output] {output[:100]}...")
            
            # 2. 불일치 시, 강제 동기화 실행
            sync_out, sync_code = run_script(SYNC_SCRIPT)
            if sync_code == 0:
                print("✅ Force Sync Completed!")
            else:
                print(f"❌ Force Sync Failed: {sync_out[:100]}")
        
        elif "SYNC MATCH" in output:
            print("✅ System Verified: Fully Synced.")
        else:
            # 애매한 경우 (스크립트 오류 등)
            print("❓ Verification Output Unclear. Retrying next cycle.")
            print(output[:200])
            
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
