import { apiUrls } from '@/config/api';

interface AuthResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export class AuthService {
  // Login - token is set as httpOnly cookie by the server
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

    return response.json();
  }

  // Register - token is set as httpOnly cookie by the server
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

    return response.json();
  }

  // Logout - clears httpOnly cookie on the server
  static async logout(): Promise<void> {
    try {
      await fetch(apiUrls.auth.logout(), {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}
