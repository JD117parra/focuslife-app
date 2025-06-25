'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/hooks/useConfirm';
import { EditTaskModal, ItemActionModal, TemplateModal } from '@/components/ui';
import { apiUrls } from '@/config/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string | null;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Control para evitar duplicación de notificación de bienvenida
  const welcomeShownRef = useRef(false);

  // Estado para el modal de tareas
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Estado para el modal de acciones
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Estado para el modal de plantillas
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Estado para el dropdown de búsqueda
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const toast = useToast();
  const {
    authenticatedFetch,
    isAuthenticated,
    isLoading: authLoading,
    user,
  } = useAuth();
  const confirm = useConfirm();

  // Función para aplicar filtros combinados de búsqueda y prioridad
  const applySearchAndPriorityFilter = useCallback((query: string, priority: string) => {
    let baseTasks = tasks;

    // Aplicar filtro de prioridad primero
    if (priority !== 'all') {
      baseTasks = baseTasks.filter(task => task.priority === priority);
    }

    // Aplicar búsqueda por texto si existe
    if (query.trim()) {
      baseTasks = baseTasks.filter(
        task =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredTasks(baseTasks);
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.list());
      const data = await response.json();

      if (response.ok) {
        setTasks(data.data);
        setFilteredTasks(data.data);
        // Aplicar filtros actuales si existen
        if (searchQuery || priorityFilter !== 'all') {
          setTimeout(() => applySearchAndPriorityFilter(searchQuery, priorityFilter), 0);
        }
      } else {
        toast.error(`Error cargando tareas: ${data.message}`);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTasks();
      
      // Toast de bienvenida - solo una vez
      if (!welcomeShownRef.current) {
        welcomeShownRef.current = true;
        setTimeout(() => {
          toast.welcome(
            `¿Tienes tareas pendientes para hoy ${user?.name || user?.email || 'Usuario'}? 📋`,
            4000
          );
        }, 500);
      }
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  // Funciones para manejar el modal de tareas
  const openCreateTaskModal = () => {
    setEditingTask(null);
    setIsEditingMode(false);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsEditingMode(true);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setIsEditingMode(false);
  };

  // Funciones para manejar el modal de plantillas
  const openTemplateModal = () => {
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const handleTemplateSelect = (template: any) => {
    // Convertir template a formato de tarea
    const templateTask: Partial<Task> = {
      title: template.title,
      description: template.description,
      priority: template.priority,
      status: 'PENDING',
      dueDate: null,
    };
    
    closeTemplateModal();
    setEditingTask(templateTask as Task);
    setIsEditingMode(false);
    setIsTaskModalOpen(true);
  };

  const handleCreateFromScratch = () => {
    closeTemplateModal();
    openCreateTaskModal();
  };

  interface TaskData {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: string;
    dueDate?: string | null;
  }

  const handleTaskModalConfirm = async (taskData: TaskData) => {
    if (isEditingMode && editingTask?.id) {
      await updateTaskComplete(editingTask.id, taskData);
    } else {
      await createTaskComplete(taskData);
    }
    closeTaskModal();
  };

  // Funciones para el modal de acciones
  const openActionModal = (task: Task) => {
    setSelectedTask(task);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedTask(null);
  };

  const handleEditFromAction = () => {
    if (selectedTask) {
      closeActionModal();
      openEditTaskModal(selectedTask);
    }
  };

  const handleDeleteFromAction = () => {
    if (selectedTask) {
      closeActionModal();
      deleteTask(selectedTask.id, selectedTask.title);
    }
  };

  const createTaskComplete = async (taskData: TaskData) => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.create(), {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        await loadTasks();
        toast.success('¡Tarea creada exitosamente!');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const updateTaskComplete = async (taskId: string, taskData: TaskData) => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.update(taskId), {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        await loadTasks();
        toast.success('¡Tarea editada exitosamente!');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  // Función para búsqueda en tiempo real con filtro de prioridad
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applySearchAndPriorityFilter(query, priorityFilter);
  };

  const handlePriorityFilter = (priority: string) => {
    setPriorityFilter(priority);
    applySearchAndPriorityFilter(searchQuery, priority);
  };

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      const response = await authenticatedFetch(apiUrls.tasks.update(taskId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedTasks = tasks.map((task: Task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        setTasks(updatedTasks);

        const updatedFilteredTasks = filteredTasks.map((task: Task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        setFilteredTasks(updatedFilteredTasks);

        const statusText =
          newStatus === 'COMPLETED' ? 'completada' : 'marcada como pendiente';
        toast.success(`¡Tarea ${statusText}!`);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      console.error('Error toggling task:', _error);
      toast.error('Error de conexión con el servidor');
    }
  };

  const deleteTask = async (taskId: string, taskTitle: string) => {
    const confirmed = await confirm.confirmDelete(taskTitle);
    if (!confirmed) {
      return;
    }

    try {
      const response = await authenticatedFetch(apiUrls.tasks.delete(taskId), {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        setFilteredTasks(filteredTasks.filter(t => t.id !== taskId));
        toast.delete('¡Tarea eliminada exitosamente!');
      } else {
        const data = await response.json();
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const editTask = (task: Task) => {
    openEditTaskModal(task);
  };

  // Funciones auxiliares para fechas
  const isToday = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date < today && !isToday(dateString);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowOnly = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return { text: 'Hoy', isToday: true, isOverdue: false };
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return { text: 'Mañana', isToday: false, isOverdue: false };
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return { text: 'Ayer', isToday: false, isOverdue: true };
    } else if (dateOnly < todayOnly) {
      return {
        text: date.toLocaleDateString('es-ES'),
        isToday: false,
        isOverdue: true,
      };
    } else {
      return {
        text: date.toLocaleDateString('es-ES'),
        isToday: false,
        isOverdue: false,
      };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border border-red-300 font-semibold';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-700 border border-orange-300 font-semibold';
      case 'LOW':
        return 'bg-green-100 text-green-700 border border-green-300 font-semibold';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300 font-semibold';
    }
  };

  // Función para ordenar tareas por prioridad
  const sortTasksByPriority = (tasks: Task[]) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    return [...tasks].sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;

      const statusOrder = { PENDING: 0, IN_PROGRESS: 1, COMPLETED: 2 };
      const statusDiff =
        statusOrder[a.status as keyof typeof statusOrder] -
        statusOrder[b.status as keyof typeof statusOrder];
      if (statusDiff !== 0) return statusDiff;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Función para agrupar tareas por prioridad con separadores
  const renderTasksWithSeparators = (tasks: Task[]) => {
    const sortedTasks = sortTasksByPriority(tasks);
    const result: JSX.Element[] = [];
    let currentPriority: string | null = null;

    sortedTasks.forEach((task, index) => {
      if (currentPriority !== null && currentPriority !== task.priority) {
        result.push(
          <div
            key={`separator-${task.priority}-${index}`}
            className="flex items-center my-4"
          >
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4 py-2 text-sm font-bold text-gray-700 bg-white/90 rounded-full border border-gray-200">
              {task.priority === 'MEDIUM'
                ? '🟡 Prioridad Media'
                : '🟢 Prioridad Baja'}
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        );
      }

      if (currentPriority === null && task.priority === 'HIGH') {
        result.push(
          <div key={`header-high`} className="flex items-center mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4 py-2 text-sm font-bold text-gray-700 bg-white/90 rounded-full border border-gray-200">
              🔴 Prioridad Alta
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        );
      }

      currentPriority = task.priority;

      const dateInfo = formatDate(task.dueDate);

      const getPriorityStyles = (
        priority: string,
        dateInfo: any,
        status: string
      ) => {
        if (dateInfo?.isOverdue && status !== 'COMPLETED') {
          return 'border-l-red-400 bg-red-50/95 shadow-md';
        }
        if (dateInfo?.isToday) {
          return 'border-l-blue-400 bg-blue-50/95 shadow-md';
        }
        switch (priority) {
          case 'HIGH':
            return 'border-l-red-400 bg-red-50/95 shadow-md';
          case 'MEDIUM':
            return 'border-l-orange-400 bg-orange-50/95 shadow-md';
          case 'LOW':
            return 'border-l-green-400 bg-green-50/95 shadow-md';
          default:
            return 'border-l-gray-400 bg-white/95 shadow-md';
        }
      };

      result.push(
        <div
          key={task.id}
          className={`p-4 rounded-lg border-l-4 border border-gray-200/50 ${getPriorityStyles(
            task.priority,
            dateInfo,
            task.status
          )} cursor-pointer hover:scale-[1.01] hover:shadow-lg transition-all duration-200`}
          onClick={() => openActionModal(task)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={task.status === 'COMPLETED'}
                className="h-4 w-4 text-blue-600 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id, task.status);
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`font-semibold text-base leading-snug ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority === 'HIGH'
                      ? 'Alta'
                      : task.priority === 'MEDIUM'
                        ? 'Media'
                        : 'Baja'}
                  </span>
                </div>

                {task.description && (
                  <div className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2">
                    {task.description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <div className="text-sm text-center min-w-0 font-medium">
                {dateInfo ? (
                  <div
                    className={`flex items-center space-x-1 ${
                      dateInfo.isOverdue && task.status !== 'COMPLETED'
                        ? 'text-red-600 font-semibold'
                        : dateInfo.isToday
                          ? 'text-blue-600 font-semibold'
                          : 'text-gray-600 font-medium'
                    }`}
                  >
                    <span>📅</span>
                    <span className="whitespace-nowrap">{dateInfo.text}</span>
                    {dateInfo.isOverdue && task.status !== 'COMPLETED' && (
                      <span className="text-red-600">⚠️</span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 flex items-center space-x-1 font-medium">
                    <span>📅</span>
                    <span className="whitespace-nowrap">Sin fecha</span>
                  </div>
                )}
              </div>

              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                  }`}
                >
                  {task.status === 'COMPLETED'
                    ? 'Completada'
                    : task.status === 'IN_PROGRESS'
                      ? 'En progreso'
                      : 'Pendiente'}
                </span>
              </div>


            </div>
          </div>
        </div>
      );
    });

    return result;
  };

  // Funciones para el calendario mensual
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convertir domingo=0 a lunes=0
  };

  const getTasksForDate = (date: Date, tasks: Task[]) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    
    const days = [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 bg-white/15 border border-white/20 rounded-lg"></div>
      );
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const tasksForDay = getTasksForDate(date, filteredTasks);
      const isToday = isCurrentMonth && day === today.getDate();
      
      days.push(
        <div
          key={day}
          className={`h-24 border border-white/25 rounded-lg px-3 py-2 relative overflow-hidden ${
            isToday 
              ? 'bg-blue-500/40 border-blue-400/60' 
              : 'bg-white/15 hover:bg-white/25'
          } transition-colors duration-200`}
        >
          <div className={`text-sm font-medium mb-2 ${
            isToday ? 'text-blue-100' : 'text-white/90'
          }`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
            {day}
            {isToday && <span className="ml-1 text-xs">•</span>}
          </div>
          
          <div className="space-y-1">
            {tasksForDay.slice(0, 1).map(task => (
              <div
                key={task.id}
                onClick={() => openActionModal(task)}
                className={`text-xs p-1 rounded cursor-pointer hover:scale-105 transition-transform duration-150 ${
                  task.status === 'COMPLETED'
                    ? 'bg-green-500/60 text-green-100 line-through'
                    : task.priority === 'HIGH'
                      ? 'bg-red-500/60 text-red-100'
                      : task.priority === 'MEDIUM'
                        ? 'bg-yellow-500/60 text-yellow-100'
                        : 'bg-blue-500/60 text-blue-100'
                }`}
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                title={task.description || task.title}
              >
                {task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title}
              </div>
            ))}
            
            {tasksForDay.length > 1 && (
              <div className="text-xs text-white/70 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                +{tasksForDay.length - 1} más
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header del calendario */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="flex items-center gap-2 px-2 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors duration-200 text-sm"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
          >
            ← Anterior
          </button>
          
          <h3 className="text-lg font-bold text-white capitalize" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
            {formatMonthYear(currentMonth)}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="flex items-center gap-2 px-2 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors duration-200 text-sm"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
          >
            Siguiente →
          </button>
        </div>
        
        {/* Nombres de los días */}
        <div className="grid grid-cols-7 gap-4">
          {dayNames.map(dayName => (
            <div
              key={dayName}
              className="h-8 flex items-center justify-center text-sm font-bold text-white/90 bg-white/15 rounded-lg border border-white/25"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-4">
          {days}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
          >
            Verificando autenticación...
          </h2>
          <p
            className="text-white/80 text-lg font-medium"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)' }}
          >
            Preparando tu espacio de tareas
          </p>
          <div className="mt-6">
            <div className="inline-block animate-spin text-3xl">⏳</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!authLoading && typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-blue-100 hover:text-white"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">
                📋 Gestión de Tareas
              </h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white font-bold text-lg">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sección de Creación de Tareas */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-6">
          {/* Botón Crear Tarea */}
<div className="mb-6 px-4">
  <button
    onClick={openTemplateModal}
    className="w-full bg-blue-600/70 backdrop-blur-md text-white px-6 py-4 rounded-lg font-bold border border-blue-400/70 hover:bg-blue-700/80 transition-all duration-150 shadow-lg text-base"
    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
  >
    ✨ Crear Nueva Tarea
  </button>
</div>
        </div>

        {/* Lista de Tareas */}
        <div className="bg-white/25 shadow-lg border border-white/30 rounded-lg">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between gap-4">
              <h2
                className="text-xl font-bold text-white"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                Mis Tareas ({filteredTasks.length} de {tasks.length})
              </h2>
              
              {/* Barra de búsqueda con dropdown */}
              <div className="relative flex-1 max-w-[15rem]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
                  className="w-full p-2 bg-white/95 border border-gray-300/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-500 font-medium text-sm pl-3 pr-10 shadow-sm"
                  placeholder="Buscar tareas..."
                  style={{}}
                />
                <button
                  onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm hover:text-gray-700"
                >
                  ▼
                </button>
                
                {/* Dropdown de prioridad */}
                {isSearchDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 border border-gray-300/60 rounded-lg shadow-xl z-10 backdrop-blur-sm">
                    <div className="p-3">
                      {/* Sección Vista */}
                      <div className="mb-4">
                        <div className="text-sm font-bold text-gray-700 mb-3 px-2">Vista:</div>
                        {[
                          { key: 'list', label: 'Vista Lista', icon: '📋' },
                          { key: 'calendar', label: 'Vista Calendario', icon: '🗓️' },
                        ].map(option => (
                          <button
                            key={option.key}
                            onClick={() => {
                              setViewMode(option.key as 'list' | 'calendar');
                              setIsSearchDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                              viewMode === option.key
                                ? 'bg-blue-100 text-blue-700 font-semibold border border-blue-300 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100 border border-transparent font-medium'
                            }`}
                          >
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                            {viewMode === option.key && <span className="ml-auto text-blue-600">✓</span>}
                          </button>
                        ))}
                      </div>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-300 my-3"></div>
                      
                      {/* Sección Prioridad */}
                      <div className="text-sm font-bold text-gray-700 mb-3 px-2">Filtrar por prioridad:</div>
                      {[
                        { key: 'all', label: 'Todas las prioridades', icon: '📊' },
                        { key: 'HIGH', label: 'Alta prioridad', icon: '🔴' },
                        { key: 'MEDIUM', label: 'Prioridad media', icon: '🟡' },
                        { key: 'LOW', label: 'Baja prioridad', icon: '🟢' },
                      ].map(option => (
                        <button
                          key={option.key}
                          onClick={() => {
                            handlePriorityFilter(option.key);
                            setIsSearchDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                            priorityFilter === option.key
                              ? 'bg-green-100 text-green-700 font-semibold border border-green-300 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100 border border-transparent font-medium'
                          }`}
                        >
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                          {priorityFilter === option.key && <span className="ml-auto text-green-600">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-4">⌛</div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  Cargando tareas...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  No tienes tareas aún.
                </p>
                <p
                  className="text-white/90 text-base font-medium"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Crea tu primera tarea usando el botón de arriba.
                </p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  No se encontraron tareas con este filtro.
                </p>
                <p
                  className="text-white/90 text-base font-medium"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Intenta con un filtro diferente o crea nuevas tareas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {viewMode === 'list' 
                  ? renderTasksWithSeparators(filteredTasks)
                  : renderCalendarView()
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <toast.ToastContainer />

      {/* Confirm Modal */}
      <confirm.ConfirmModal />

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        type="task"
        onTemplateSelect={handleTemplateSelect}
        onCreateFromScratch={handleCreateFromScratch}
        onCancel={closeTemplateModal}
      />

      {/* Task Modal */}
      <EditTaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        isEditing={isEditingMode}
        onConfirm={handleTaskModalConfirm}
        onCancel={closeTaskModal}
      />

      {/* Item Action Modal */}
      <ItemActionModal
        isOpen={isActionModalOpen}
        task={selectedTask}
        onEdit={handleEditFromAction}
        onDelete={handleDeleteFromAction}
        onClose={closeActionModal}
        type="task"
      />
    </div>
  );
}
