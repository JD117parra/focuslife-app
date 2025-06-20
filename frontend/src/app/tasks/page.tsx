'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/hooks/useConfirm'
import { useEditModal } from '@/hooks/useEditModal'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate: string | null
  category?: {
    id: string
    name: string
    color: string
  } | null
  createdAt: string
  updatedAt: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { authenticatedFetch, isAuthenticated, isLoading: authLoading } = useAuth()
  const confirm = useConfirm()
  const editModal = useEditModal()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTasks()
    } else if (!authLoading && !isAuthenticated) {
      // El hook ya maneja la redirección
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  const loadTasks = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:5000/api/tasks')
      const data = await response.json()
      
      if (response.ok) {
        setTasks(data.data)
      } else {
        toast.error('Error cargando tareas: ' + data.message)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTaskTitle.trim()) return

    try {
      const taskData = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        dueDate: newTaskDueDate || undefined,
        priority: newTaskPriority
      }
      
      const response = await authenticatedFetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Recargar tareas
        await loadTasks()
        
        // Limpiar formulario
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskDueDate('')
        setNewTaskPriority('MEDIUM')
        
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

  const deleteTask = async (taskId: string, taskTitle: string) => {
    const confirmed = await confirm.confirmDelete(taskTitle)
    if (!confirmed) {
      return
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
        toast.delete('¡Tarea eliminada exitosamente!')
      } else {
        const data = await response.json()
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const editTask = async (taskId: string, currentTitle: string) => {
    const newTitle = await editModal.editTask(currentTitle)
    if (!newTitle) {
      return // Usuario canceló
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        await loadTasks()
        toast.success('¡Tarea editada exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  // Funciones auxiliares
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Comparar solo fechas, sin horas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return { text: 'Hoy', isToday: true, isOverdue: false }
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return { text: 'Mañana', isToday: false, isOverdue: false }
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return { text: 'Ayer', isToday: false, isOverdue: true }
    } else if (dateOnly < todayOnly) {
      return { text: date.toLocaleDateString('es-ES'), isToday: false, isOverdue: true }
    } else {
      return { text: date.toLocaleDateString('es-ES'), isToday: false, isOverdue: false }
    }
  }

  // Función para usar plantilla
  const useTemplate = (template: {title: string, desc: string, priority: 'LOW' | 'MEDIUM' | 'HIGH'}) => {
    setNewTaskTitle(template.title)
    setNewTaskDescription(template.desc)
    setNewTaskPriority(template.priority)
    // Limpiar fecha para que el usuario la establezca
    setNewTaskDueDate('')
    
    // Scroll hasta el formulario
    const formElement = document.getElementById('task-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📋</div>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-100 hover:text-white">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">📋 Gestión de Tareas</h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Introducción al servicio */}
        <div className="bg-blue-50/80 backdrop-blur-sm shadow-xl ring-1 ring-blue-100/20 p-6 rounded-lg mb-8 border border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              📋 Gestiona tus Tareas de Forma Eficiente
            </h2>
            <p className="text-blue-800 text-lg mb-4">
              Organiza tu día, establece prioridades y nunca olvides una tarea importante.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">📅</span>
                <span>Fechas de vencimiento</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🟡</span>
                <span>Prioridades personalizables</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">✅</span>
                <span>Seguimiento de progreso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plantillas de tareas comunes */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">✨ Plantillas Rápidas</h2>
          <p className="text-gray-600 text-xs mb-4">Click para autocompletar el formulario</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Revisar emails', desc: 'Chequear y responder correos importantes', priority: 'MEDIUM', icon: '📧' },
              { title: 'Llamar a un cliente', desc: 'Seguimiento de proyecto o consulta', priority: 'HIGH', icon: '📞' },
              { title: 'Comprar víveres', desc: 'Lista de compras para la semana', priority: 'MEDIUM', icon: '🛒' },
              { title: 'Revisar presupuesto', desc: 'Análisis mensual de finanzas', priority: 'MEDIUM', icon: '📊' },
              { title: 'Preparar presentación', desc: 'Slides para reunión del próximo jueves', priority: 'HIGH', icon: '📊' },
              { title: 'Renovar documentos', desc: 'Licencia, seguro o trámites pendientes', priority: 'MEDIUM', icon: '📝' }
            ].map((template, index) => (
              <div 
                key={index}
                onClick={() => useTemplate(template)}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all bg-white"
              >
                <div className="text-center">
                  <div className="text-xl mb-1">{template.icon}</div>
                  <h3 className="font-medium text-gray-900 text-xs mb-1 leading-tight">{template.title}</h3>
                  <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full font-medium ${
                    template.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    template.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {template.priority === 'HIGH' ? 'Alta' :
                     template.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div id="task-form" className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">✏️ Crear Tarea Personalizada</h2>
          <p className="text-gray-600 text-sm mb-6">¿No encontraste lo que buscabas arriba? Crea tu tarea personalizada con todos los detalles</p>
          <form onSubmit={createTask} className="space-y-4">
            {/* Primera fila: Título (más ancho) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Título de la tarea..."
                required
              />
            </div>
            
            {/* Segunda fila: Descripción (más compacta) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Descripción opcional..."
                rows={2}
              />
            </div>
            
            {/* Tercera fila: Fecha, Prioridad y Botón en una sola fila */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">🟢 Baja</option>
                  <option value="MEDIUM">🟡 Media</option>
                  <option value="HIGH">🔴 Alta</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  ➕ Crear Tarea
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Mis Tareas ({tasks.length})
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-4">⌛</div>
                <p className="text-gray-600">Cargando tareas...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600">No tienes tareas aún.</p>
                <p className="text-gray-500 text-sm">Crea tu primera tarea usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: Task) => {
                  const dateInfo = formatDate(task.dueDate)
                  return (
                    <div key={task.id} className={`p-3 rounded-lg border-l-4 bg-gray-50 ${
                      dateInfo?.isOverdue && task.status !== 'COMPLETED' ? 'border-l-red-500 bg-red-50' :
                      dateInfo?.isToday ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <input 
                            type="checkbox" 
                            checked={task.status === 'COMPLETED'}
                            className="h-4 w-4 text-blue-600 rounded"
                            onChange={() => toggleTask(task.id, task.status)}
                          />
                          <div className="flex-1 min-w-0">
                            {/* Título y prioridad */}
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`font-medium truncate ${
                                task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </span>
                              <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${
                                getPriorityColor(task.priority)
                              }`}>
                                {task.priority === 'HIGH' ? 'Alta' :
                                 task.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                            
                            {/* Descripción (si existe) */}
                            {task.description && (
                              <div className="text-xs text-gray-600 truncate">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Lado derecho: Fecha, Estado y Botones */}
                        <div className="flex items-center space-x-3 ml-4">
                          {/* Fecha */}
                          <div className="text-xs text-center min-w-0">
                            {dateInfo ? (
                              <div className={`flex items-center space-x-1 ${
                                dateInfo.isOverdue && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' :
                                dateInfo.isToday ? 'text-blue-600 font-medium' :
                                'text-gray-500'
                              }`}>
                                <span>📅</span>
                                <span className="whitespace-nowrap">{dateInfo.text}</span>
                                {dateInfo.isOverdue && task.status !== 'COMPLETED' && (
                                  <span className="text-red-600">⚠️</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 flex items-center space-x-1">
                                <span>📅</span>
                                <span className="whitespace-nowrap">Sin fecha</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Estado */}
                          <div>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap ${
                              task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {task.status === 'COMPLETED' ? 'Completada' :
                               task.status === 'IN_PROGRESS' ? 'En progreso' : 'Pendiente'}
                            </span>
                          </div>
                          
                          {/* Botones */}
                          <div className="flex items-center space-x-1">
                            <button 
                              className="text-blue-600 hover:bg-blue-100 text-xs px-2 py-1 rounded transition-colors"
                              onClick={() => editTask(task.id, task.title)}
                              title="Editar tarea"
                            >
                              Editar
                            </button>
                            <button 
                              className="text-red-600 hover:bg-red-100 text-xs px-2 py-1 rounded transition-colors"
                              onClick={() => deleteTask(task.id, task.title)}
                            >
                              ×
                            </button>
                          </div>
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