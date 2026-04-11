import { useState, useEffect, useCallback } from 'react';
import { apiUrls } from '@/config/api';
import { getTokenFromCookie, AuthService } from '@/services/auth';

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

const isClient = () => typeof window !== 'undefined';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch with token in Authorization header + credentials for cookie fallback
  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = getTokenFromCookie();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError('Token expired or invalid');
      throw new Error('Authentication failed');
    }

    return response;
  }, [handleAuthError]);

  // Check authentication on mount
  const checkAuth = useCallback(async () => {
    if (!isClient()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = getTokenFromCookie();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(apiUrls.auth.me(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await AuthService.login(email, password);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

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
