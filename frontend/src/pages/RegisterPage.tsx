import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cognitoSignUp, cognitoConfirm } from '../services/cognito'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [code, setCode] = useState('')
    const [needsConfirm, setNeedsConfirm] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!needsConfirm) {
            if (password !== confirm) { setError('Passwords do not match.'); return }
            if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
            setLoading(true)
            try {
                await cognitoSignUp(name, email, password)
                setNeedsConfirm(true)
            } catch (err: any) {
                setError(err.message || 'Registration failed.')
            } finally {
                setLoading(false)
            }
        } else {
            setLoading(true)
            try {
                await cognitoConfirm(email, code)
                navigate('/login')
            } catch (err: any) {
                setError(err.message || 'Invalid confirmation code.')
            } finally {
                setLoading(false)
            }
        }
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
                    <h2>{needsConfirm ? 'Verify your email' : 'Create account'}</h2>
                    <p>{needsConfirm ? 'Enter the code sent to your email' : 'Start analyzing RFPs with AI — free'}</p>

                    {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!needsConfirm ? (
                        <>
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
                        </>
                        ) : (
                        <div className="form-group">
                            <label className="form-label" htmlFor="code">Verification code</label>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Check your email <strong>{email}</strong> for the code.</p>
                            <input id="code" type="text" className="form-input" placeholder="Enter 6-digit code"
                                value={code} onChange={(e) => setCode(e.target.value)} required autoComplete="one-time-code" />
                        </div>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading
                                ? <><span className="spinner" />{needsConfirm ? 'Verifying…' : 'Creating account…'}</>
                                : needsConfirm ? 'Verify email →' : 'Create account →'}
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
