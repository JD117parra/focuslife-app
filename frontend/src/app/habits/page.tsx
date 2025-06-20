'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'


interface Habit {
  id: string
  name: string
  description?: string
  frequency: string
  target: number
  isActive: boolean
}

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  const { success, error, ToastContainer } = useToast()


  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      console.error('No auth token found')
      setHabits([])
      return
    }

    const response = await fetch('http://localhost:5000/api/habits', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setHabits(data.data)
    } else {
      console.error('Error loading habits:', data.message)
    }
  } catch (error) {
    console.error('Error loading habits:', error)
  } finally {
    setLoading(false)
  }
}

  const createHabit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!newHabitName.trim()) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      error('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch('http://localhost:5000/api/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newHabitName }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setHabits([...habits, data.data])
      setNewHabitName('')
      success('¡Hábito creado exitosamente! 🎉')
    } else {
        error('Error: ' + data.message)
    }
  } catch (catchError) {
    error('Error de conexión con el servidor')
  }
}

const handleDeleteClick = (habitId: string) => {
  setHabitToDelete(habitId)
  setShowConfirmModal(true)
}

const confirmDelete = async () => {
  if (!habitToDelete) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      error('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch(`http://localhost:5000/api/habits/${habitToDelete}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      setHabits(habits.filter(h => h.id !== habitToDelete))
      success('¡Hábito eliminado exitosamente! ✅')
    } else {
      const data = await response.json()
      error('Error: ' + data.message)
    }
  } catch (err) {
    error('Error de conexión con el servidor')
  } finally {
    setShowConfirmModal(false)
    setHabitToDelete(null)
  }
}

const cancelDelete = () => {
  setShowConfirmModal(false)
  setHabitToDelete(null)
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <p className="text-gray-600 mt-2">Cargando hábitos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">🎯 Seguimiento de Hábitos</h1>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Today's Date */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8 text-center">
          <h2 className="text-lg font-semibold text-blue-900">
            📅 Hoy: {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-blue-700 text-sm">Marca los hábitos que has completado hoy</p>
        </div>

        {/* Create Habit Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Hábito</h2>
          <form onSubmit={createHabit} className="flex space-x-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del hábito (ej: Ejercicio, Leer, Meditar)..."
              required
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">Crear Hábito</button></form>
        </div>

        {/* Habits List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Mis Hábitos ({habits.length})
            </h2>
          </div>
          
          <div className="p-6">
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌱</div>
                <p className="text-gray-600">No tienes hábitos configurados aún.</p>
                <p className="text-gray-500 text-sm">Crea tu primer hábito usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit: any) => (
                  <div key={habit.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-50 transition-colors" onClick={() => {/* TODO: mark as done today */}}>
                          <span className="text-2xl">✓</span>
                        </button>
                        <div>
                          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                          <p className="text-sm text-gray-600">
                            Frecuencia: {habit.frequency} | Meta: {habit.target} vez(es)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Progress indicator */}
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">Hoy</div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                            0/{habit.target}
                          </div>
                        </div>
                        
                        {/* Streak */}
                        <div className="text-center">
                          <div className="text-sm font-medium text-orange-600">Racha</div>
                          <div className="text-lg font-bold text-orange-600">🔥 7</div>
                        </div>
                        
                        {/* Delete button */}
                        <button 
  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors" 
  onClick={() => handleDeleteClick(habit.id)}
> 
  Eliminar
</button>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progreso semanal</span>
                        <span>5/7 días</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '71%'}}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Eliminar Hábito"
        message="¿Estás seguro de que deseas eliminar este hábito? Se eliminarán también todos sus registros."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toast Container */}
      <ToastContainer />
      {/* 🔼 HASTA AQUÍ 🔼 */}
    </div>
  )
}