/**
 * authStore.ts
 * Global auth state using Zustand.
 * LoginPage calls: setAuth(user, token)
 * ProtectedRoute calls: isAuthenticated
 * Navbar calls: user, logout
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cognitoSignOut } from '../services/cognito'

interface User {
    id: string
    name: string
    email: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    setAuth: (user: User, token: string) => void
    logout: () => Promise<void>
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // Called after successful Cognito sign-in
            setAuth: (user: User, token: string) => {
                set({ user, token, isAuthenticated: true })
            },

            // Full sign-out: clears Cognito session + local state
            logout: async () => {
                try {
                    await cognitoSignOut()
                } catch (e) {
                    console.warn('Cognito sign-out error:', e)
                }
                set({ user: null, token: null, isAuthenticated: false })
            },

            // Clear local state only (no Cognito call)
            clearAuth: () => {
                set({ user: null, token: null, isAuthenticated: false })
            },
        }),
        {
            name: 'rfp-auth',           // localStorage key
            partialize: (state) => ({   // only persist these fields
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
