import { useState } from 'react'
import Navbar from '../components/Layout/Navbar'
import type { HistoryItem } from '../types'

// ── Mock history data ─────────────────────────────────────────────────────────
const MOCK_HISTORY: HistoryItem[] = [
    {
        id: '1',
        filename: 'DOD_Cloud_Analytics_RFP_2026.pdf',
        created_at: '2026-03-01T10:30:00Z',
        summary: 'Federal agency seeking a cloud-based data analytics platform with real-time dashboards, RBAC, and SOC 2 compliance hosted on AWS.',
        status: 'completed',
    },
    {
        id: '2',
        filename: 'Healthcare_IT_Modernisation_RFP.docx',
        created_at: '2026-02-25T14:15:00Z',
        summary: 'Hospital network requesting an EHR integration platform with HL7/FHIR APIs, HIPAA-compliant data storage, and patient portal.',
        status: 'completed',
    },
    {
        id: '3',
        filename: 'Smart_City_IoT_Platform_RFP.pdf',
        created_at: '2026-02-20T09:00:00Z',
        summary: 'Municipality seeking an IoT data platform to aggregate sensor data from traffic, utilities, and public safety systems.',
        status: 'completed',
    },
    {
        id: '4',
        filename: 'Education_LMS_Upgrade_RFP.pdf',
        created_at: '2026-02-15T16:45:00Z',
        summary: 'University district looking to upgrade their Learning Management System with AI-powered personalisation and accessibility features.',
        status: 'failed',
    },
    {
        id: '5',
        filename: 'Cybersecurity_Audit_Services_RFP.pdf',
        created_at: '2026-02-10T11:00:00Z',
        summary: 'Financial institution seeking penetration testing, vulnerability assessments, and a managed SOC with 24/7 monitoring.',
        status: 'completed',
    },
]

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function HistoryPage() {
    const [items] = useState<HistoryItem[]>(MOCK_HISTORY)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all')

    const filtered = items.filter((item) => {
        const matchSearch = item.filename.toLowerCase().includes(search.toLowerCase()) ||
            item.summary.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || item.status === filter
        return matchSearch && matchFilter
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />

            <div className="history-page">
                {/* Header */}
                <div className="page-header">
                    <h2>📋 Analysis History</h2>
                    <p style={{ fontSize: '0.9rem' }}>All your past RFP analyses and generated proposals</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="🔍 Search by filename or keyword…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: '320px' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['all', 'completed', 'failed'] as const).map((f) => (
                            <button
                                key={f}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: 'auto', padding: '0.45rem 1rem' }}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'All' : f === 'completed' ? '✅ Completed' : '❌ Failed'}
                            </button>
                        ))}
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No results found</h3>
                        <p>Try a different search term or filter.</p>
                    </div>
                ) : (
                    <div className="history-grid">
                        {filtered.map((item) => (
                            <div key={item.id} className="history-card">
                                <div className="history-card-header">
                                    <div className="hc-icon">📄</div>
                                    <div style={{ flex: 1 }}>
                                        <p className="hc-title">{item.filename}</p>
                                        <div style={{ marginTop: '0.3rem' }}>
                                            <span className={`badge ${item.status === 'completed' ? 'badge-success' : 'badge-error'}`}>
                                                {item.status === 'completed' ? '✅ Completed' : '❌ Failed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="hc-summary">{item.summary}</p>

                                <div className="hc-footer">
                                    <span>📅 {formatDate(item.created_at)}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {item.status === 'completed' && (
                                            <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>
                                                View
                                            </button>
                                        )}
                                        <button className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
