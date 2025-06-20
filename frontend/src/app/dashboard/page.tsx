'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface User {
  id: string
  email: string
  name: string | null
}

interface TaskStats {
  total: number
  byStatus: {
    PENDING?: number
    COMPLETED?: number
    IN_PROGRESS?: number
  }
  byDate?: {
    today?: number
    overdue?: number
    noDate?: number
  }
}

interface HabitStats {
  total: number
  active: number
  todayCompleted: number
  dailyTarget: number
  todayProgress: number
}

interface FinanceStats {
  balance: number
  totalIncome: number
  totalExpenses: number
  totalTransactions: number
}

export default function DashboardPage() {
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null)
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const { user, authenticatedFetch, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadAllStats()
    }
  }, [authLoading, isAuthenticated])

const loadAllStats = async () => {
  setStatsLoading(true)
  try {
    // Cargar todas las estadísticas en paralelo
    await Promise.all([
      loadTaskStats(),
      loadHabitStats(), 
      loadFinanceStats()
    ])
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    setStatsLoading(false)
  }
}

const loadTaskStats = async () => {
  try {
    const response = await authenticatedFetch('http://localhost:5000/api/tasks/stats')
    
    if (response.ok) {
      const data = await response.json()
      setTaskStats(data.data)
    }
  } catch (error) {
    console.error('Error loading task stats:', error)
  }
}

const loadHabitStats = async () => {
  try {
    const response = await authenticatedFetch('http://localhost:5000/api/habits/stats')
    
    if (response.ok) {
      const data = await response.json()
      setHabitStats(data.data)
    }
  } catch (error) {
    console.error('Error loading habit stats:', error)
  }
}

const loadFinanceStats = async () => {
  try {
    const response = await authenticatedFetch('http://localhost:5000/api/transactions/summary')
    
    if (response.ok) {
      const data = await response.json()
      setFinanceStats(data.data)
    }
  } catch (error) {
    console.error('Error loading finance stats:', error)
  }
}

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📊</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, el hook ya redirige
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">FocusLife Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">Hola <span className="font-medium text-white">{user?.name || user?.email || 'Usuario'}</span></span>
              <Link href="/" className="text-blue-100 hover:text-white font-medium">
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>¿Qué quieres gestionar hoy?</h2>
          <p className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Elige una sección para comenzar</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Tareas */}
          <div 
            className="bg-white/15 backdrop-blur-md border border-white/30 shadow-lg rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/20"
            onClick={() => window.location.href = '/tasks'}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Gestión de Tareas
            </h3>
            <p className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Organiza y gestiona tus tareas diarias
            </p>
            <div className="mt-4 inline-block bg-blue-600/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-blue-400/40 hover:bg-blue-700/70 transition-all duration-300" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
              Ir a Tareas →
            </div>
          </div>

          {/* Hábitos */}
          <div 
            className="bg-white/15 backdrop-blur-md border border-white/30 shadow-lg rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/20"
            onClick={() => window.location.href = '/habits'}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Seguimiento de Hábitos
            </h3>
            <p className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Construye y mantén hábitos positivos
            </p>
            <div className="mt-4 inline-block bg-green-600/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-green-400/40 hover:bg-green-700/70 transition-all duration-300" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
              Ir a Hábitos →
            </div>
          </div>

          {/* Finanzas */}
          <div 
            className="bg-white/15 backdrop-blur-md border border-white/30 shadow-lg rounded-lg p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/20"
            onClick={() => window.location.href = '/finances'}
          >
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Finanzas Personales
            </h3>
            <p className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Controla tus ingresos y gastos
            </p>
            <div className="mt-4 inline-block bg-purple-600/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-purple-400/40 hover:bg-purple-700/70 transition-all duration-300" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
              Ir a Finanzas →
            </div>
          </div>
        </div>

        {/* Widget de Resumen General */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>📊 Resumen General</h2>
              <p className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Tu productividad de un vistazo</p>
            </div>
            <div className="text-sm text-white/80" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              📅 {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Widget de Tareas */}
              <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-white flex items-center" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                    📋 Tareas
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Pendientes</span>
                    <span className="font-bold text-blue-200 text-lg" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      {taskStats?.byStatus?.PENDING || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Completadas</span>
                    <span className="font-medium text-green-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      {taskStats?.byStatus?.COMPLETED || 0}
                    </span>
                  </div>
                  
                  {taskStats?.byDate && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Para hoy</span>
                        <span className="font-medium text-blue-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                          {taskStats.byDate.today || 0}
                        </span>
                      </div>
                      
                      {taskStats.byDate.overdue > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-200 flex items-center" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                            ⚠️ Vencidas
                          </span>
                          <span className="font-bold text-red-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                            {taskStats.byDate.overdue}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Widget de Hábitos */}
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-white flex items-center" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                    🎯 Hábitos
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Total activos</span>
                    <span className="font-bold text-green-200 text-lg" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      {habitStats?.active || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Completados hoy</span>
                    <span className="font-medium text-green-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      {habitStats?.todayCompleted || 0}
                    </span>
                  </div>
                  
                  {habitStats && habitStats.dailyTarget > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Meta diaria</span>
                      <span className="font-medium text-green-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                        {habitStats.todayCompleted}/{habitStats.dailyTarget}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Widget de Finanzas */}
              <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-white flex items-center" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                    💰 Finanzas
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Balance</span>
                    <span className={`font-bold text-lg ${
                      (financeStats?.balance || 0) >= 0 ? 'text-green-200' : 'text-red-200'
                    }`} style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      ${(financeStats?.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Ingresos</span>
                    <span className="font-medium text-green-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      +${(financeStats?.totalIncome || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Gastos</span>
                    <span className="font-medium text-red-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                      -${(financeStats?.totalExpenses || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Transacciones</span>
                    <span className="font-medium text-purple-200" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
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
  )
}