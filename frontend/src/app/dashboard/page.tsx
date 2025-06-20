'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import SmartSummaryWidget from '@/components/SmartSummaryWidget'

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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null)
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

useEffect(() => {
  loadUserData()
  loadAllStats()
}, [])

const loadUserData = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      // Redirigir al login si no hay token
      window.location.href = '/login'
      return
    }

    const response = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      setUser(data.data)
    } else {
      // Token inválido, redirigir al login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  } finally {
    setLoading(false)
  }
}

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
    const token = localStorage.getItem('authToken')
    if (!token) return

    const response = await fetch('http://localhost:5000/api/tasks/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
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
    const token = localStorage.getItem('authToken')
    if (!token) return

    const response = await fetch('http://localhost:5000/api/habits/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
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
    const token = localStorage.getItem('authToken')
    if (!token) return

    const response = await fetch('http://localhost:5000/api/transactions/summary', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      setFinanceStats(data.data)
    }
  } catch (error) {
    console.error('Error loading finance stats:', error)
  }
}

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-blue-900/95 backdrop-blur-sm border-b border-blue-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">FocusLife Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">Hola <span className="font-medium text-white">{user?.name || user?.email || 'Usuario'}</span></span>
              <Link href="/" className="text-blue-200 hover:text-white font-medium transition-colors">
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">¿Qué quieres gestionar hoy?</h2>
          <p className="text-blue-100 text-lg">Elige una sección para comenzar</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Tareas */}
          <Link 
            href="/tasks"
            className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 hover:bg-white/15"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Gestión de Tareas
              </h3>
              <p className="text-blue-100 mb-4">
                Organiza y gestiona tus tareas diarias
              </p>
              <div className="mt-4 inline-block bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm">
                Ir a Tareas →
              </div>
            </div>
          </Link>

          {/* Hábitos */}
          <Link 
            href="/habits"
            className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 hover:bg-white/15"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Seguimiento de Hábitos
              </h3>
              <p className="text-blue-100 mb-4">
                Construye y mantén hábitos positivos
              </p>
              <div className="mt-4 inline-block bg-emerald-500/80 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Ir a Hábitos →
              </div>
            </div>
          </Link>

          {/* Finanzas */}
          <Link 
            href="/finances"
            className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 hover:bg-white/15"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Finanzas Personales
              </h3>
              <p className="text-blue-100 mb-4">
                Controla tus ingresos y gastos
              </p>
              <div className="mt-4 inline-block bg-blue-500/80 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Ir a Finanzas →
              </div>
            </div>
          </Link>
        </div>

        {/* Widget de Resumen Inteligente */}
        <div className="mt-16">
          <SmartSummaryWidget loading={statsLoading} />
        </div>
      </div>
    </div>
  )
}