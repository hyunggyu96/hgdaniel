import os
import requests
from dotenv import load_dotenv

load_dotenv('collector/.env')

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")  # service_role key가 있으면 좋은데..

# Try REST API execution if possible (PostgREST doesn't support ALTER TABLE directly)
# But we can try to guide user.

print("SQL for User:")
print("-" * 30)
print("ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;")
print("ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS issue_nature TEXT;")
print("-" * 30)
