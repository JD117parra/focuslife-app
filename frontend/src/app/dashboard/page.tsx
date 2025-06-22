'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiUrls } from '@/config/api';

interface TaskStats {
  total: number;
  byStatus: {
    PENDING?: number;
    COMPLETED?: number;
    IN_PROGRESS?: number;
  };
  byDate?: {
    today?: number;
    overdue?: number;
    noDate?: number;
  };
}

interface HabitStats {
  total: number;
  active: number;
  todayCompleted: number;
  dailyTarget: number;
  todayProgress: number;
}

interface FinanceStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransactions: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const {
    user,
    authenticatedFetch,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const loadTaskStats = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.stats());

      if (response.ok) {
        const data = await response.json();
        setTaskStats(data.data);
      }
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  }, []);

  const loadHabitStats = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.stats());

      if (response.ok) {
        const data = await response.json();
        setHabitStats(data.data);
      }
    } catch (error) {
      console.error('Error loading habit stats:', error);
    }
  }, []);

  const loadFinanceStats = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.transactions.summary());

      if (response.ok) {
        const data = await response.json();
        setFinanceStats(data.data);
      }
    } catch (error) {
      console.error('Error loading finance stats:', error);
    }
  }, []);

  const loadAllStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Cargar todas las estadísticas en paralelo
      await Promise.all([
        loadTaskStats(),
        loadHabitStats(),
        loadFinanceStats(),
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [loadTaskStats, loadHabitStats, loadFinanceStats]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadAllStats();
    }
  }, [authLoading, isAuthenticated, loadAllStats]);

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-optimized flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📊</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, el hook ya redirige
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-optimized">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              FocusLife Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">
                Hola{' '}
                <span className="font-medium text-white">
                  {user?.name || user?.email || 'Usuario'}
                </span>
              </span>
              <Link
                href="/"
                className="text-blue-100 hover:text-white font-medium"
              >
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-shadow-medium">
            ¿Qué quieres gestionar hoy?
          </h2>
          <p className="text-white/90 text-shadow-light">
            Elige una sección para comenzar
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Tareas */}
          <div
            className="glass-effect glass-effect-hover shadow-lg p-8 text-center cursor-pointer"
            onClick={() => router.push('/tasks')}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2 text-shadow-medium">
              Gestión de Tareas
            </h3>
            <p className="text-white/90 text-shadow-light">
              Organiza y gestiona tus tareas diarias
            </p>
            <div className="mt-4 inline-block bg-blue-600/60 text-white px-4 py-2 rounded-lg font-medium border border-blue-400/40 hover:bg-blue-700/70 transition-colors duration-200 text-shadow-strong">
              Ir a Tareas →
            </div>
          </div>

          {/* Hábitos */}
          <div
            className="glass-effect glass-effect-hover shadow-lg p-8 text-center cursor-pointer"
            onClick={() => router.push('/habits')}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2 text-shadow-medium">
              Seguimiento de Hábitos
            </h3>
            <p className="text-white/90 text-shadow-light">
              Construye y mantén hábitos positivos
            </p>
            <div className="mt-4 inline-block bg-green-600/60 text-white px-4 py-2 rounded-lg font-medium border border-green-400/40 hover:bg-green-700/70 transition-colors duration-200 text-shadow-strong">
              Ir a Hábitos →
            </div>
          </div>

          {/* Finanzas */}
          <div
            className="glass-effect glass-effect-hover shadow-lg p-8 text-center cursor-pointer"
            onClick={() => router.push('/finances')}
          >
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2 text-shadow-medium">
              Finanzas Personales
            </h3>
            <p className="text-white/90 text-shadow-light">
              Controla tus ingresos y gastos
            </p>
            <div className="mt-4 inline-block bg-purple-600/60 text-white px-4 py-2 rounded-lg font-medium border border-purple-400/40 hover:bg-purple-700/70 transition-colors duration-200 text-shadow-strong">
              Ir a Finanzas →
            </div>
          </div>
        </div>

        {/* Widget de Resumen General */}
        <div className="glass-effect shadow-lg p-6 mt-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white text-shadow-medium">
                📊 Resumen General
              </h2>
              <p className="text-white/90 text-shadow-light">
                Tu productividad de un vistazo
              </p>
            </div>
            <div className="text-sm text-white/80 text-shadow-light">
              📅{' '}
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Widget de Tareas */}
              <div className="bg-blue-500/40 backdrop-blur-md shadow-lg border-2 border-blue-300/70 rounded-lg widget-stat">
                <div className="mb-3">
                  <h3 className="font-semibold text-blue-50 flex items-center text-shadow-strong">
                    📋 Tareas
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-50 text-shadow-light">
                      Pendientes
                    </span>
                    <span className="font-bold text-white text-lg text-shadow-strong">
                      {taskStats?.byStatus?.PENDING || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-50 text-shadow-light">
                      Completadas
                    </span>
                    <span className="font-medium text-white text-shadow-strong">
                      {taskStats?.byStatus?.COMPLETED || 0}
                    </span>
                  </div>

                  {taskStats?.byDate && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-50 text-shadow-light">
                          Para hoy
                        </span>
                        <span className="font-medium text-white text-shadow-strong">
                          {taskStats.byDate.today || 0}
                        </span>
                      </div>

                      {taskStats.byDate.overdue > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-200 flex items-center text-shadow-light">
                            ⚠️ Vencidas
                          </span>
                          <span className="font-bold text-red-200 text-shadow-strong">
                            {taskStats.byDate.overdue}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Widget de Hábitos */}
              <div className="bg-green-500/40 backdrop-blur-md shadow-lg border-2 border-green-400/60 rounded-lg widget-stat">
                <div className="mb-3">
                  <h3 className="font-semibold text-green-50 flex items-center text-shadow-strong">
                    🎯 Hábitos
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-50 text-shadow-light">
                      Total activos
                    </span>
                    <span className="font-bold text-white text-lg text-shadow-strong">
                      {habitStats?.active || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-50 text-shadow-light">
                      Completados hoy
                    </span>
                    <span className="font-medium text-white text-shadow-strong">
                      {habitStats?.todayCompleted || 0}
                    </span>
                  </div>

                  {habitStats && habitStats.dailyTarget > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-50 text-shadow-light">
                        Meta diaria
                      </span>
                      <span className="font-medium text-white text-shadow-strong">
                        {habitStats.todayCompleted}/{habitStats.dailyTarget}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Widget de Finanzas */}
              <div className="bg-purple-500/40 backdrop-blur-md shadow-lg border-2 border-purple-400/60 rounded-lg widget-stat">
                <div className="mb-3">
                  <h3 className="font-semibold text-white flex items-center text-shadow-strong">
                    💰 Finanzas
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Balance
                    </span>
                    <span
                      className={`font-bold text-lg text-shadow-strong ${
                        (financeStats?.balance || 0) >= 0
                          ? 'text-green-200'
                          : 'text-red-200'
                      }`}
                    >
                      ${(financeStats?.balance || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Ingresos
                    </span>
                    <span className="font-medium text-green-200 text-shadow-strong">
                      +${(financeStats?.totalIncome || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Gastos
                    </span>
                    <span className="font-medium text-red-200 text-shadow-strong">
                      -${(financeStats?.totalExpenses || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Transacciones
                    </span>
                    <span className="font-medium text-purple-200 text-shadow-strong">
                      {financeStats?.totalTransactions || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
