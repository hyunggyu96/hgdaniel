from fastapi import APIRouter
from app.api.v1.endpoints import analyze, insights

api_router = APIRouter()
api_router.include_router(analyze.router, tags=["analysis"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])

