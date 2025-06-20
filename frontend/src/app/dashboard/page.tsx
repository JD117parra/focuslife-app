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
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Qué quieres gestionar hoy?</h2>
          <p className="text-gray-600 text-lg">Elige una sección para comenzar</p>
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

        {/* Quick Stats (opcional - solo números) */}
        <div className="mt-16 text-center">
  <h3 className="text-lg font-semibold text-gray-700 mb-6">Resumen rápido</h3>
  <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
    {/* Tareas */}
    <div style={{
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      borderRadius: '12px',
      padding: '1rem'
    }}>
      <div className="text-2xl font-bold text-blue-600">
        {statsLoading ? '...' : (taskStats?.byStatus?.PENDING || 0)}
      </div>
      <div className="text-sm text-gray-600">Tareas pendientes</div>
    </div>
    
    {/* Hábitos */}
    <div style={{
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      borderRadius: '12px',
      padding: '1rem'
    }}>
      <div className="text-2xl font-bold text-green-600">
        {statsLoading ? '...' : `${habitStats?.todayCompleted || 0}/${habitStats?.active || 0}`}
      </div>
      <div className="text-sm text-gray-600">Hábitos hoy</div>
    </div>
    
    {/* Finanzas */}
    <div style={{
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      borderRadius: '12px',
      padding: '1rem'
    }}>
      <div className={`text-2xl font-bold ${
        (financeStats?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {statsLoading ? '...' : `${Math.abs(financeStats?.balance || 0).toLocaleString()}`}
      </div>
      <div className="text-sm text-gray-600">Balance mensual</div>
    </div>
  </div>
    </div>
      </div>
    </div>
  )
}