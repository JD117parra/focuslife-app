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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Qué quieres gestionar hoy?</h2>
          <p className="text-gray-600">Elige una sección para comenzar</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Tareas */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: '12px',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/tasks'}
            className="text-center border-2 border-transparent hover:border-blue-500"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.2)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)'
            }}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de Tareas
            </h3>
            <p className="text-gray-600">
              Organiza y gestiona tus tareas diarias
            </p>
            <div className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
              Ir a Tareas →
            </div>
          </div>

          {/* Hábitos */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: '12px',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/habits'}
            className="text-center border-2 border-transparent hover:border-green-500"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.2)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)'
            }}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Seguimiento de Hábitos
            </h3>
            <p className="text-gray-600">
              Construye y mantén hábitos positivos
            </p>
            <div className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
              Ir a Hábitos →
            </div>
          </div>

          {/* Finanzas */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: '12px',
              padding: '2rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/finances'}
            className="text-center border-2 border-transparent hover:border-purple-500"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.2)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)'
            }}
          >
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Finanzas Personales
            </h3>
            <p className="text-gray-600">
              Controla tus ingresos y gastos
            </p>
            <div className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
              Ir a Finanzas →
            </div>
          </div>
        </div>

        {/* Widget de Resumen General */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 p-6 rounded-lg mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📊 Resumen General</h2>
              <p className="text-gray-600">Tu productividad de un vistazo</p>
            </div>
            <div className="text-sm text-gray-500">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-blue-900 flex items-center">
                    📋 Tareas
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Pendientes</span>
                    <span className="font-bold text-blue-600 text-lg">
                      {taskStats?.byStatus?.PENDING || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Completadas</span>
                    <span className="font-medium text-green-600">
                      {taskStats?.byStatus?.COMPLETED || 0}
                    </span>
                  </div>
                  
                  {taskStats?.byDate && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Para hoy</span>
                        <span className="font-medium text-blue-500">
                          {taskStats.byDate.today || 0}
                        </span>
                      </div>
                      
                      {taskStats.byDate.overdue > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-700 flex items-center">
                            ⚠️ Vencidas
                          </span>
                          <span className="font-bold text-red-600">
                            {taskStats.byDate.overdue}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Widget de Hábitos */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-green-900 flex items-center">
                    🎯 Hábitos
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total activos</span>
                    <span className="font-bold text-green-600 text-lg">
                      {habitStats?.active || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Completados hoy</span>
                    <span className="font-medium text-green-500">
                      {habitStats?.todayCompleted || 0}
                    </span>
                  </div>
                  
                  {habitStats && habitStats.dailyTarget > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Meta diaria</span>
                      <span className="font-medium text-green-600">
                        {habitStats.todayCompleted}/{habitStats.dailyTarget}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Widget de Finanzas */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-purple-900 flex items-center">
                    💰 Finanzas
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Balance</span>
                    <span className={`font-bold text-lg ${
                      (financeStats?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${(financeStats?.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Ingresos</span>
                    <span className="font-medium text-green-600">
                      +${(financeStats?.totalIncome || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Gastos</span>
                    <span className="font-medium text-red-600">
                      -${(financeStats?.totalExpenses || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Transacciones</span>
                    <span className="font-medium text-purple-600">
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