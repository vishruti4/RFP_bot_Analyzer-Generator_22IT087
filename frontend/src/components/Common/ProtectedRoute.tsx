/**
 * ProtectedRoute.tsx
 * Redirects unauthenticated users to /login.
 * Used in App.tsx to wrap /rfp-bot and /history routes.
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
