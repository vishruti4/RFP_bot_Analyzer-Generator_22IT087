import axios from 'axios'

const api = axios.create({
    baseURL: '/api/v1',
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auto-logout on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

// ── Auth ──────────────────────────────────────────────
export const login = (email: string, password: string) =>
    api.post('/auth/login', { email, password })

export const register = (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password })

// ── RFP ──────────────────────────────────────────────
export const analyzeRFP = (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/rfp/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

export const chatWithRFP = (rfpId: string, message: string) =>
    api.post('/rfp/chat', { rfp_id: rfpId, message })

export const generateProposal = (rfpId: string, context: string) =>
    api.post('/rfp/generate-proposal', { rfp_id: rfpId, additional_context: context })

// ── AWS Lambda Direct API ────────────────────────────
const AWS_API_URL = 'https://fdg9au4wfh.execute-api.ap-south-1.amazonaws.com/test1'

/**
 * Analyze RFP directly via AWS Lambda API Gateway
 * @param s3Key S3 key of the RFP document
 * @returns Analysis result from Lambda with overview, requirements, deadlines, etc.
 */
export const analyzeRFPDirect = async (s3Key: string) => {
    const response = await fetch(AWS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "analyze",
            s3_key: s3Key
        })
    })
    if (!response.ok) throw new Error(`Lambda API error: ${response.status}`)
    return response.json()
}

/**
 * Ask question about RFP directly via AWS Lambda API Gateway
 * @param question Question to ask
 * @param s3Key Optional S3 key of specific RFP
 * @returns Q&A result from Lambda with answer, sources, and confidence
 */
export const askQuestionDirect = async (question: string, s3Key?: string) => {
    const response = await fetch(AWS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "qa",
            question: question,
            ...(s3Key && { s3_key: s3Key })
        })
    })
    if (!response.ok) throw new Error(`Lambda API error: ${response.status}`)
    return response.json()
}

export const analyze = async (s3Key: string) => {
    const res = await fetch(AWS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', s3_key: s3Key })
    })
    return res.json()
}

export const qa = async (question: string, s3Key?: string) => {
    const res = await fetch(AWS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'qa', question, s3_key: s3Key })
    })
    return res.json()
}

export const draft = async (s3Key: string, companyName = 'VeBuIn', hourlyRate = '5000', currency = 'JPY') => {
    const res = await fetch(AWS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draft', s3_key: s3Key, company_name: companyName, hourly_rate: hourlyRate, currency })
    })
    return res.json()
}

// ── History ───────────────────────────────────────────
export const getHistory = () => api.get('/history/')
export const getHistoryItem = (id: string) => api.get(`/history/${id}`)
export const deleteHistoryItem = (id: string) => api.delete(`/history/${id}`)

export default api
