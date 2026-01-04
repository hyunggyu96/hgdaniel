
import psycopg2
import sys

def try_brute_force_regions():
    project_ref = "jwkdxygcpfdmavxcbcfe"
    password = "AISapience111$"
    regions = ["ap-northeast-2", "ap-southeast-1", "ap-northeast-1", "us-east-1", "eu-central-1"]
    
    user = f"postgres.{project_ref}"
    dbname = "postgres"
    
    sql = "ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text DEFAULT '기타';"
    
    for region in regions:
        host = f"aws-0-{region}.pooler.supabase.com"
        print(f"--- Testing Region: {region} ({host}) ---")
        
        # Try both ports: 5432 (Session) and 6543 (Transaction)
        for port in ["5432", "6543"]:
            try:
                print(f"  🔗 Connecting to port {port}...")
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=password,
                    database=dbname,
                    connect_timeout=5
                )
                conn.autocommit = True
                cur = conn.cursor()
                print(f"  🚀 SUCCESS! Executing SQL...")
                cur.execute(sql)
                
                # Check columns
                cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'articles';")
                cols = [r[0] for r in cur.fetchall()]
                print(f"  ✅ Current columns: {cols}")
                
                cur.close()
                conn.close()
                print(f"🎉 MISSION ACCOMPLISHED via {region}:{port}!")
                return True
            except Exception as e:
                err_msg = str(e).strip()
                if "Tenant or user not found" in err_msg:
                    print(f"  ❌ Wrong region (Tenant not found).")
                elif "password authentication failed" in err_msg:
                    print(f"  ❌ Password INCORRECT for this user.")
                else:
                    print(f"  ❌ Error: {err_msg[:100]}...")
                continue
    return False

if __name__ == "__main__":
    if not try_brute_force_regions():
        print("\n❌ All regions failed. Please check the 'Project Settings > Database' in Supabase for the correct connection string.")
        sys.exit(1)
