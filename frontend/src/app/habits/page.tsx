'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useEditModal } from '@/hooks/useEditModal'
import { apiUrls } from '@/config/api'

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
    { name: 'Tiempo creativo', icon: '🎨', description: 'Cualquier actividad creativa' },
    // Segunda fila de hábitos
    { name: 'Caminar diario', icon: '🚶‍♂️', description: 'Caminar al menos 30 minutos' },
    { name: 'Comer saludable', icon: '🥗', description: 'Incluir frutas y verduras en comidas' },
    { name: 'Dormir temprano', icon: '😴', description: 'Acostarse antes de las 10 PM' },
    { name: 'Hacer la cama', icon: '🛏️', description: 'Ordenar la cama al levantarse' },
    { name: 'Tomar vitaminas', icon: '💊', description: 'Suplementos diarios' },
    { name: 'Llamar a familia', icon: '📞', description: 'Contactar con seres queridos' },
    { name: 'Escuchar música', icon: '🎵', description: 'Disfrutar de música favorita' },
    { name: 'Cocinar en casa', icon: '👨‍🍳', description: 'Preparar comidas caseras' },
    { name: 'Practicar idioma', icon: '🌍', description: 'Estudiar un nuevo idioma' },
    { name: 'Hacer yoga', icon: '🧘‍♀️', description: 'Práctica de yoga o estiramientos' },
    { name: 'Ahorrar dinero', icon: '💰', description: 'Guardar dinero cada día' },
    { name: 'Sonreír más', icon: '😊', description: 'Mantener actitud positiva' }
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
      const response = await authenticatedFetch(apiUrls.habits.list())
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
            `${apiUrls.habits.entries(habit.id)}?startDate=${startDate}&endDate=${endDate}`
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
    } catch (error) {
      console.error('Error loading habit entries:', error)
    }
  }

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newHabitName.trim()) return

    try {
      const response = await authenticatedFetch(apiUrls.habits.create(), {
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
      const response = await authenticatedFetch(apiUrls.habits.create(), {
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
      const response = await authenticatedFetch(apiUrls.habits.delete(habitId), {
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
      const response = await authenticatedFetch(apiUrls.habits.update(habitId), {
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
      const response = await authenticatedFetch(apiUrls.habits.entries(habitId), {
        method: 'POST',
        body: JSON.stringify({ 
          date: today,
          count: 1 
        }),
      })
      
      const data = await response.json()
      
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
      
      if (todayEntries.length === 0) {
        toast.warning('No hay entradas que desmarcar')
        return
      }
      
      // Tomar la entrada más reciente
      const entryToDelete = todayEntries[todayEntries.length - 1]
      
      // Llamar al endpoint para eliminar la entrada
      const response = await authenticatedFetch(apiUrls.habits.deleteEntry(entryToDelete.id), {
        method: 'DELETE',
      })
      
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
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 p-4 rounded-lg mb-8 text-center">
          <h2 className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
            📅 Hoy: {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>

        {/* Predefined Habits Section */}
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>🌟 Hábitos Populares</h2>
          <p className="text-white text-base font-medium mb-6" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Elige de nuestra selección de hábitos más comunes para empezar rápidamente</p>
          
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
            {predefinedHabits.map((habit, index) => {
              const isAdded = habits.some(h => h.name.toLowerCase() === habit.name.toLowerCase())
              
              return (
                <div 
                  key={index} 
                  onClick={() => !isAdded && addPredefinedHabit(habit.name)}
                  className={`px-0 py-1.5 rounded border transition-all duration-150 cursor-pointer ${
                    isAdded 
                      ? 'bg-white/30 border-white/60 shadow-md cursor-not-allowed' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                  }`}
                  style={{
                    backgroundColor: isAdded ? '#10b98140' : undefined,
                    borderColor: isAdded ? '#10b98180' : undefined
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm mb-0.5">{habit.icon}</div>
                    <div className={`text-xs font-bold leading-tight ${
                      isAdded ? 'text-white' : 'text-white/90'
                    }`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                      {habit.name}
                    </div>
                    {isAdded && (
                      <div className="text-xs text-green-200 font-bold mt-0.5" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
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
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Crear Hábito Personalizado</h2>
          <form onSubmit={createHabit} className="flex space-x-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="flex-1 p-3 bg-white/30 backdrop-blur-md border border-white/50 rounded-lg focus:ring-2 focus:ring-white/60 focus:border-white/60 text-white placeholder-white/80 font-medium text-base"
              placeholder="¿No encuentras tu hábito arriba? Escríbelo aquí..."
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              required
            />
            <button
              type="submit"
              className="bg-green-600/70 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold border border-green-400/70 hover:bg-green-700/80 transition-all duration-150 shadow-lg text-base"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              Crear Hábito
            </button>
          </form>
        </div>

        {/* Habits List */}
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg">
          <div className="p-6 border-b border-white/40">
            <h2 className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              Mis Hábitos ({habits.length})
            </h2>
          </div>
          
          <div className="p-6">
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌱</div>
                <p className="text-white font-bold text-lg" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>No tienes hábitos configurados aún.</p>
                <p className="text-white/90 text-base font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Crea tu primer hábito usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit: any) => {
                  const todayProgress = getTodayProgress(habit.id, habit.target)
                  const streak = getStreak(habit.id)
                  const weeklyProgress = getWeeklyProgress(habit.id)
                  const isCompleted = isCompletedToday(habit.id, habit.target)
                  
                  return (
                    <div key={habit.id} className="bg-white/30 backdrop-blur-md border border-white/45 rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button 
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-150 cursor-pointer backdrop-blur-md ${
                              isCompleted 
                                ? 'border-green-400 bg-green-500/70 text-white hover:bg-green-600/80 shadow-green-500/20' 
                                : 'border-green-400 bg-white/30 hover:bg-green-500/40 text-green-200 hover:text-white'
                            } shadow-lg`}
                            onClick={() => toggleHabitComplete(habit.id, habit.target)}
                            title={isCompleted ? 'Click para desmarcar' : 'Click para marcar como completado'}
                          >
                            <span className="text-2xl font-bold">{isCompleted ? '✓' : '+'}</span>
                          </button>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{getHabitIcon(habit.name)}</span>
                              <h3 className="font-bold text-white text-lg" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>{habit.name}</h3>
                            </div>
                            <p className="text-white font-medium text-base" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                              Frecuencia: {habit.frequency} | Meta: {habit.target} vez(es)
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* Progress indicator */}
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Hoy</div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-150 backdrop-blur-md border ${
                              isCompleted 
                                ? 'bg-green-500/70 text-green-100 border-green-400/50' 
                                : 'bg-white/30 text-white border-white/50'
                            } shadow-lg`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                              {todayProgress.completed}/{todayProgress.target}
                            </div>
                            {isCompleted && (
                              <div className="text-xs text-green-200 mt-1 font-bold" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                                ¡Completado!
                              </div>
                            )}
                          </div>
                          
                          {/* Streak */}
                          <div className="text-center">
                            <div className="text-sm font-bold text-orange-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Racha</div>
                            <div className="text-xl font-bold text-orange-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                              {streak > 0 ? `🔥 ${streak}` : '–'}
                            </div>
                          </div>
                          
                          {/* Edit and Delete buttons */}
                          <button 
                            className="text-white bg-blue-500/70 backdrop-blur-md border border-blue-400/50 hover:bg-blue-600/80 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md transform hover:scale-105"
                            onClick={() => editHabit(habit.id, habit.name)}
                            title="Editar hábito"
                            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
                          >
                            Editar
                          </button>
                          <button 
                            className="text-white bg-red-500/70 backdrop-blur-md border border-red-400/50 hover:bg-red-600/80 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md transform hover:scale-105" 
                            onClick={() => deleteHabit(habit.id, habit.name)}
                            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-white mb-2 font-bold" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                          <span>Progreso semanal</span>
                          <span>{weeklyProgress.completed}/{weeklyProgress.total} días</span>
                        </div>
                        <div className="w-full bg-white/30 backdrop-blur-md rounded-full h-3 border border-white/50">
                          <div className="bg-green-500/90 h-3 rounded-full transition-all duration-150 shadow-sm" style={{width: `${weeklyProgress.percentage}%`}}></div>
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