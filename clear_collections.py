
import os
from supabase import create_client, Client

from dotenv import load_dotenv

load_dotenv('.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print(f"Error: Missing Supabase credentials. URL={url is not None}, KEY={key is not None}")
    exit(1)

supabase: Client = create_client(url, key)

def clear_all_collections():
    try:
        # Delete all rows from user_collections table
        # We assume no WHERE clause deletes everything, but Supabase might require a condition.
        # Often .delete().neq('user_id', '0') works as a delete-all trick if unconditional delete is blocked.
        response = supabase.table("user_collections").delete().neq("user_id", "placeholder_to_delete_all").execute()
        
        # If the above doesn't clear everything (depending on policies), we might want to iterate users or try a broader condition.
        # But logically, we want to TRUNCATE.
        
        # Let's try listing first to see count
        count_res = supabase.table("user_collections").select("*", count="exact").execute()
        print(f"Items before deletion: {count_res.count}")
        
        # Actual deletion
        del_res = supabase.table("user_collections").delete().neq("id", -1).execute() # Assuming 'id' exists, or we use another column
        # If 'id' is not a column, we can use user_id != 'impossible_value' - wait, we want to delete meaningful rows.
        # Let's delete where article_link is not null (basically all rows)
        del_res = supabase.table("user_collections").delete().neq("article_link", "").execute()
        
        print(f"Deleted rows. Response: {len(del_res.data) if del_res.data else 0} items removed.")

    except Exception as e:
        print(f"Error clearing collections: {e}")

if __name__ == "__main__":
    clear_all_collections()
