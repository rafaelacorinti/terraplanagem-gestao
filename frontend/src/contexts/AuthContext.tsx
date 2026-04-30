import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { accessRequestStorage } from '../services/storage'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USER: User = {
  id: '1',
  name: 'Rafael Admin',
  email: 'admin@terra.com',
  role: 'ADMIN',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      } else {
        setUser(MOCK_USER)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Check access requests first
    const requests = accessRequestStorage.getAll()
    const userRequest = requests.find(r => r.email === email)

    if (userRequest) {
      if (userRequest.status === 'PENDING') {
        throw new Error('Sua solicitação ainda está em análise')
      }
      if (userRequest.status === 'REJECTED') {
        throw new Error('Acesso não autorizado')
      }
      if (userRequest.status === 'APPROVED') {
        if (userRequest.password === password) {
          const approvedUser: User = {
            id: userRequest.id,
            name: userRequest.name,
            email: userRequest.email,
            role: 'OPERATOR',
          }
          localStorage.setItem('token', 'user-token-' + userRequest.id)
          localStorage.setItem('currentUser', JSON.stringify(approvedUser))
          setUser(approvedUser)
          return
        } else {
          throw new Error('Email ou senha inválidos')
        }
      }
    }

    // Mock login first (no backend needed)
    if (email === 'admin@terra.com' && password === 'admin123') {
      localStorage.setItem('token', 'mock-token-123')
      localStorage.setItem('currentUser', JSON.stringify(MOCK_USER))
      setUser(MOCK_USER)
      return
    }

    // Try real API
    try {
      const { authService } = await import('../services/auth.service')
      const { token, user: apiUser } = await authService.login(email, password)
      localStorage.setItem('token', token)
      localStorage.setItem('currentUser', JSON.stringify(apiUser))
      setUser(apiUser)
    } catch {
      throw new Error('Email ou senha inválidos')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
