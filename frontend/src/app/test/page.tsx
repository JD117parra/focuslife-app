export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ✅ ¡Página de prueba funcionando!
        </h1>
        <p className="text-white text-lg mb-6">
          El problema del viewport ha sido resuelto.
        </p>
        <div className="space-y-2">
          <a href="/" className="block text-blue-200 hover:text-white">
            → Ir a página principal
          </a>
          <a href="/login" className="block text-blue-200 hover:text-white">
            → Ir a login
          </a>
          <a href="/dashboard" className="block text-blue-200 hover:text-white">
            → Ir a dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
