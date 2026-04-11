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

// Helper to check if we're in the browser
const isClient = () => typeof window !== 'undefined';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle auth errors
  const handleAuthError = useCallback((reason: string) => {
    console.warn('Auth error:', reason);
    setUser(null);

    if (isClient()) {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        currentPath !== '/'
      ) {
        window.location.href = '/';
      }
    }
  }, []);

  // Fetch with credentials (httpOnly cookies sent automatically)
  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError('Token expired or invalid');
      throw new Error('Authentication failed');
    }

    return response;
  }, [handleAuthError]);

  // Check authentication on mount via /api/auth/me
  const checkAuth = useCallback(async () => {
    if (!isClient()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrls.auth.me(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(apiUrls.auth.login(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
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

  // Logout - calls server to clear httpOnly cookie
  const logout = useCallback(async () => {
    try {
      await fetch(apiUrls.auth.logout(), {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    if (isClient()) {
      window.location.href = '/';
    }
  }, []);

  // Verify auth on component mount
  useEffect(() => {
    if (isClient()) {
      checkAuth();
    } else {
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
