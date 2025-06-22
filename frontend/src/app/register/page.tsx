'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (email !== confirmEmail) {
      console.error('Los emails no coinciden');
      return;
    }

    if (password !== confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      console.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.register(email, password, name);

      // Guardar token y redireccionar
      AuthService.setToken(response.data.token);

      console.log(
        `¡Registro exitoso! Bienvenido ${response.data.user.name || response.data.user.email}`
      );

      // Redireccionar al dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : 'Registration failed'}`
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
          🎆 Registrarse
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
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
              placeholder="Tu nombre"
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
              Confirmar Email
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              className={`w-full p-3 bg-white/20 backdrop-blur-sm rounded-lg focus:ring-2 text-white placeholder-white/60 ${
                confirmEmail && email !== confirmEmail
                  ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                  : 'border border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
              placeholder="Confirma tu email"
              disabled={loading}
              required
            />
            {confirmEmail && email !== confirmEmail && (
              <p className="text-red-200 text-sm mt-1">
                Los emails no coinciden
              </p>
            )}
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
              placeholder="Mínimo 6 caracteres"
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
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full p-3 bg-white/20 backdrop-blur-sm rounded-lg focus:ring-2 text-white placeholder-white/60 ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                  : 'border border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
              placeholder="Confirma tu contraseña"
              disabled={loading}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-200 text-sm mt-1">
                Las contraseñas no coinciden
              </p>
            )}
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
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-white/90">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-white font-semibold hover:text-white/80"
            >
              Iniciar Sesión
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
