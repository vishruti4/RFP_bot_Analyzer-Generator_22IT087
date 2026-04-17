import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <NavLink to="/rfp-bot" className="navbar-brand">
                    <div className="navbar-brand-icon">🔍</div>
                    <span className="navbar-brand-name">RFP <span>Analyzer</span></span>
                </NavLink>

                <div className="navbar-nav">
                    <NavLink
                        to="/rfp-bot"
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        🤖 RFP Bot
                    </NavLink>
                    <NavLink
                        to="/history"
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        📋 History
                    </NavLink>
                </div>

                <div className="navbar-user">
                    {user && <span className="navbar-user-name">👤 {user.name}</span>}
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    )
}
