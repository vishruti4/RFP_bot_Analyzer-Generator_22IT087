## AWS Lambda API Response Formats

This document details the expected request and response formats for the AWS Lambda API integration.

### Analyze RFP

**Request:**
```json
{
  "action": "analyze",
  "s3_key": "path/to/rfp.pdf"
}
```

**Response:**
```typescript
interface AnalyzeResponse {
  success: boolean;
  action: "analyze";
  result?: {
    overview: string;
    key_requirements: string[];
    eligibility: string;
    deadlines: string[];
    evaluation_criteria: string[];
    red_flags: string[];
    complexity: "Low" | "Medium" | "High";
    recommendation: string;
  };
}
```

**Example Response:**
```json
{
  "success": true,
  "action": "analyze",
  "result": {
    "overview": "Enterprise software licensing RFP with 3-year commitment",
    "key_requirements": [
      "Multi-tenant architecture",
      "GDPR compliance",
      "99.9% SLA",
      "Real-time reporting"
    ],
    "eligibility": "Vendors with 5+ years experience in enterprise software",
    "deadlines": [
      "2026-05-15: Proposal submission",
      "2026-06-01: Vendor presentations",
      "2026-06-30: Final decision"
    ],
    "evaluation_criteria": [
      "Technical capability (40%)",
      "Cost (30%)",
      "Support & SLA (20%)",
      "References (10%)"
    ],
    "red_flags": [
      "No GDPR certification mentioned",
      "Short implementation timeline (3 months)",
      "Unclear data residency requirements"
    ],
    "complexity": "High",
    "recommendation": "Requires significant customization - estimated effort: 4-6 months"
  }
}
```

---

### Q&A (Question & Answer)

**Request:**
```json
{
  "action": "qa",
  "question": "What is the budget for this RFP?",
  "s3_key": "path/to/rfp.pdf"
}
```

**Response:**
```typescript
interface QAResponse {
  success: boolean;
  action: "qa";
  result?: {
    answer: string;
    sources: string[];
    confidence: "high" | "medium" | "low";
  };
}
```

**Example Response:**
```json
{
  "success": true,
  "action": "qa",
  "result": {
    "answer": "The total budget for this RFP is $500,000 over 3 years, with annual allocations of $200,000 (Year 1), $150,000 (Year 2), and $150,000 (Year 3).",
    "sources": [
      "Section 4.2 - Budget Allocation",
      "Appendix B - Financial Terms",
      "Page 12, Line 5-8"
    ],
    "confidence": "high"
  }
}
```

---

## Frontend Usage

### Backend API (Recommended)

```typescript
import { analyzeRFP, chatWithRFP, generateProposal } from '@/services/api'

// Analyze RFP
const analysis = await analyzeRFP(file)
// Returns: AnalyzeResponse from backend (/api/v1/rfp/analyze)

// Chat with RFP
const chatResponse = await chatWithRFP(rfpId, "What are the key requirements?")
// Returns: { success: boolean, response: string, rfp_id: string }

// Generate proposal
const proposal = await generateProposal(rfpId, "Our company specializes in...")
// Returns: { success: boolean, proposal?: string, error?: string }
```

### Direct AWS Lambda (Testing)

```typescript
import { analyzeRFPDirect, askQuestionDirect } from '@/services/api'
import type { AnalyzeResponse, QAResponse } from '@/types'

// Analyze RFP directly
const analysis: AnalyzeResponse = await analyzeRFPDirect('docs/rfp-2026.pdf')

// Ask question directly
const qa: QAResponse = await askQuestionDirect('What is the deadline?', 'docs/rfp-2026.pdf')
```

---

## Backend API Endpoints

### POST /api/v1/rfp/analyze

Analyzes an RFP document via AWS Lambda.

**Request:**
```json
{
  "s3_key": "path/to/document.pdf"
}
```

**Response:** `AnalyzeResponse`

---

### POST /api/v1/rfp/qa

Ask questions about RFP documents.

**Request:**
```json
{
  "question": "What are the key requirements?",
  "s3_key": "path/to/document.pdf"
}
```

**Response:** `QAResponse`

---

### POST /api/v1/rfp/chat

Chat interface for RFP Q&A.

**Request:**
```json
{
  "rfp_id": "doc-id-123",
  "message": "What's the budget?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "The budget is $500,000",
  "rfp_id": "doc-id-123"
}
```

---

### POST /api/v1/rfp/generate-proposal

Generate a proposal based on RFP analysis.

**Request:**
```json
{
  "rfp_id": "doc-id-123",
  "additional_context": "Our company has 10 years experience..."
}
```

**Response:**
```json
{
  "success": true,
  "proposal": "Generated proposal text...",
  "error": null
}
```

---

## Type Definitions (TypeScript)

```typescript
// Analysis Response Types
interface AnalysisResult {
  overview: string;
  key_requirements: string[];
  eligibility: string;
  deadlines: string[];
  evaluation_criteria: string[];
  red_flags: string[];
  complexity: "Low" | "Medium" | "High";
  recommendation: string;
}

interface AnalyzeResponse {
  success: boolean;
  action: "analyze";
  result?: AnalysisResult;
}

// Q&A Response Types
interface QAResult {
  answer: string;
  sources: string[];
  confidence: "high" | "medium" | "low";
}

interface QAResponse {
  success: boolean;
  action: "qa";
  result?: QAResult;
}

// Chat Response Type
interface RFPChatResponse {
  success: boolean;
  response: string;
  rfp_id: string;
}

// Proposal Response Type
interface ProposalGenerationResponse {
  success: boolean;
  proposal?: string;
  error?: string;
}
```

---

## Error Handling

All responses include a `success` boolean. When `success` is `false`:

```json
{
  "success": false,
  "error": "RFP document not found or S3 access denied"
}
```

HTTP Status Codes:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid request format or Lambda returned error
- `401 Unauthorized`: Missing/invalid authentication
- `500 Internal Server Error`: Server-side error
