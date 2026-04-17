import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '../types'

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user: User, token: string) => {
                localStorage.setItem('token', token)
                set({ user, token, isAuthenticated: true })
            },
            logout: () => {
                localStorage.removeItem('token')
                set({ user: null, token: null, isAuthenticated: false })
            },
        }),
        { name: 'rfp-auth' }
    )
)
