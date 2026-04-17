from fastapi import APIRouter, HTTPException, status

from app.schemas.rfp import (
    RFPAnalysisRequest,
    RFPAnalysisResponse,
    RFPQARequest,
    RFPQAResponse,
    RFPChatRequest,
    RFPChatResponse,
    ProposalGenerationRequest,
    ProposalGenerationResponse
)
from app.services.aws_lambda import aws_lambda_service


router = APIRouter(prefix="/rfp", tags=["rfp"])


@router.post("/analyze", response_model=RFPAnalysisResponse)
async def analyze_rfp(request: RFPAnalysisRequest):
    """
    Analyze an RFP document using AWS Lambda.
    
    Args:
        request: Contains S3 key of the RFP document
        
    Returns:
        Analysis result from Lambda with overview, requirements, deadlines, etc.
    """
    try:
        result = await aws_lambda_service.analyze_rfp(request.s3_key)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to analyze RFP")
            )
        
        return RFPAnalysisResponse(
            success=True,
            action="analyze",
            result=result.get("result")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing RFP: {str(e)}"
        )


@router.post("/qa", response_model=RFPQAResponse)
async def ask_question(request: RFPQARequest):
    """
    Ask a question about RFP documents using AWS Lambda.
    
    Args:
        request: Question and optional S3 key
        
    Returns:
        Answer from Lambda with sources and confidence level
    """
    try:
        result = await aws_lambda_service.ask_question(
            question=request.question,
            s3_key=request.s3_key
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to answer question")
            )
        
        return RFPQAResponse(
            success=True,
            action="qa",
            result=result.get("result")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )


@router.post("/chat", response_model=RFPChatResponse)
async def chat_with_rfp(request: RFPChatRequest):
    """
    Chat with an RFP using AWS Lambda Q&A service.
    
    Args:
        request: RFP ID and message
        
    Returns:
        Chat response from Lambda
    """
    try:
        result = await aws_lambda_service.ask_question(
            question=request.message,
            s3_key=request.rfp_id
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to process chat")
            )
        
        return RFPChatResponse(
            success=True,
            response=result.get("result", {}).get("answer", ""),
            rfp_id=request.rfp_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in chat: {str(e)}"
        )


@router.post("/generate-proposal", response_model=ProposalGenerationResponse)
async def generate_proposal(request: ProposalGenerationRequest):
    """
    Generate a proposal based on RFP analysis and additional context.
    
    Args:
        request: RFP ID and additional context
        
    Returns:
        Generated proposal
    """
    try:
        # Combine RFP analysis with additional context
        qa_result = await aws_lambda_service.ask_question(
            question=f"Generate a comprehensive proposal incorporating the following context: {request.additional_context}",
            s3_key=request.rfp_id
        )
        
        if not qa_result.get("success"):
            return ProposalGenerationResponse(
                success=False,
                error=qa_result.get("error", "Failed to generate proposal")
            )
        
        return ProposalGenerationResponse(
            success=True,
            proposal=qa_result.get("result", {}).get("answer", "")
        )
    except Exception as e:
        return ProposalGenerationResponse(
            success=False,
            error=f"Error generating proposal: {str(e)}"
        )
