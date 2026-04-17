from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router

app = FastAPI(
    title="RFP Analysis API",
    description="API for analyzing RFP documents using AWS Lambda",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "rfp-api"}


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    from app.services.aws_lambda import aws_lambda_service
    await aws_lambda_service.close()
