import httpx
import json
from typing import Optional, Dict, Any

from app.core.config import settings


class AWSLambdaService:
    """Service to interact with AWS Lambda API Gateway"""

    def __init__(self):
        self.API_URL = settings.AWS_API_URL
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    async def analyze_rfp(self, s3_key: str) -> Dict[str, Any]:
        """
        Call AWS Lambda to analyze RFP document
        
        Args:
            s3_key: S3 key of the RFP document
            
        Returns:
            Response from Lambda function
        """
        payload = {
            "action": "analyze",
            "s3_key": s3_key
        }
        
        return await self._call_lambda(payload)

    async def ask_question(
        self, 
        question: str, 
        s3_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Call AWS Lambda for Q&A on RFP
        
        Args:
            question: Question to ask about RFP
            s3_key: Optional S3 key if specific RFP should be queried
            
        Returns:
            Response from Lambda function
        """
        payload = {
            "action": "qa",
            "question": question
        }
        
        if s3_key:
            payload["s3_key"] = s3_key
        
        return await self._call_lambda(payload)

    async def _call_lambda(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Internal method to call Lambda via API Gateway
        
        Args:
            payload: Request payload
            
        Returns:
            Parsed JSON response
        """
        try:
            response = await self.client.post(
                self.API_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "error": f"Lambda API error: {e.response.status_code}",
                "details": e.response.text
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error calling Lambda: {str(e)}"
            }


# Singleton instance
aws_lambda_service = AWSLambdaService()
