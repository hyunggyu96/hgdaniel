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

# CORS Configuration
origins = [
    "http://localhost:3000",
    "https://coauths.com",
    "https://www.coauths.com",
    # Add your Vercel deployment domains here
    "*" # Temporarily allow all for development/migration
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Coauths Intelligence Backend"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
