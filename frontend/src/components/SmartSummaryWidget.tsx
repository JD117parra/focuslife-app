'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Target, TrendingUp, Clock, DollarSign, Award, CheckCircle2 } from 'lucide-react'

interface DashboardSummary {
  attention: {
    overdueTasks: {
      count: number
      items: Array<{
        id: string
        title: string
        dueDate: string | null
      }>
    }
    incompleteHabits: {
      count: number
      items: Array<{
        id: string
        name: string
      }>
    }
  }
  finances: {
    monthlyBalance: number
    totalExpenses: number
    totalIncome: number
    todaySpent: number
    todayTransactions: number
    topTodayExpenses: Array<{
      amount: number
      description: string
      category: string
    }>
  }
  achievements: {
    tasksCompletedYesterday: number
    longestHabitStreak: {
      habitName: string
      days: number
    } | null
  }
}

interface SmartSummaryWidgetProps {
  loading?: boolean
}

export default function SmartSummaryWidget({ loading = false }: SmartSummaryWidgetProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('No autorizado')
        return
      }

      const response = await fetch('http://localhost:5000/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.data)
      } else {
        setError('Error al cargar el resumen')
      }
    } catch (error) {
      console.error('Error loading summary:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-6 h-6 bg-white/30 rounded mr-2"></div>
            <div className="h-6 bg-white/30 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            <div className="h-32 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="bg-red-500/20 backdrop-blur-md rounded-xl shadow-lg border border-red-400/30 p-6">
        <div className="text-center text-white">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p className="font-medium mb-2">{error || 'No se pudo cargar el resumen'}</p>
          <button 
            onClick={loadSummary}
            className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const hasOverdueTasks = summary.attention.overdueTasks.count > 0
  const hasIncompleteHabits = summary.attention.incompleteHabits.count > 0
  const hasAchievements = summary.achievements.tasksCompletedYesterday > 0 || summary.achievements.longestHabitStreak
  const allClear = !hasOverdueTasks && !hasIncompleteHabits

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="bg-white/20 p-2 rounded-lg mr-3">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Tu día en resumen</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
        {/* 🔴 Tareas Vencidas - Usando rojo solo para crítico */}
        {hasOverdueTasks && (
          <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-400 rounded-lg p-4 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-red-500/80 p-1.5 rounded-full mr-2">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm">Urgente</h4>
            </div>
            <div className="text-sm text-red-100 rounded p-3 flex-1">
              <span className="font-medium text-white block">
                {summary.attention.overdueTasks.count} tarea{summary.attention.overdueTasks.count !== 1 ? 's' : ''} vencida{summary.attention.overdueTasks.count !== 1 ? 's' : ''}
              </span>
              {summary.attention.overdueTasks.items.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="font-medium">Próxima:</span>
                  <div className="text-red-200 truncate">{summary.attention.overdueTasks.items[0].title}</div>
                  {summary.attention.overdueTasks.count > 1 && (
                    <span className="text-red-300">+{summary.attention.overdueTasks.count - 1} más</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🎯 Hábitos Pendientes - Usando amarillo suave para advertencia */}
        {hasIncompleteHabits && (
          <div className="bg-amber-500/20 backdrop-blur-sm border-l-4 border-amber-400 rounded-lg p-4 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-amber-500/80 p-1.5 rounded-full mr-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm">Hábitos Pendientes</h4>
            </div>
            <div className="text-sm text-amber-100 rounded p-3 flex-1">
              <span className="font-medium text-white block">
                {summary.attention.incompleteHabits.count} hábito{summary.attention.incompleteHabits.count !== 1 ? 's' : ''} por completar
              </span>
              {summary.attention.incompleteHabits.items.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="font-medium">Incluye:</span>
                  <div className="text-amber-200 truncate">{summary.attention.incompleteHabits.items[0].name}</div>
                  {summary.attention.incompleteHabits.count > 1 && (
                    <span className="text-amber-300">+{summary.attention.incompleteHabits.count - 1} más</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💰 Finanzas - Usando púrpura para mejor contraste con el fondo azul */}
        <div className="bg-purple-500/20 backdrop-blur-sm border-l-4 border-purple-400 rounded-lg p-4 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3">
            <div className="bg-purple-500/80 p-1.5 rounded-full mr-2">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-white text-sm">Finanzas</h4>
          </div>
          <div className="text-sm rounded p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-xs">Balance del mes:</span>
              <span className={`font-bold text-xs ${
                summary.finances.monthlyBalance >= 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                ${summary.finances.monthlyBalance >= 0 ? '+' : ''}${Math.abs(summary.finances.monthlyBalance).toLocaleString()}
              </span>
            </div>
            {summary.finances.todaySpent > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-xs">Hoy:</span>
                <span className="font-medium text-xs text-white">
                  ${summary.finances.todaySpent.toLocaleString()}
                </span>
              </div>
            )}
            {summary.finances.topTodayExpenses.length > 0 && (
              <div className="text-xs text-purple-200 border-t border-purple-400/30 pt-2">
                <div className="truncate">
                  <span className="font-medium">Mayor:</span> {summary.finances.topTodayExpenses[0].description}
                </div>
                <div className="text-purple-100">${summary.finances.topTodayExpenses[0].amount.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* 🟢 Logros - Usando verde solo para éxito/completado */}
        {hasAchievements && (
          <div className="bg-emerald-500/20 backdrop-blur-sm border-l-4 border-emerald-400 rounded-lg p-4 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="bg-emerald-500/80 p-1.5 rounded-full mr-2">
                <Award className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-white text-sm">¡Excelente!</h4>
            </div>
            <div className="text-sm text-emerald-100 rounded p-3 flex-1">
              {summary.achievements.tasksCompletedYesterday > 0 && (
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="w-3 h-3 mr-2 text-emerald-300 flex-shrink-0" />
                  <span className="text-xs"><strong className="text-white">{summary.achievements.tasksCompletedYesterday}</strong> tarea{summary.achievements.tasksCompletedYesterday !== 1 ? 's' : ''} ayer</span>
                </div>
              )}
              {summary.achievements.longestHabitStreak && (
                <div className="flex items-center">
                  <span className="text-sm mr-2 flex-shrink-0">🔥</span>
                  <span className="text-xs truncate"><strong className="text-white">{summary.achievements.longestHabitStreak.habitName}</strong>: {summary.achievements.longestHabitStreak.days} día{summary.achievements.longestHabitStreak.days !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✨ Todo al día - Usando azul principal para estado positivo neutro */}
        {allClear && (
          <div className="col-span-full bg-blue-500/20 backdrop-blur-sm border-l-4 border-blue-400 rounded-lg p-6 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-blue-500/80 p-2 rounded-full mr-3">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-white text-lg">¡Todo al día!</h4>
            </div>
            <p className="text-blue-100 text-sm rounded p-3 inline-block">
              No hay tareas vencidas ni hábitos pendientes. ¡Sigue así! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  )
}