'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useEditModal } from '@/hooks/useEditModal'

interface Habit {
  id: string
  name: string
  description?: string
  frequency: string
  target: number
  isActive: boolean
}

interface HabitEntry {
  id: string
  habitId: string
  date: string
  count: number
  notes?: string
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [loading, setLoading] = useState(true)
  const { authenticatedFetch, isAuthenticated, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const editModal = useEditModal()

  // Función para obtener el icono de un hábito basado en su nombre
  const getHabitIcon = (habitName: string) => {
    const name = habitName.toLowerCase()
    
    // Iconos predefinidos
    if (name.includes('ejercicio') || name.includes('ejercitar') || name.includes('gym') || name.includes('deporte')) return '🏃‍♂️'
    if (name.includes('leer') || name.includes('lectura') || name.includes('libro')) return '📚'
    if (name.includes('meditar') || name.includes('meditación') || name.includes('mindfulness')) return '🧘‍♀️'
    if (name.includes('agua') || name.includes('beber') || name.includes('hidrat')) return '💧'
    if (name.includes('levantarse') || name.includes('despertar') || name.includes('temprano') || name.includes('madruga')) return '🌅'
    if (name.includes('estudiar') || name.includes('aprender') || name.includes('curso') || name.includes('estudio')) return '📝'
    if (name.includes('gratitud') || name.includes('agradecer') || name.includes('agradecido')) return '🙏'
    
    // Nuevos hábitos
    if (name.includes('diario') || name.includes('escribir') || name.includes('journal')) return '📔'
    if (name.includes('aire libre') || name.includes('exterior') || name.includes('naturaleza') || name.includes('outdoor')) return '🌿'
    if (name.includes('desconexión') || name.includes('digital') || name.includes('pantalla') || name.includes('teléfono') || name.includes('movil')) return '📵'
    if (name.includes('organizar') || name.includes('ordenar') || name.includes('limpiar') || name.includes('limpieza')) return '🧹'
    if (name.includes('creativo') || name.includes('creatividad') || name.includes('crear') || name.includes('arte') || name.includes('dibujar')) return '🎨'
    
    // Iconos adicionales para otros hábitos comunes
    if (name.includes('cocinar') || name.includes('cocina')) return '👨‍🍳'
    if (name.includes('trabajo') || name.includes('productiv') || name.includes('enfocar')) return '💼'
    if (name.includes('dinero') || name.includes('ahorro') || name.includes('finanzas')) return '💰'
    if (name.includes('social') || name.includes('amigos') || name.includes('socializar')) return '👥'
    if (name.includes('jardín') || name.includes('plantas') || name.includes('jardinería')) return '🌱'
    if (name.includes('mascota') || name.includes('perro') || name.includes('gato')) return '🐕'
    if (name.includes('vitamina') || name.includes('medicament') || name.includes('supplement')) return '💊'
    if (name.includes('yoga') || name.includes('estir') || name.includes('flexibilidad')) return '🧘‍♀️'
    if (name.includes('caminar') || name.includes('paso') || name.includes('andar')) return '🚶‍♂️'
    if (name.includes('dormir') || name.includes('sueño') || name.includes('descansar')) return '😴'
    if (name.includes('comer') || name.includes('saludable') || name.includes('dieta') || name.includes('vegetal') || name.includes('fruta')) return '🥗'
    if (name.includes('familia') || name.includes('llamar') || name.includes('contactar')) return '📞'
    if (name.includes('instrumento') || name.includes('música') || name.includes('tocar') || name.includes('piano') || name.includes('guitarra')) return '🎸'
    
    // Icono por defecto para hábitos personalizados
    return '⭐'
  }
  const predefinedHabits = [
    { name: 'Hacer ejercicio', icon: '🏃‍♂️', description: '30 minutos de actividad física' },
    { name: 'Leer', icon: '📚', description: 'Leer al menos 20 minutos' },
    { name: 'Meditar', icon: '🧘‍♀️', description: 'Meditación o mindfulness' },
    { name: 'Beber agua', icon: '💧', description: 'Tomar 8 vasos de agua al día' },
    { name: 'Levantarse temprano', icon: '🌅', description: 'Despertar antes de las 7 AM' },
    { name: 'Estudiar', icon: '📝', description: 'Dedicar tiempo al aprendizaje' },
    { name: 'Gratitud', icon: '🙏', description: 'Escribir 3 cosas por las que estás agradecido' },
    { name: 'Diario personal', icon: '📔', description: 'Escribir en tu diario personal' },
    { name: 'Tiempo al aire libre', icon: '🌿', description: 'Salir y respirar aire fresco' },
    { name: 'Desconexión digital', icon: '📵', description: 'Tiempo sin pantallas o dispositivos' },
    { name: 'Organizar espacio', icon: '🧹', description: 'Mantener el entorno ordenado' },
    { name: 'Tiempo creativo', icon: '🎨', description: 'Cualquier actividad creativa' }
  ]

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadHabits()
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  // Cargar entradas cuando los hábitos cambian
  useEffect(() => {
    if (habits.length > 0) {
      loadHabitEntries()
    }
  }, [habits])

  const loadHabits = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:5000/api/habits')
      const data = await response.json()
      
      if (response.ok) {
        setHabits(data.data)
      } else {
        toast.error('Error cargando hábitos: ' + data.message)
      }
    } catch (error) {
      console.error('Error loading habits:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const loadHabitEntries = async () => {
    try {
      // Cargar entradas de los últimos 30 días para calcular estadísticas
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const allEntries: HabitEntry[] = []
      
      // Cargar entradas para cada hábito
      for (const habit of habits) {
        try {
          const response = await authenticatedFetch(
            `http://localhost:5000/api/habits/${habit.id}/entries?startDate=${startDate}&endDate=${endDate}`
          )
          
          if (response.ok) {
            const data = await response.json()
            // Agregar las entradas de este hábito al array total
            if (data.data && Array.isArray(data.data)) {
              const habitEntries = data.data.map((entry: any) => ({
                id: entry.id,
                habitId: habit.id,
                date: entry.date.split('T')[0], // Asegurar formato YYYY-MM-DD
                count: entry.count,
                notes: entry.notes
              }))
              allEntries.push(...habitEntries)
            }
          }
        } catch (error) {
          console.error(`Error loading entries for habit ${habit.id}:`, error)
        }
      }
      
      setHabitEntries(allEntries)
      console.log('Loaded habit entries:', allEntries)
    } catch (error) {
      console.error('Error loading habit entries:', error)
    }
  }

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newHabitName.trim()) return

    try {
      const response = await authenticatedFetch('http://localhost:5000/api/habits', {
        method: 'POST',
        body: JSON.stringify({ name: newHabitName }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setHabits([...habits, data.data])
        setNewHabitName('')
        toast.success('¡Hábito creado exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const addPredefinedHabit = async (habitName: string) => {
    // Verificar si el hábito ya existe
    const habitExists = habits.some(habit => habit.name.toLowerCase() === habitName.toLowerCase())
    if (habitExists) {
      toast.warning('¡Este hábito ya existe en tu lista!')
      return
    }

    try {
      const response = await authenticatedFetch('http://localhost:5000/api/habits', {
        method: 'POST',
        body: JSON.stringify({ name: habitName }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setHabits([...habits, data.data])
        await loadHabitEntries() // Recargar entradas
        toast.success(`¡"${habitName}" agregado a tus hábitos!`)
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const deleteHabit = async (habitId: string, habitName: string) => {
    const confirmed = await confirm.confirmDelete(habitName)
    if (!confirmed) {
      return
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/habits/${habitId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setHabits(habits.filter(h => h.id !== habitId))
        toast.delete('¡Hábito eliminado exitosamente!')
      } else {
        const data = await response.json()
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const editHabit = async (habitId: string, currentName: string) => {
    const newName = await editModal.editHabit(currentName)
    if (!newName) {
      return // Usuario canceló
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/habits/${habitId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setHabits(habits.map((habit: Habit) => 
          habit.id === habitId 
            ? { ...habit, name: newName }
            : habit
        ))
        toast.success('¡Hábito editado exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const toggleHabitComplete = async (habitId: string, target: number) => {
    const today = new Date().toISOString().split('T')[0]
    const { completed } = getTodayProgress(habitId, target)
    const isCurrentlyCompleted = completed >= target
    
    if (isCurrentlyCompleted) {
      // Desmarcar - eliminar la entrada más reciente del día
      await unmarkHabitComplete(habitId, today)
    } else {
      // Marcar - agregar nueva entrada
      await markHabitComplete(habitId, target, today)
    }
  }

  const markHabitComplete = async (habitId: string, target: number, today: string) => {
    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/habits/${habitId}/entries`, {
        method: 'POST',
        body: JSON.stringify({ 
          date: today,
          count: 1 
        }),
      })
      
      const data = await response.json()
      
      // DEBUG: Verificar qué devuelve el backend
      console.log('Backend response for new entry:', data)
      
      if (response.ok) {
        // Verificar que tenemos un ID válido del backend
        if (!data.data?.id) {
          console.error('Backend did not return a valid ID:', data)
          toast.error('Error: El servidor no devolvió un ID válido')
          return
        }
        
        // Agregar la nueva entrada al estado local con el ID real del backend
        const newEntry: HabitEntry = {
          id: data.data.id, // Usar SOLO el ID del backend
          habitId,
          date: today,
          count: 1
        }
        const updatedEntries = [...habitEntries, newEntry]
        setHabitEntries(updatedEntries)
        
        // Calcular el progreso con la nueva entrada
        const todayEntries = updatedEntries.filter(entry => 
          entry.habitId === habitId && entry.date === today
        )
        const newCompleted = todayEntries.reduce((sum, entry) => sum + entry.count, 0)
        
        if (newCompleted >= target) {
          toast.success('¡Meta del día completada! 🎉')
        } else {
          toast.success(`Progreso: ${newCompleted}/${target} ¡Sigue así!`)
        }
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error marking habit complete:', error)
      toast.error('Error de conexión con el servidor')
    }
  }

  const unmarkHabitComplete = async (habitId: string, today: string) => {
    try {
      // Encontrar la entrada más reciente del día para este hábito
      const todayEntries = habitEntries.filter(entry => 
        entry.habitId === habitId && entry.date === today
      )
      
      console.log('Today entries found:', todayEntries) // DEBUG
      
      if (todayEntries.length === 0) {
        toast.warning('No hay entradas que desmarcar')
        return
      }
      
      // Tomar la entrada más reciente
      const entryToDelete = todayEntries[todayEntries.length - 1]
      console.log('Trying to delete entry:', entryToDelete) // DEBUG
      
      // Llamar al endpoint para eliminar la entrada
      const response = await authenticatedFetch(`http://localhost:5000/api/habits/entries/${entryToDelete.id}`, {
        method: 'DELETE',
      })
      
      console.log('Delete response status:', response.status) // DEBUG
      
      if (response.ok) {
        // Actualizar el estado local eliminando la entrada
        const updatedEntries = habitEntries.filter(entry => entry.id !== entryToDelete.id)
        setHabitEntries(updatedEntries)
        
        // Calcular el nuevo progreso
        const remainingTodayEntries = updatedEntries.filter(entry => 
          entry.habitId === habitId && entry.date === today
        )
        const newCompleted = remainingTodayEntries.reduce((sum, entry) => sum + entry.count, 0)
        
        if (newCompleted === 0) {
          toast.success('Hábito desmarcado')
        } else {
          // Obtener el target del hábito
          const habit = habits.find(h => h.id === habitId)
          const target = habit?.target || 1
          toast.success(`Desmarcado. Progreso actual: ${newCompleted}/${target}`)
        }
      } else {
        const data = await response.json()
        console.error('Delete failed with response:', data) // DEBUG
        toast.error('Error: ' + data.message)
      }
      
    } catch (error) {
      console.error('Error unmarking habit:', error)
      toast.error('Error de conexión con el servidor')
    }
  }

  // Funciones para calcular estadísticas
  const getTodayProgress = (habitId: string, target: number) => {
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = habitEntries.filter(entry => 
      entry.habitId === habitId && entry.date === today
    )
    const todayCount = todayEntries.reduce((sum, entry) => sum + entry.count, 0)
    return { completed: todayCount, target }
  }

  const getStreak = (habitId: string) => {
    // Calcular días consecutivos desde hoy hacia atrás
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasEntry = habitEntries.some(entry => 
        entry.habitId === habitId && entry.date === dateStr && entry.count > 0
      )
      
      if (hasEntry) {
        streak++
      } else if (i > 0) { // No romper la racha el primer día (hoy) si no se ha completado
        break
      }
    }
    
    return streak
  }

  const getWeeklyProgress = (habitId: string) => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Domingo de esta semana
    
    let completedDays = 0
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart)
      checkDate.setDate(weekStart.getDate() + i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasEntry = habitEntries.some(entry => 
        entry.habitId === habitId && entry.date === dateStr && entry.count > 0
      )
      
      if (hasEntry) {
        completedDays++
      }
    }
    
    return { completed: completedDays, total: 7, percentage: Math.round((completedDays / 7) * 100) }
  }

  const isCompletedToday = (habitId: string, target: number) => {
    const { completed } = getTodayProgress(habitId, target)
    return completed >= target
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <p className="text-white mt-2">Cargando hábitos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-100 hover:text-white">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">🎯 Seguimiento de Hábitos</h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Today's Date */}
        <div className="bg-blue-50/80 backdrop-blur-sm shadow-xl ring-1 ring-blue-100/20 p-4 rounded-lg mb-8 text-center border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900">
            📅 Hoy: {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-blue-700 text-sm">Haz click en el botón ➕ para marcar como completado, o en el ✓ para desmarcar</p>
        </div>

        {/* Predefined Habits Section */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🌟 Hábitos Populares</h2>
          <p className="text-gray-600 text-sm mb-6">Elige de nuestra selección de hábitos más comunes para empezar rápidamente</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {predefinedHabits.map((habit, index) => {
              const isAdded = habits.some(h => h.name.toLowerCase() === habit.name.toLowerCase())
              
              return (
                <div 
                  key={index} 
                  onClick={() => !isAdded && addPredefinedHabit(habit.name)}
                  className={`border rounded-lg p-3 transition-all ${
                    isAdded 
                      ? 'border-green-200 bg-green-50 cursor-not-allowed' 
                      : 'border-gray-200 bg-white hover:shadow-md hover:border-green-300 cursor-pointer'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{habit.icon}</div>
                    <h3 className={`font-medium mb-1 text-sm ${
                      isAdded ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {habit.name}
                    </h3>
                    {isAdded && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Agregado
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Create Custom Habit Form */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✏️ Crear Hábito Personalizado</h2>
          <form onSubmit={createHabit} className="flex space-x-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="¿No encuentras tu hábito arriba? Escríbelo aquí..."
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Crear Hábito
            </button>
          </form>
        </div>

        {/* Habits List */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 rounded-lg">
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
                {habits.map((habit: any) => {
                  const todayProgress = getTodayProgress(habit.id, habit.target)
                  const streak = getStreak(habit.id)
                  const weeklyProgress = getWeeklyProgress(habit.id)
                  const isCompleted = isCompletedToday(habit.id, habit.target)
                  
                  return (
                    <div key={habit.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button 
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                              isCompleted 
                                ? 'border-green-500 bg-green-500 text-white hover:bg-green-600' 
                                : 'border-green-500 hover:bg-green-50 text-green-500'
                            }`}
                            onClick={() => toggleHabitComplete(habit.id, habit.target)}
                            title={isCompleted ? 'Click para desmarcar' : 'Click para marcar como completado'}
                          >
                            <span className="text-2xl">{isCompleted ? '✓' : '+'}</span>
                          </button>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getHabitIcon(habit.name)}</span>
                              <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              Frecuencia: {habit.frequency} | Meta: {habit.target} vez(es)
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Progress indicator */}
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600">Hoy</div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                              isCompleted 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {todayProgress.completed}/{todayProgress.target}
                            </div>
                            {isCompleted && (
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                ¡Completado!
                              </div>
                            )}
                          </div>
                          
                          {/* Streak */}
                          <div className="text-center">
                            <div className="text-sm font-medium text-orange-600">Racha</div>
                            <div className="text-lg font-bold text-orange-600">
                              {streak > 0 ? `🔥 ${streak}` : '–'}
                            </div>
                          </div>
                          
                          {/* Edit and Delete buttons */}
                          <button 
                            className="text-blue-600 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-blue-600 hover:shadow-md transform hover:scale-105"
                            onClick={() => editHabit(habit.id, habit.name)}
                            title="Editar hábito"
                          >
                            Editar
                          </button>
                          <button 
                            className="text-red-600 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-red-600 hover:shadow-md transform hover:scale-105" 
                            onClick={() => deleteHabit(habit.id, habit.name)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progreso semanal</span>
                          <span>{weeklyProgress.completed}/{weeklyProgress.total} días</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${weeklyProgress.percentage}%`}}></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <toast.ToastContainer />
      
      {/* Confirm Modal */}
      <confirm.ConfirmModal />
      
      {/* Edit Modal */}
      <editModal.EditModal />
    </div>
  )
}