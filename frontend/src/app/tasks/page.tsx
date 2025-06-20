'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'


interface Task {
  id: string
  title: string
  status: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const toast = useToast()


  useEffect(() => {
    loadTasks()
  }, [])

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

  const createTask = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!newTaskTitle.trim()) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      alert('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTaskTitle }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setTasks([...tasks, data.data])
      setNewTaskTitle('')
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

  const deleteTask = async (taskId: string) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    return
  }

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      alert('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      // Remover la tarea de la lista
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">📋 Gestión de Tareas</h1>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nueva Tarea</h2>
          <form onSubmit={createTask} className="flex space-x-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título de la tarea..."
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Crear Tarea
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Mis Tareas ({tasks.length})
            </h2>
          </div>
          
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600">No tienes tareas aún.</p>
                <p className="text-gray-500 text-sm">Crea tu primera tarea usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'COMPLETED'}
                        className="h-5 w-5 text-blue-600"
                        onChange={() => toggleTask(task.id, task.status)}
                      />
                      <span className={`${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      <button className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => deleteTask(task.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
       
  <div className="min-h-screen bg-gray-50">
    {/* ... todo el contenido existente ... */}
    
    {/* Toast Container */}
    <toast.ToastContainer />
  </div>
    </div>
  )
}