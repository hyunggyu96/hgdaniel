
import psycopg2
import sys

def apply_sql():
    # Use the IPv6 address found via nslookup
    # Address: 2406:da1a:6b0:f612:e111:7471:4f5:343f
    host = "2406:da1a:6b0:f612:e111:7471:4f5:343f"
    password = "AISapience111$"
    port = "5432"
    user = "postgres"
    dbname = "postgres"
    
    # Wrap IPv6 in brackets for psycopg2 connection string
    conn_str = f"postgresql://{user}:{password}@[{host}]:{port}/{dbname}"
    
    try:
        print(f"🔗 Connecting to Supabase DB via IPv6: {host}...")
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
        print("\n💡 Recommendation: If IPv6 fails, please run the following SQL in Supabase Dashboard SQL Editor:")
        print(f"   {sql}")
        sys.exit(1)

if __name__ == "__main__":
    apply_sql()
