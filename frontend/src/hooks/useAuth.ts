import { useState, useEffect } from 'react'
import { apiUrls } from '@/config/api'

interface AuthUser {
  id: string
  email: string
  name: string | null
}

interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para hacer fetch con autenticación automática
  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      handleAuthError('No hay token de autenticación')
      throw new Error('No authentication token')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Si hay error de autenticación, manejar automáticamente
    if (response.status === 401 || response.status === 403) {
      handleAuthError('Token expirado o inválido')
      throw new Error('Authentication failed')
    }

    return response
  }

  // Manejar errores de autenticación
  const handleAuthError = (reason: string) => {
    console.warn('Auth error:', reason)
    localStorage.removeItem('authToken')
    setUser(null)
    
    // Solo redirigir si no estamos ya en login/register
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/') {
      window.location.href = '/login'
    }
  }

  // Verificar autenticación al cargar
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(apiUrls.auth.me(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
      } else {
        handleAuthError('Error verificando usuario')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      handleAuthError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(apiUrls.auth.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.data.token)
        setUser(data.data.user)
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    window.location.href = '/'
  }

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    authenticatedFetch
  }
}

export default useAuth