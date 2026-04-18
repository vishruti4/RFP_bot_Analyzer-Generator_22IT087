from pydantic import BaseModel
from typing import Optional, Any, Literal
from fastapi import UploadFile, File
import boto3

class RFPAnalysisRequest(BaseModel):
    s3_key: str


class AnalysisResult(BaseModel):
    overview: str
    key_requirements: list[str]
    eligibility: str
    deadlines: list[str]
    evaluation_criteria: list[str]
    red_flags: list[str]
    complexity: Literal["Low", "Medium", "High"]
    recommendation: str


class RFPAnalysisResponse(BaseModel):
    success: bool
    action: str = "analyze"
    result: Optional[AnalysisResult] = None


class RFPQARequest(BaseModel):
    question: str
    s3_key: Optional[str] = None


class QAResult(BaseModel):
    answer: str
    sources: list[str]
    confidence: Literal["high", "medium", "low"]


class RFPQAResponse(BaseModel):
    success: bool
    action: str = "qa"
    result: Optional[QAResult] = None


class RFPChatRequest(BaseModel):
    rfp_id: str
    message: str


class RFPChatResponse(BaseModel):
    success: bool
    response: str
    rfp_id: str


class ProposalGenerationRequest(BaseModel):
    rfp_id: str
    additional_context: str


class ProposalGenerationResponse(BaseModel):
    success: bool
    proposal: Optional[str] = None
    error: Optional[str] = None

@router.post("/upload")
async def upload_rfp(file: UploadFile = File(...)):
    """Upload RFP file to S3 and return the S3 key"""
    try:
        s3_client = boto3.client('s3')
        bucket = 'your-bucket-name'
        s3_key = f"rfp-uploads/{file.filename}"
        
        # Upload to S3
        await file.seek(0)
        s3_client.put_object(
            Bucket=bucket,
            Key=s3_key,
            Body=await file.read()
        )
        
        return {"success": True, "s3_key": s3_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))