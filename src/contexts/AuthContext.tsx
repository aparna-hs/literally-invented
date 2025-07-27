import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthState, getCurrentUser } from '@/lib/auth'

interface AuthContextType extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on app start
    const storedUser = getCurrentUser()
    setUser(storedUser)
    setLoading(false)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    setLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}