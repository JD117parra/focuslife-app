import { apiUrls } from '@/config/api'

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

export class AuthService {
  // Guardar token en localStorage
  static setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Obtener token de localStorage
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Eliminar token
  static removeToken(): void {
    localStorage.removeItem('authToken');
  }

  // Login
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(apiUrls.auth.login(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  // Register
  static async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await fetch(apiUrls.auth.register(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  // Verificar si está logueado
  static isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Logout
  static logout(): void {
    this.removeToken();
    window.location.href = '/';
  }
}