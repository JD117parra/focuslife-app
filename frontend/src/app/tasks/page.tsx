'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'
import { ConfirmModal, Calendar, Tooltip } from '@/components/ui'
import { GlassCard } from '@/components/GlassComponents'


interface Task {
  id: string
  title: string
  description?: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  // Estados para edición inline
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null)
  const [editingPriority, setEditingPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState('')
  // Estados para calendario visual
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarTaskId, setCalendarTaskId] = useState<string | null>(null)
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
  const calendarRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        console.error('No auth token found')
        setTasks([])
        return
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTasks(data.data)
      } else {
        console.error('Error loading tasks:', data.message)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      <GlassCard className="text-center">
      <div className="text-2xl">📋</div>
      <p className="text-blue-100 mt-2">Cargando tareas...</p>
      </GlassCard>
      </div>
    )
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTaskTitle.trim()) return

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('No estás autenticado. Por favor inicia sesión.')
        return
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: newTaskTitle,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined // Solo enviar si hay fecha
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTasks([...tasks, data.data])
        setNewTaskTitle('')
        setNewTaskPriority('MEDIUM') // Reset a valor por defecto
        setNewTaskDueDate('') // Reset fecha
        toast.success('¡Tarea creada exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const toggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    
    setTasks(tasks.map((task: Task) => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ))
    
    console.log(`Task ${taskId} changed to ${newStatus}`)
  }

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId)
    setShowConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('No estás autenticado. Por favor inicia sesión.')
        return
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskToDelete))
        toast.success('¡Tarea eliminada exitosamente!')
      } else {
        const data = await response.json()
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    } finally {
      setShowConfirmModal(false)
      setTaskToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowConfirmModal(false)
    setTaskToDelete(null)
  }

  // Funciones para edición inline
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingTitle(task.title)
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditingTitle('')
  }

  const saveTaskTitle = async (taskId: string) => {
    if (!editingTitle.trim()) {
      toast.error('El título no puede estar vacío')
      return
    }

    if (editingTitle.trim() === tasks.find(t => t.id === taskId)?.title) {
      // No hay cambios
      cancelEditing()
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('No estás autenticado. Por favor inicia sesión.')
        return
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Actualizar la tarea en el estado local
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, title: editingTitle.trim() }
            : task
        ))
        toast.success('¡Título actualizado exitosamente!')
        cancelEditing()
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      saveTaskTitle(taskId)
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  // Funciones para edición de prioridad
  const startEditingPriority = (task: Task) => {
    setEditingPriorityId(task.id)
    setEditingPriority(task.priority || 'MEDIUM')
  }

  const cancelEditingPriority = () => {
    setEditingPriorityId(null)
    setEditingPriority('MEDIUM')
  }

  const savePriority = async (taskId: string) => {
    const currentTask = tasks.find(t => t.id === taskId)
    if (editingPriority === currentTask?.priority) {
      // No hay cambios
      cancelEditingPriority()
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('No estás autenticado. Por favor inicia sesión.')
        return
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: editingPriority }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Actualizar la tarea en el estado local
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, priority: editingPriority }
            : task
        ))
        toast.success('¡Prioridad actualizada exitosamente!')
        cancelEditingPriority()
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  // Funciones para edición de fecha
  const startEditingDate = (task: Task) => {
    setEditingDateId(task.id)
    // Convertir fecha a formato YYYY-MM-DD para el input date
    if (task.dueDate) {
      const date = new Date(task.dueDate)
      const formattedDate = date.toISOString().split('T')[0]
      setEditingDate(formattedDate)
    } else {
      setEditingDate('')
    }
  }

  const cancelEditingDate = () => {
    setEditingDateId(null)
    setEditingDate('')
  }

  const handleDateKeyPress = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      saveDate(taskId)
    } else if (e.key === 'Escape') {
      cancelEditingDate()
    }
  }

  // Funciones para calendario visual
  const openCalendar = (task: Task, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setCalendarPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX
    })
    setCalendarTaskId(task.id)
    setShowCalendar(true)
  }

  const closeCalendar = () => {
    setShowCalendar(false)
    setCalendarTaskId(null)
  }

  const handleCalendarDateSelect = async (dateString: string) => {
    if (!calendarTaskId) return

    if (!dateString) {
      // Eliminar fecha
      await saveDate(calendarTaskId, null)
      return
    }

    // Guardar nueva fecha
    await saveDate(calendarTaskId, dateString)
  }

  // Función saveDate unificada que acepta fecha opcional
  const saveDate = async (taskId: string, newDate?: string | null) => {
    const dateToSave = newDate !== undefined ? newDate : editingDate
    const currentTask = tasks.find(t => t.id === taskId)
    const currentDateStr = currentTask?.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : ''
    
    if (dateToSave === currentDateStr) {
      // No hay cambios
      cancelEditingDate()
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('No estás autenticado. Por favor inicia sesión.')
        return
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          dueDate: dateToSave || null // Si no hay fecha, enviar null
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Actualizar la tarea en el estado local
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, dueDate: dateToSave ? new Date(dateToSave) : null }
            : task
        ))
        toast.success('¡Fecha actualizada exitosamente!')
        cancelEditingDate()
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  // Helper para obtener estilos de prioridad
  const getPriorityDisplay = (priority?: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (priority) {
      case 'HIGH':
        return { emoji: '🔴', text: 'Alta', bgColor: 'bg-red-100', textColor: 'text-red-800' }
      case 'MEDIUM':
        return { emoji: '🟡', text: 'Media', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
      case 'LOW':
        return { emoji: '🟢', text: 'Baja', bgColor: 'bg-green-100', textColor: 'text-green-800' }
      default:
        return { emoji: '🟡', text: 'Media', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
    }
  }

  // Helper para ordenar tareas por prioridad
  const getSortedTasks = () => {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
    return [...tasks].sort((a, b) => {
      const priorityA = priorityOrder[a.priority || 'MEDIUM']
      const priorityB = priorityOrder[b.priority || 'MEDIUM']
      return priorityB - priorityA // Orden descendente (alta prioridad primero)
    })
  }

  // Helpers para fechas
  const formatDate = (dateString?: Date | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    
    // Usar solo la fecha sin tiempo para comparación
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const taskDate = new Date(date)
    taskDate.setHours(0, 0, 0, 0)
    
    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const formatted = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    
    return { formatted, diffDays }
  }

  const getDateStatus = (dueDate?: Date | null) => {
    if (!dueDate) return null
    
    const dateInfo = formatDate(dueDate)
    if (!dateInfo) return null
    
    const { diffDays } = dateInfo
    
    if (diffDays < 0) {
      return {
        status: 'overdue',
        emoji: '❌',
        text: `Vencida (${Math.abs(diffDays)} días)`,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      }
    } else if (diffDays === 0) {
      return {
        status: 'today',
        emoji: '⚠️',
        text: 'Vence hoy',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-300'
      }
    } else if (diffDays <= 3) {
      return {
        status: 'soon',
        emoji: '🟡',
        text: `En ${diffDays} días`,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300'
      }
    } else {
      return {
        status: 'future',
        emoji: '📅',
        text: `En ${diffDays} días`,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <GlassCard variant="header" padding="md" shadow="lg" className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-200 hover:text-white transition-colors">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">📋 Gestión de Tareas</h1>
            </div>
            <Link href="/" className="text-blue-200 hover:text-white transition-colors">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </GlassCard>

      <div className="container mx-auto px-4 py-8">
        {/* Create Task Form */}
        <GlassCard className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Crear Nueva Tarea</h2>
          <form onSubmit={createTask} className="space-y-4">
            <div className="flex space-x-4">
              <Tooltip content="Escribe el título de tu nueva tarea">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 p-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-blue-100"
                  placeholder="Título de la tarea..."
                  required
                />
              </Tooltip>
              <Tooltip content="Selecciona la prioridad de la tarea">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="p-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white min-w-[120px]"
                >
                  <option value="LOW" className="bg-blue-900 text-white">🟢 Baja</option>
                  <option value="MEDIUM" className="bg-blue-900 text-white">🟡 Media</option>
                  <option value="HIGH" className="bg-blue-900 text-white">🔴 Alta</option>
                </select>
              </Tooltip>
              <Tooltip content="Fecha de vencimiento (opcional)">
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="p-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white min-w-[150px]"
                />
              </Tooltip>
              <Tooltip content="Crear la nueva tarea">
                <button
                  type="submit"
                  className="bg-blue-500/80 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm"
                >
                  Crear Tarea
                </button>
              </Tooltip>
            </div>
          </form>
        </GlassCard>

        {/* Tasks List */}
        <GlassCard>
          <div className="border-b border-white/20 pb-6 mb-6">
            <h2 className="text-lg font-semibold text-white">
              Mis Tareas ({tasks.length})
            </h2>
          </div>
          <div>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-blue-100">No tienes tareas aún.</p>
                <p className="text-blue-200 text-sm">Crea tu primera tarea usando el formulario de arriba.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                {getSortedTasks().map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Tooltip content={task.status === 'COMPLETED' ? 'Marcar como pendiente' : 'Marcar como completada'}>
                        <input 
                          type="checkbox" 
                          checked={task.status === 'COMPLETED'}
                          className="h-5 w-5 text-blue-400 cursor-pointer bg-white/10 border-white/30 rounded focus:ring-blue-400"
                          onChange={() => toggleTask(task.id, task.status)}
                        />
                      </Tooltip>
                      
                      {/* Título editable */}
                      {editingTaskId === task.id ? (
                        <Tooltip content="Presiona Enter para guardar o Esc para cancelar">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, task.id)}
                            onBlur={() => saveTaskTitle(task.id)}
                            className="flex-1 px-2 py-1 bg-white/10 border border-blue-400/50 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200"
                            autoFocus
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip content="Haz click para editar el título">
                          <span 
                            className={`cursor-pointer hover:text-blue-300 transition-colors ${
                              task.status === 'COMPLETED' ? 'line-through text-blue-300' : 'text-white'
                            }`}
                            onClick={() => startEditing(task)}
                          >
                            {task.title}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Indicador de prioridad editable */}
                      {editingPriorityId === task.id ? (
                        <Tooltip content="Selecciona la prioridad de la tarea">
                          <select
                            value={editingPriority}
                            onChange={(e) => setEditingPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                            onBlur={() => savePriority(task.id)}
                            className="px-2 py-1 text-xs rounded-full bg-white/10 border border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                            autoFocus
                          >
                            <option value="LOW" className="bg-blue-900 text-white">🟢 Baja</option>
                            <option value="MEDIUM" className="bg-blue-900 text-white">🟡 Media</option>
                            <option value="HIGH" className="bg-blue-900 text-white">🔴 Alta</option>
                          </select>
                        </Tooltip>
                      ) : (
                        (() => {
                          const priorityDisplay = getPriorityDisplay(task.priority)
                          return (
                            <Tooltip content="Haz click para cambiar la prioridad">
                              <span 
                                className={`px-2 py-1 text-xs rounded-full ${priorityDisplay.bgColor} ${priorityDisplay.textColor} flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity border border-white/20`}
                                onClick={() => startEditingPriority(task)}
                              >
                                <span>{priorityDisplay.emoji}</span>
                                <span>{priorityDisplay.text}</span>
                              </span>
                            </Tooltip>
                          )
                        })()
                      )}
                      
                      {/* Indicador de fecha de vencimiento editable */}
                      {editingDateId === task.id ? (
                        <div className="flex items-center space-x-1">
                          <Tooltip content="Escribe la fecha o presiona Enter para guardar">
                            <input
                              type="date"
                              value={editingDate}
                              onChange={(e) => setEditingDate(e.target.value)}
                              onKeyDown={(e) => handleDateKeyPress(e, task.id)}
                              onBlur={() => saveDate(task.id)}
                              className="px-2 py-1 text-xs rounded-full bg-white/10 border border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                              autoFocus
                            />
                          </Tooltip>
                          <Tooltip content="Abrir calendario visual">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openCalendar(task, e)
                              }}
                              className="px-1 py-1 text-xs text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                              type="button"
                            >
                              📅
                            </button>
                          </Tooltip>
                        </div>
                      ) : (
                        (() => {
                          const dateStatus = getDateStatus(task.dueDate)
                          const dateInfo = formatDate(task.dueDate)
                          
                          if (!dateInfo || !dateStatus) {
                            // Sin fecha - mostrar botón para agregar
                            return (
                              <div className="flex items-center space-x-1">
                                <Tooltip content="Haz click para agregar fecha de vencimiento">
                                  <span 
                                    className="px-2 py-1 text-xs rounded-full bg-white/10 text-blue-200 flex items-center space-x-1 cursor-pointer hover:bg-white/20 transition-colors border border-white/20"
                                    onClick={() => startEditingDate(task)}
                                  >
                                    <span>📅</span>
                                    <span>Sin fecha</span>
                                  </span>
                                </Tooltip>
                                <Tooltip content="Abrir calendario visual">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openCalendar(task, e)
                                    }}
                                    className="px-1 py-1 text-xs text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                                    type="button"
                                  >
                                    📅
                                  </button>
                                </Tooltip>
                              </div>
                            )
                          }
                          
                          return (
                            <div className="flex items-center space-x-1">
                              <Tooltip content={`Fecha: ${dateInfo.formatted} - Haz click para editar`}>
                                <span 
                                  className={`px-2 py-1 text-xs rounded-full ${dateStatus.bgColor} ${dateStatus.textColor} flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity border border-white/20`}
                                  onClick={() => startEditingDate(task)}
                                >
                                  <span>{dateStatus.emoji}</span>
                                  <span>{dateStatus.text}</span>
                                </span>
                              </Tooltip>
                              <Tooltip content="Abrir calendario visual">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openCalendar(task, e)
                                  }}
                                  className="px-1 py-1 text-xs text-blue-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                                  type="button"
                                >
                                  📅
                                </button>
                              </Tooltip>
                            </div>
                          )
                        })()
                      )}
                      
                      {/* Status */}
                      <Tooltip content={`Estado: ${task.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}`}>
                        <span className={`px-2 py-1 text-xs rounded-full border border-white/20 ${
                          task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {task.status}
                        </span>
                      </Tooltip>
                      
                      {/* Botón eliminar */}
                      <Tooltip content="Eliminar esta tarea" position="left">
                        <button 
                          className="text-red-300 hover:text-red-100 text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                          onClick={() => handleDeleteClick(task.id)}
                        >
                          Eliminar
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Eliminar Tarea"
        message="¿Estás seguro de que deseas eliminar esta tarea?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonStyle="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
      {/* Calendar */}
      <Calendar
        isOpen={showCalendar}
        selectedDate={calendarTaskId ? (
          tasks.find(t => t.id === calendarTaskId)?.dueDate 
            ? new Date(tasks.find(t => t.id === calendarTaskId)!.dueDate!).toISOString().split('T')[0]
            : undefined
        ) : undefined}
        onDateSelect={handleCalendarDateSelect}
        onClose={closeCalendar}
        position={calendarPosition}
      />
      
      {/* Toast Container */}
      <toast.ToastContainer />
    </div>
  )
}