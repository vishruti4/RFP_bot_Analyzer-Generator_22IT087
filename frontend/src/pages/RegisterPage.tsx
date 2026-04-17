import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
// import { register } from '../services/api'  // ← uncomment when backend is ready

export default function RegisterPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (password !== confirm) { setError('Passwords do not match.'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
        setLoading(true)
        // ── MOCK REGISTER (remove when backend is ready) ──
        await new Promise((r) => setTimeout(r, 1000))
        setAuth({ id: Date.now().toString(), name, email }, 'mock-token-ui-test')
        navigate('/rfp-bot')
        setLoading(false)
        // ── Real register (uncomment when backend ready) ──
        // try {
        //   const res = await register(name, email, password)
        //   setAuth(res.data.user, res.data.access_token)
        //   navigate('/rfp-bot')
        // } catch (err: any) {
        //   setError(err.response?.data?.detail || 'Registration failed.')
        // } finally { setLoading(false) }
    }

    return (
        <div className="auth-layout">
            <div className="auth-brand">
                <div className="auth-brand-logo">🔍</div>
                <h1>AI RFP Analyzer</h1>
                <p>Join teams winning more bids with AI-powered proposal generation on AWS</p>
                <div className="auth-features">
                    <div className="auth-feature"><span>🔒</span><span>Secure AWS Cognito authentication</span></div>
                    <div className="auth-feature"><span>☁️</span><span>Documents stored on Amazon S3</span></div>
                    <div className="auth-feature"><span>⚡</span><span>Instant AI analysis in seconds</span></div>
                    <div className="auth-feature"><span>🎯</span><span>Higher win rates with AI proposals</span></div>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-card">
                    <h2>Create account</h2>
                    <p>Start analyzing RFPs with AI — free</p>

                    {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Full name</label>
                            <input id="name" type="text" className="form-input" placeholder="Jane Smith"
                                value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email address</label>
                            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">Password</label>
                            <input id="reg-password" type="password" className="form-input" placeholder="Min. 8 characters"
                                value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm">Confirm password</label>
                            <input id="confirm" type="password" className="form-input" placeholder="Repeat password"
                                value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" />Creating account…</> : 'Create account →'}
                        </button>
                    </form>

                    <div className="divider">or</div>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
