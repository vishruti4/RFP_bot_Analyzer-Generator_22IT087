import hmac, hashlib, base64
import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

cognito = boto3.client("cognito-idp", region_name=settings.AWS_REGION)


def _secret_hash(username: str) -> str:
    msg = username + settings.COGNITO_CLIENT_ID
    dig = hmac.new(settings.COGNITO_CLIENT_SECRET.encode(), msg.encode(), hashlib.sha256).digest()
    return base64.b64encode(dig).decode()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    try:
        cognito.sign_up(
            ClientId=settings.COGNITO_CLIENT_ID,
            SecretHash=_secret_hash(user_data.email),
            Username=user_data.email,
            Password=user_data.password,
            UserAttributes=[
                {"Name": "email", "Value": user_data.email},
                {"Name": "name", "Value": user_data.name},
            ],
        )
        return {"message": "Registration successful. Check your email for the verification code."}
    except ClientError as e:
        raise HTTPException(status_code=400, detail=e.response["Error"]["Message"])


@router.post("/confirm", status_code=status.HTTP_200_OK)
async def confirm(email: str, code: str):
    try:
        cognito.confirm_sign_up(
            ClientId=settings.COGNITO_CLIENT_ID,
            SecretHash=_secret_hash(email),
            Username=email,
            ConfirmationCode=code,
        )
        return {"message": "Email confirmed. You can now log in."}
    except ClientError as e:
        raise HTTPException(status_code=400, detail=e.response["Error"]["Message"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    try:
        resp = cognito.initiate_auth(
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": credentials.email,
                "PASSWORD": credentials.password,
                "SECRET_HASH": _secret_hash(credentials.email),
            },
            ClientId=settings.COGNITO_CLIENT_ID,
        )
        tokens = resp["AuthenticationResult"]
        return {
            "access_token": tokens["IdToken"],
            "token_type": "bearer",
            "user": {"id": credentials.email, "name": credentials.email.split("@")[0], "email": credentials.email},
        }
    except ClientError as e:
        raise HTTPException(status_code=401, detail=e.response["Error"]["Message"])
