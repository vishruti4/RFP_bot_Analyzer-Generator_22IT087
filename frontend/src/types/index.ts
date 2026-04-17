export interface User {
    id: string
    name: string
    email: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    setAuth: (user: User, token: string) => void
    logout: () => void
}

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

// AWS Lambda RFP Analysis Response
export interface AnalysisResult {
    overview: string
    key_requirements: string[]
    eligibility: string
    deadlines: string[]
    evaluation_criteria: string[]
    red_flags: string[]
    complexity: 'Low' | 'Medium' | 'High'
    recommendation: string
}

export interface AnalyzeResponse {
    success: boolean
    action: "analyze"
    result?: AnalysisResult
}

// AWS Lambda Q&A Response
export interface QAResult {
    answer: string
    sources: string[]
    confidence: "high" | "medium" | "low"
}

export interface QAResponse {
    success: boolean
    action: "qa"
    result?: QAResult
}

export interface HistoryItem {
    id: string
    filename: string
    created_at: string
    summary: string
    status: 'completed' | 'processing' | 'failed'
}
