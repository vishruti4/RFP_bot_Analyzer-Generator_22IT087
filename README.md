# RFP Analysis Application

A full-stack application for analyzing RFPs using AWS Lambda with a React frontend and FastAPI backend.

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────────────┐
│   React     │         │   FastAPI   │         │   AWS Lambda API     │
│  Frontend   ├────────▶│  Backend    ├────────▶│   Gateway/S3         │
│  (Port 3000)│         │ (Port 8000) │         │   (RFP Analysis)     │
└─────────────┘         └─────────────┘         └──────────────────────┘
```

## Features

- **RFP Analysis**: Upload and analyze RFP documents via AWS Lambda
- **Q&A**: Ask questions about RFP documents
- **Proposal Generation**: Generate proposals based on RFP analysis
- **User Authentication**: Register and login functionality
- **Direct AWS Integration**: Option to call AWS Lambda API directly from frontend

## Backend Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (optional, for production)

### Installation

1. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `AWS_API_URL`: Your AWS Lambda API Gateway endpoint
- `AWS_S3_BUCKET`: Your S3 bucket name
- `JWT_SECRET_KEY`: A secure random key for JWT

3. **Run the backend**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

#### RFP Analysis
- `POST /api/v1/rfp/analyze` - Analyze RFP document
- `POST /api/v1/rfp/qa` - Ask question about RFP
- `POST /api/v1/rfp/chat` - Chat with RFP
- `POST /api/v1/rfp/generate-proposal` - Generate proposal

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Start development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Usage

The frontend provides two ways to interact with RFP analysis:

1. **Via Backend API** (Recommended for production):
```typescript
import { analyzeRFP, chatWithRFP, generateProposal } from '@/services/api'

// Analyze RFP
await analyzeRFP(file)

// Chat with RFP
await chatWithRFP(rfpId, message)

// Generate proposal
await generateProposal(rfpId, context)
```

2. **Direct AWS Lambda** (For testing):
```typescript
import { analyzeRFPDirect, askQuestionDirect } from '@/services/api'

// Analyze RFP directly
await analyzeRFPDirect(s3Key)

// Ask question directly
await askQuestionDirect(question, s3Key)
```

## Docker Deployment

### Build and run with Docker Compose

```bash
docker-compose up --build
```

This will start:
- Backend on `http://localhost:8000`
- Frontend on `http://localhost:3000`

## Project Structure

### Backend
```
backend/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   └── rfp.py       # RFP analysis endpoints
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py        # Configuration settings
│   │   └── security.py      # JWT and password utilities
│   ├── schemas/             # Request/response models
│   ├── services/
│   │   └── aws_lambda.py    # AWS Lambda integration
│   └── main.py              # FastAPI app initialization
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Frontend
```
frontend/
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── services/
│   │   └── api.ts          # API integration
│   ├── store/              # State management
│   ├── types/              # TypeScript types
│   └── utils/
├── package.json
├── vite.config.ts
└── Dockerfile
```

## AWS Lambda Integration

### Setting up AWS Lambda

1. **Your Lambda function should handle**:
   - `action: "analyze"` - Analyze RFP and return key information
   - `action: "qa"` - Answer questions about RFP documents

2. **Expected request format**:
```json
{
  "action": "analyze",
  "s3_key": "path/to/rfp.pdf"
}
```

3. **Expected response format**:
```json
{
  "success": true,
  "data": {
    "key_dates": [],
    "requirements": [],
    "budget": null,
    ...
  }
}
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/rfp_db
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
AWS_API_URL=https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/rfp
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-south-1
DEBUG=true
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Development

### Backend Testing
```bash
cd backend
# Run tests (when available)
pytest
```

### Frontend Testing
```bash
cd frontend
# Run tests
npm run test
```

## Production Deployment

1. **Set secure environment variables** in your deployment platform
2. **Use production-grade database** (PostgreSQL)
3. **Enable HTTPS** and secure CORS
4. **Use proper secrets management** for JWT and AWS credentials
5. **Configure proper logging** and monitoring
6. **Scale according to traffic** needs

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.11+)
- Verify all dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

### Frontend won't connect to backend
- Verify backend is running on `http://localhost:8000`
- Check CORS settings in `app/main.py`
- Check browser console for CORS errors

### AWS Lambda returning 403/401
- Verify AWS credentials are correct
- Check API Gateway authentication settings
- Verify S3 bucket permissions

## License

MIT

## Support

For issues or questions, check the backend logs:
```bash
docker logs rfp-backend
```

And frontend console (F12 in browser).
