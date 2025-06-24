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

// Función auxiliar para verificar si estamos en el cliente
const isClient = () => typeof window !== 'undefined';

export class AuthService {
  // Guardar token en localStorage (solo en el cliente)
  static setToken(token: string): void {
    if (!isClient()) return;
    localStorage.setItem('authToken', token);
  }

  // Obtener token de localStorage (solo en el cliente)
  static getToken(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem('authToken');
  }

  // Eliminar token (solo en el cliente)
  static removeToken(): void {
    if (!isClient()) return;
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
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  // Verificar si está logueado (solo en el cliente)
  static isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Logout (solo en el cliente)
  static logout(): void {
    this.removeToken();
    if (isClient()) {
      window.location.href = '/';
    }
  }
}
