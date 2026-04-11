import { apiUrls } from '@/config/api';

interface AuthResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
}

// Save token as a cookie accessible by Next.js middleware
function setTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
}

// Remove token cookie
function removeTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'token=; path=/; max-age=0; SameSite=Lax; Secure';
}

// Get token from cookie
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? match[1] : null;
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(apiUrls.auth.login(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    setTokenCookie(data.data.token);
    return data;
  }

  static async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    const response = await fetch(apiUrls.auth.register(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    setTokenCookie(data.data.token);
    return data;
  }

  static async logout(): Promise<void> {
    try {
      await fetch(apiUrls.auth.logout(), {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    removeTokenCookie();

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}
