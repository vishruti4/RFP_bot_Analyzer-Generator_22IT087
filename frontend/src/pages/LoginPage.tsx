import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
// import { login } from '../services/api'  // ← uncomment when backend is ready

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        // ── MOCK LOGIN (remove when backend is ready) ──
        await new Promise((r) => setTimeout(r, 800))
        if (!email || !password) { setError('Please enter email and password.'); setLoading(false); return }
        setAuth({ id: '1', name: email.split('@')[0], email }, 'mock-token-ui-test')
        navigate('/rfp-bot')
        setLoading(false)
        // ── Real login (uncomment when backend ready) ──
        // try {
        //   const res = await login(email, password)
        //   setAuth(res.data.user, res.data.access_token)
        //   navigate('/rfp-bot')
        // } catch (err: any) {
        //   setError(err.response?.data?.detail || 'Invalid email or password.')
        // } finally { setLoading(false) }
    }

    return (
        <div className="auth-layout">
            {/* Brand Panel */}
            <div className="auth-brand">
                <div className="auth-brand-logo">🔍</div>
                <h1>AI RFP Analyzer</h1>
                <p>Transform complex RFPs into winning proposals powered by AWS Bedrock AI</p>
                <div className="auth-features">
                    <div className="auth-feature"><span>📄</span><span>Upload RFP documents instantly</span></div>
                    <div className="auth-feature"><span>🤖</span><span>AI analysis via AWS Bedrock (Claude)</span></div>
                    <div className="auth-feature"><span>✍️</span><span>Auto-generate professional proposals</span></div>
                    <div className="auth-feature"><span>📊</span><span>Track all your bid history in one place</span></div>
                </div>
            </div>

            {/* Form Panel */}
            <div className="auth-form-side">
                <div className="auth-card">
                    <h2>Welcome back</h2>
                    <p>Sign in to your account to continue</p>

                    {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email address</label>
                            <input id="email" type="email" className="form-input" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input id="password" type="password" className="form-input" placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? <><span className="spinner" />Signing in…</> : 'Sign in →'}
                        </button>
                    </form>

                    <div className="divider">or</div>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
