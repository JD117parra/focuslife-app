import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            🎯 FocusLife
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tu aplicación todo-en-uno para gestionar hábitos, tareas y finanzas
            personales
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/login"
              className="inline-block bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
            >
              🔐 Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="inline-block bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
              🎆 Registrarse
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 md:mt-20">
          <div className="backdrop-blur-md bg-white/15 border border-white/30 shadow-lg p-6 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              📋 Gestión de Tareas
            </h3>
            <p className="text-white/90">
              Organiza tu día con listas de tareas inteligentes.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/15 border border-white/30 shadow-lg p-6 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              🎯 Seguimiento de Hábitos
            </h3>
            <p className="text-white/90">
              Construye hábitos positivos con seguimiento diario.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/15 border border-white/30 shadow-lg p-6 rounded-lg hover:scale-105 hover:bg-white/20 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-3">
              💰 Finanzas Personales
            </h3>
            <p className="text-white/90">
              Controla tus gastos e ingresos con reportes visuales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
