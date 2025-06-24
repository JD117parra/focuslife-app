'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthService } from '@/services/auth';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(loginEmail, loginPassword);
      AuthService.setToken(response.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : 'Login failed'}`
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            🎯 FocusLife
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Tu aplicación todo-en-uno para gestionar hábitos, tareas y finanzas personales
          </p>
        </div>

        {/* Layout principal: Características (izquierda) + Login (derecha) */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Lado izquierdo - Características de la aplicación */}
          <div className="space-y-8">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-shadow-medium">
                ¿Qué puedes hacer con FocusLife?
              </h2>
              <p className="text-white/90 text-lg">
                Descubre todas las herramientas que tenemos para ti
              </p>
            </div>

            <div className="space-y-6">
              <div className="glass-effect border border-white/30 shadow-lg p-6 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  📋 <span className="ml-3">Gestión de Tareas</span>
                </h3>
                <p className="text-white/90">
                  Organiza tu día con listas de tareas inteligentes. Prioriza, programa y nunca olvides una tarea importante.
                </p>
              </div>

              <div className="glass-effect border border-white/30 shadow-lg p-6 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  🎯 <span className="ml-3">Seguimiento de Hábitos</span>
                </h3>
                <p className="text-white/90">
                  Construye hábitos positivos con seguimiento diario. Visualiza tu progreso y mantén la motivación.
                </p>
              </div>

              <div className="glass-effect border border-white/30 shadow-lg p-6 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  💰 <span className="ml-3">Finanzas Personales</span>
                </h3>
                <p className="text-white/90">
                  Controla tus gastos e ingresos con reportes visuales. Toma decisiones financieras inteligentes.
                </p>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario de Login */}
          <div className="order-first lg:order-last">
            <div className="glass-effect shadow-lg p-10 rounded-lg max-w-md mx-auto mt-25">
              <h2 className="text-2xl font-bold text-center text-white mb-6 text-shadow-medium">
                🔐 Iniciar Sesión
              </h2>
              
              {/* Formulario de Login */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 text-shadow-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
                    placeholder="tu@email.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 text-shadow-medium">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
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
                      ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
                      : 'bg-blue-600/60 text-white border border-blue-400/60 hover:bg-blue-700/70 shadow-lg text-shadow-strong'
                  }`}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>

              {/* Enlace de registro */}
              <div className="mt-6 text-center">
                <p className="text-white/90">
                  ¿No tienes cuenta?{' '}
                  <Link
                    href="/register"
                    className="text-white font-semibold hover:text-white/80"
                  >
                    Registrarse
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
