from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/rfp_db"
    JWT_SECRET_KEY: str = "your-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    AWS_API_URL: str = "https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/rfp"
    AWS_S3_BUCKET: str = "your-bucket-name"
    AWS_REGION: str = "ap-south-1"
    DEBUG: bool = True
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    COGNITO_CLIENT_SECRET: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
