from pydantic import BaseModel
from typing import Optional, Any, Literal


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
