import { useState, useRef, useCallback } from 'react'
import Navbar from '../components/Layout/Navbar'
import { analyze, qa, draft } from '../services/api'
import type { Message, AnalysisResult } from '../types'

// ── Component ─────────────────────────────────────────────────────────────────
export default function RFPBotPage() {
    const [file, setFile] = useState<File | null>(null)
    const [s3Key, setS3Key] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [analyzeError, setAnalyzeError] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [activeTab, setActiveTab] = useState<'chat' | 'proposal'>('chat')
    const [proposal, setProposal] = useState('')
    const [generatingProposal, setGeneratingProposal] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // ── File handling ────────────────────────────────────────────────────────────
    const handleFile = useCallback((f: File) => {
        setFile(f)
        setS3Key(f.name)
        setAnalysis(null)
        setMessages([])
        setProposal('')
        setAnalyzeError('')
    }, [])

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped) handleFile(dropped)
    }

    // ── Analyse ──────────────────────────────────────────────────────────────────
    const handleAnalyze = async () => {
        if (!file || !s3Key) return
        setAnalyzing(true)
        setAnalyzeError('')
        try {
            const res = await analyze(s3Key)
            if (!res.success) throw new Error(res.error || 'Analysis failed')
            const result: AnalysisResult = res.result
            setAnalysis(result)
            setMessages([{
                id: '1',
                role: 'assistant',
                content: `✅ I've analysed **${file.name}**. Here's what I found:\n\n${result.overview}\n\nFeel free to ask me anything about this RFP!`,
                timestamp: new Date().toISOString(),
            }])
        } catch (e: any) {
            setAnalyzeError(e.message || 'Failed to analyse RFP')
        } finally {
            setAnalyzing(false)
        }
    }

    // ── Chat ─────────────────────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!input.trim() || !analysis) return
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toISOString() }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setSending(true)
        try {
            const res = await qa(userMsg.content, s3Key)
            const answer = res.result?.answer || res.answer || 'No answer returned.'
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, timestamp: new Date().toISOString() }
            setMessages((prev) => [...prev, aiMsg])
        } catch {
            setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Failed to get a response. Please try again.', timestamp: new Date().toISOString() }])
        } finally {
            setSending(false)
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // ── Generate Proposal ────────────────────────────────────────────────────────
    const handleGenerateProposal = async () => {
        if (!s3Key) return
        setGeneratingProposal(true)
        try {
            const res = await draft(s3Key)
            if (!res.success) throw new Error(res.error || 'Draft generation failed')

            const r = res.result
            const sections: string[] = []

            if (r.executive_summary)
                sections.push(`# Executive Summary\n\n${r.executive_summary}`)
            if (r.understanding_of_requirements)
                sections.push(`# Understanding of Requirements\n\n${r.understanding_of_requirements}`)
            if (r.proposed_solution)
                sections.push(`# Proposed Solution\n\n${r.proposed_solution}`)
            if (r.team_and_qualifications)
                sections.push(`# Team & Qualifications\n\n${r.team_and_qualifications}`)
            if (r.project_timeline?.length) {
                const timeline = r.project_timeline
                    .map((p: any) => `• ${p.phase} (${p.duration}): ${p.deliverables}`)
                    .join('\n')
                sections.push(`# Project Timeline\n\n${timeline}`)
            }
            if (r.deliverables?.length)
                sections.push(`# Deliverables\n\n${r.deliverables.map((d: string) => `• ${d}`).join('\n')}`)
            if (r.pricing) {
                const p = r.pricing
                sections.push(
                    `# Pricing\n\n` +
                    `Currency: ${p.currency}\n` +
                    `Hourly Rate: ${p.hourly_rate}\n` +
                    `Estimated Hours: ${p.estimated_hours}\n` +
                    `Total Estimate: ${p.total_estimate}\n` +
                    `Payment Terms: ${p.payment_terms}`
                )
            }
            if (r.why_us)
                sections.push(`# Why Us\n\n${r.why_us}`)
            if (r.next_steps)
                sections.push(`# Next Steps\n\n${Array.isArray(r.next_steps) ? r.next_steps.map((s: string) => `• ${s}`).join('\n') : r.next_steps}`)
            if (r.compliance_checklist?.length)
                sections.push(`# Compliance Checklist\n\n${r.compliance_checklist.map((c: string) => `☐ ${c}`).join('\n')}`)

            setProposal(sections.join('\n\n---\n\n'))
            setActiveTab('proposal')
        } catch (e: any) {
            setProposal(`⚠️ Failed to generate proposal: ${e.message}`)
            setActiveTab('proposal')
        } finally {
            setGeneratingProposal(false)
        }
    }

    return (
        <div className="rfp-layout">
            <Navbar />

            <div className="rfp-content">
                {/* ── Sidebar ── */}
                <aside className="rfp-sidebar">
                    {/* Upload */}
                    <div>
                        <p className="analysis-label">Upload RFP Document</p>
                        <div
                            className={`upload-area${dragOver ? ' drag-over' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                        >
                            <div className="upload-icon">📄</div>
                            {file ? (
                                <>
                                    <p className="upload-title" style={{ color: 'var(--primary-l)' }}>{file.name}</p>
                                    <p className="upload-sub">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                                </>
                            ) : (
                                <>
                                    <p className="upload-title">Drop your RFP here</p>
                                    <p className="upload-sub">PDF, DOCX or TXT · Click to browse</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                        </div>

                        {file && !analysis && (
                            <>
                                <input
                                    className="form-input"
                                    style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                                    placeholder="S3 key — e.g. prj-1/EN_RFP本紙_DPP.pdf"
                                    value={s3Key}
                                    onChange={(e) => setS3Key(e.target.value)}
                                />
                                {analyzeError && <p style={{ color: 'var(--error, #f87171)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{analyzeError}</p>}
                                <button className="btn btn-primary" style={{ marginTop: '0.875rem' }}
                                    onClick={handleAnalyze} disabled={analyzing || !s3Key}>
                                    {analyzing ? <><span className="spinner" /> Analysing…</> : '🤖 Analyse RFP'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Analysis results */}
                    {analysis && (
                        <div>
                            <p className="analysis-label">📊 RFP Summary</p>
                            <div className="section-card">
                                <p className="analysis-text">{analysis.overview}</p>
                            </div>

                            <div className="section-card">
                                <p className="analysis-label">Key Requirements</p>
                                {analysis.key_requirements.map((r, i) => (
                                    <div key={i} className="req-item"><span className="req-dot" />{r}</div>
                                ))}
                            </div>

                            {analysis.deadlines?.length > 0 && (
                                <div className="section-card">
                                    <p className="analysis-label">📅 Deadlines</p>
                                    {analysis.deadlines.map((d, i) => (
                                        <p key={i} className="analysis-text">{d}</p>
                                    ))}
                                </div>
                            )}

                            {analysis.red_flags?.length > 0 && (
                                <div className="section-card">
                                    <p className="analysis-label">🚩 Red Flags</p>
                                    {analysis.red_flags.map((r, i) => (
                                        <div key={i} className="req-item"><span className="req-dot" style={{ background: '#f87171' }} />{r}</div>
                                    ))}
                                </div>
                            )}

                            <div className="section-card">
                                <p className="analysis-text">📊 <strong>Complexity:</strong> {analysis.complexity} &nbsp;|&nbsp; 💡 {analysis.recommendation}</p>
                            </div>

                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.25rem' }}
                                onClick={handleGenerateProposal} disabled={generatingProposal}>
                                {generatingProposal ? <><span className="spinner" /> Generating…</> : '✍️ Generate Proposal'}
                            </button>
                        </div>
                    )}
                </aside>

                {/* ── Main area ── */}
                <main className="rfp-main">
                    {!analysis ? (
                        <div className="welcome-banner" style={{ margin: 'auto', maxWidth: 480 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                            <h3>Upload an RFP to get started</h3>
                            <p>I'll analyse it using AWS Bedrock AI and help you craft a winning proposal.</p>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="tabs">
                                <button className={`tab${activeTab === 'chat' ? ' active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
                                <button className={`tab${activeTab === 'proposal' ? ' active' : ''}`} onClick={() => setActiveTab('proposal')}>📝 Proposal</button>
                            </div>

                            {/* Chat Tab */}
                            {activeTab === 'chat' && (
                                <>
                                    <div className="chat-messages">
                                        {messages.map((m) => (
                                            <div key={m.id} className={`chat-message ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                                                <div className={`chat-avatar ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                                                    {m.role === 'assistant' ? '🤖' : '👤'}
                                                </div>
                                                <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                                            </div>
                                        ))}
                                        {sending && (
                                            <div className="chat-message ai">
                                                <div className="chat-avatar ai">🤖</div>
                                                <div className="chat-bubble">
                                                    <span className="spinner" style={{ borderTopColor: 'var(--primary-l)', borderColor: 'rgba(124,58,237,.2)' }} />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="chat-input-area">
                                        <div className="chat-input-row">
                                            <textarea
                                                className="chat-textarea"
                                                placeholder="Ask anything about this RFP… (e.g. What is the deadline?)"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                                                rows={1}
                                            />
                                            <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || sending}>➤</button>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                                            Press Enter to send · Shift+Enter for newline
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Proposal Tab */}
                            {activeTab === 'proposal' && (
                                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                                    {proposal ? (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary btn-sm"
                                                    onClick={() => navigator.clipboard.writeText(proposal)}>
                                                    📋 Copy
                                                </button>
                                                <button className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        const blob = new Blob([proposal], { type: 'text/plain' })
                                                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                                                        a.download = 'proposal.md'; a.click()
                                                    }}>
                                                    ⬇️ Download
                                                </button>
                                            </div>
                                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.7 }}>
                                                {proposal}
                                            </pre>
                                        </>
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📝</div>
                                            <h3>No proposal yet</h3>
                                            <p>Click "Generate Proposal" in the sidebar to create one.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
