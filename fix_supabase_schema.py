
import psycopg2
import sys

def apply_sql():
    # Connection details
    project_ref = "jwkdxygcpfdmavxcbcfe"
    password = "AISapience111$"
    host = f"db.{project_ref}.supabase.co"
    port = "5432"
    user = "postgres"
    dbname = "postgres"
    
    conn_str = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
    
    try:
        print(f"🔗 Connecting to Supabase DB: {host}...")
        conn = psycopg2.connect(conn_str)
        conn.autocommit = True
        cur = conn.cursor()
        
        sql = "ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text DEFAULT '기타';"
        print(f"🚀 Executing SQL: {sql}")
        cur.execute(sql)
        
        # Also check current columns
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'articles';")
        columns = [row[0] for row in cur.fetchall()]
        print(f"✅ Current columns in 'articles': {columns}")
        
        cur.close()
        conn.close()
        print("🎉 DB Schema updated successfully!")
        
    except Exception as e:
        print(f"❌ Error applying SQL: {e}")
        sys.exit(1)

if __name__ == "__main__":
    apply_sql()
