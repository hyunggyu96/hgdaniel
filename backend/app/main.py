from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Dedicated AI & Data Analysis Service for Coauths Platform",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration - explicit allowlist only
origins = [
    "http://localhost:3000",
    "https://coauths.com",
    "https://www.coauths.com",
    "https://aesthetics-intelligence.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Coauths Intelligence Backend"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
