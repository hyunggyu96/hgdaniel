from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Any, List
from app.api import deps
from app.services.pubmed_service import PubMedService
from pydantic import BaseModel

class InsightsFetchRequest(BaseModel):
    keywords: List[str]
    max_results: int = 100

class InsightsFetchResponse(BaseModel):
    message: str
    status: str

router = APIRouter()

@router.post("/fetch", response_model=InsightsFetchResponse)
async def fetch_pubmed_insights(
    request: InsightsFetchRequest,
    background_tasks: BackgroundTasks,
    pubmed: PubMedService = Depends(deps.get_pubmed_service)
) -> Any:
    """
    Triggers a background task to fetch PubMed papers for the given keywords.
    """
    if not pubmed.supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")

    # Run in background to avoid timeout
    background_tasks.add_task(pubmed.trigger_fetch, request.keywords, request.max_results)
    
    return {
        "message": f"Started fetching papers for {len(request.keywords)} keywords.",
        "status": "processing"
    }
