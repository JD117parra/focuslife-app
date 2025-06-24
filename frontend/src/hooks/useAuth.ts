import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '@/config/api';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

// Función auxiliar para verificar si estamos en el cliente
const isClient = () => typeof window !== 'undefined';

// Función auxiliar para obtener token de manera segura
const getTokenSafe = (): string | null => {
  if (!isClient()) return null;
  return localStorage.getItem('authToken');
};

// Función auxiliar para guardar token de manera segura
const setTokenSafe = (token: string): void => {
  if (!isClient()) return;
  localStorage.setItem('authToken', token);
};

// Función auxiliar para eliminar token de manera segura
const removeTokenSafe = (): void => {
  if (!isClient()) return;
  localStorage.removeItem('authToken');
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Manejar errores de autenticación
  const handleAuthError = useCallback((reason: string) => {
    console.warn('Auth error:', reason);
    removeTokenSafe();
    setUser(null);

    // Solo redirigir si estamos en el cliente y no estamos ya en login/register
    if (isClient()) {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        currentPath !== '/'
      ) {
        window.location.href = '/login';
      }
    }
  }, []);

  // Función para hacer fetch con autenticación automática
  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = getTokenSafe();

    if (!token) {
      handleAuthError('No hay token de autenticación');
      throw new Error('No authentication token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Si hay error de autenticación, manejar automáticamente
    if (response.status === 401 || response.status === 403) {
      handleAuthError('Token expirado o inválido');
      throw new Error('Authentication failed');
    }

    return response;
  }, [handleAuthError]);

  // Verificar autenticación al cargar - solo en el cliente
  const checkAuth = useCallback(async () => {
    // Solo ejecutar en el cliente
    if (!isClient()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = getTokenSafe();

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(apiUrls.auth.me(), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        handleAuthError('Error verificando usuario');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      handleAuthError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError]);

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(apiUrls.auth.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokenSafe(data.data.token);
        setUser(data.data.user);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout
  const logout = useCallback(() => {
    removeTokenSafe();
    setUser(null);
    if (isClient()) {
      window.location.href = '/';
    }
  }, []);

  // Verificar autenticación al montar el componente - solo en el cliente
  useEffect(() => {
    // Solo ejecutar si estamos en el cliente
    if (isClient()) {
      checkAuth();
    } else {
      // Si estamos en el servidor, marcar como no cargando
      setIsLoading(false);
    }
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    authenticatedFetch,
  };
};

export default useAuth;
