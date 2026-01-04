
import psycopg2
import sys

def apply_sql():
    # Trying Supavisor (Pooler) Transaction Mode
    host = "db.jwkdxygcpfdmavxcbcfe.supabase.co"
    port = "6543" # Supavisor Transaction Mode (Always IPv4 according to Supabase)
    user = "postgres.jwkdxygcpfdmavxcbcfe"
    password = "AISapience111$"
    dbname = "postgres"
    
    try:
        print(f"🔗 Connecting to Supabase Pooler (IPv4 Mode): {host}:{port}...")
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=dbname,
            connect_timeout=15
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        sql = "ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text DEFAULT '기타';"
        print(f"🚀 Executing SQL: {sql}")
        cur.execute(sql)
        
        cur.close()
        conn.close()
        print("🎉 SUCCESS! Column 'category' added via Supavisor Pooler!")
    except Exception as e:
        print(f"❌ Failed via Pooler on 6543: {e}")
        # Try port 5432 too with the same user format
        try:
            print(f"🔗 Retrying on port 5432 with pooler user...")
            conn = psycopg2.connect(
                host=host,
                port="5432",
                user=user,
                password=password,
                database=dbname,
                connect_timeout=10
            )
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute(sql)
            cur.close()
            conn.close()
            print("🎉 SUCCESS! Column 'category' added via port 5432!")
        except Exception as e2:
            print(f"❌ Failed via port 5432: {e2}")

if __name__ == "__main__":
    apply_sql()
