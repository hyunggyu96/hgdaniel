
import psycopg2
import sys

def apply_sql():
    # Use different host patterns to bypass IPv6 issues if any
    project_ref = "jwkdxygcpfdmavxcbcfe"
    password = "AISapience111$"
    # Try pooler host which often has IPv4
    hosts = [
        f"db.{project_ref}.supabase.co",
        "aws-0-ap-northeast-2.pooler.supabase.com" # Common region for KR
    ]
    port = "5432"
    user = f"postgres.{project_ref}" # Pooler format
    dbname = "postgres"
    
    success = False
    for host in hosts:
        try:
            print(f"🔗 Trying to connect to: {host}...")
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=dbname,
                connect_timeout=10
            )
            conn.autocommit = True
            cur = conn.cursor()
            
            sql = "ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text DEFAULT '기타';"
            print(f"🚀 Executing SQL: {sql}")
            cur.execute(sql)
            
            cur.close()
            conn.close()
            print(f"✅ Column 'category' added successfully via {host}!")
            success = True
            break
        except Exception as e:
            print(f"❌ Failed via {host}: {e}")

    if not success:
        print("\n⚠️ 모든 접속 시도가 실패했습니다. Supabase 대시보드의 SQL Editor에서 아래 명령어를 실행해 주세요:")
        print("ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text DEFAULT '기타';")
        sys.exit(1)

if __name__ == "__main__":
    apply_sql()
