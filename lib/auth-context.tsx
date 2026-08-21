'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'Security / Police' | 'Event Organizer' | 'Administrator'

export type UserProfile = {
  name: string
  role: UserRole
  station: string
  badge: string
}

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  'Security / Police': {
    name: 'Cmdr. A. Rhodes',
    role: 'Security / Police',
    station: 'Control Room 1',
    badge: 'SEC-01',
  },
  'Event Organizer': {
    name: 'Elena Vance',
    role: 'Event Organizer',
    station: 'Organizer Suite',
    badge: 'ORG-04',
  },
  Administrator: {
    name: 'SysAdmin Alex',
    role: 'Administrator',
    station: 'HQ Tech Operations',
    badge: 'ADM-99',
  },
}

type AuthContextType = {
  user: UserProfile
  setRole: (role: UserRole) => void
  canExecuteActions: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(ROLE_PROFILES['Security / Police'])

  const setRole = (role: UserRole) => {
    setUser(ROLE_PROFILES[role])
  }

  const canExecuteActions = user.role === 'Security / Police' || user.role === 'Administrator'

  return (
    <AuthContext.Provider value={{ user, setRole, canExecuteActions }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
