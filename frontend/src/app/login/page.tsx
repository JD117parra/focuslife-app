'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(email, password);

      // Guardar token y datos del usuario
      AuthService.setToken(response.data.token);

      // Redireccionar al dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      // TODO: Usar sistema de toast en lugar de console.error
      console.error(
        `Error: ${error instanceof Error ? error.message : 'Login failed'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center px-4 py-8">
      <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-8 rounded-lg w-full max-w-md">
        <h1
          className="text-2xl font-bold text-center text-white mb-6"
          style={{
            textShadow:
              '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          🔐 Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-white/90"
              style={{
                textShadow:
                  '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
              placeholder="tu@email.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-white/90"
              style={{
                textShadow:
                  '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
              loading
                ? 'bg-white/10 text-white/50 cursor-not-allowed backdrop-blur-sm border border-white/20'
                : 'bg-blue-600/60 backdrop-blur-md text-white border border-blue-400/60 hover:bg-blue-700/70 shadow-lg'
            }`}
            style={{
              textShadow: loading
                ? 'none'
                : '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-white/90">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-white font-semibold hover:text-white/80"
            >
              Registrarse
            </Link>
          </p>
          <Link href="/" className="text-white/80 hover:text-white block">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
