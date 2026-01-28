from typing import Generator
from supabase import create_client, Client
from app.core.config import settings
from app.services.dart_client import DartAPI
from app.services.naver_client import NaverAPI
from app.services.llm import GeminiClient
from app.services.pubmed_service import PubMedService

def get_dart_client() -> Generator:
    client = DartAPI(api_key=settings.DART_API_KEY)
    yield client

def get_naver_client() -> Generator:
    client = NaverAPI(client_id=settings.NAVER_CLIENT_ID, client_secret=settings.NAVER_CLIENT_SECRET)
    yield client

def get_gemini_client() -> Generator:
    client = GeminiClient(api_key=settings.GEMINI_API_KEY)
    yield client

def get_supabase_client() -> Generator:
    # Use Service Role Key for backend operations (if provided), else fallback to key
    # Ideally backend uses service role to bypass RLS for data ingestion
    # For now we use the provided key in settings
    key = settings.SUPABASE_KEY
    url = settings.SUPABASE_URL
    if not key or not url:
        # Fallback or error handling
        yield None
    else:    
        client = create_client(url, key)
        yield client

def get_pubmed_service(supabase: Client = Depends(get_supabase_client)) -> Generator:
    service = PubMedService(supabase_client=supabase)
    yield service
