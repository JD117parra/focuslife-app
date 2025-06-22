'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/hooks/useConfirm';
import { EditTaskModal } from '@/components/ui';
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
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Estado para el modal de tareas
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const toast = useToast();
  const {
    authenticatedFetch,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const confirm = useConfirm();

  const loadTasks = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.list());
      const data = await response.json();

      if (response.ok) {
        setTasks(data.data);
        setFilteredTasks(data.data);
      } else {
        toast.error(`Error cargando tareas: ${data.message}`);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, toast]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTasks();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, loadTasks]);

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

  const openTemplateTaskModal = (template: {
    title: string;
    desc: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }) => {
    const templateTask: Partial<Task> = {
      title: template.title,
      description: template.desc,
      priority: template.priority,
      status: 'PENDING',
      dueDate: null,
    };
    setEditingTask(templateTask as Task);
    setIsEditingMode(false);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setIsEditingMode(false);
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

  const createTaskComplete = async (taskData: TaskData) => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.create(), {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        await loadTasks();
        await applyFilter(activeFilter);
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
        await applyFilter(activeFilter);
        toast.success('¡Tarea editada exitosamente!');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  // Función para aplicar filtros combinados
  const applyCombinedFilter = (filterType: string, allTasks: Task[]) => {
    switch (filterType) {
      case 'urgent':
        return allTasks.filter(
          task =>
            isOverdue(task.dueDate) &&
            task.priority === 'HIGH' &&
            task.status !== 'COMPLETED'
        );
      case 'today-important':
        return allTasks.filter(
          task =>
            isToday(task.dueDate) &&
            task.priority === 'HIGH' &&
            task.status === 'PENDING'
        );
      case 'overdue-all':
        return allTasks.filter(
          task => isOverdue(task.dueDate) && task.status !== 'COMPLETED'
        );
      case 'unplanned-urgent':
        return allTasks.filter(
          task =>
            !task.dueDate &&
            task.priority === 'HIGH' &&
            task.status === 'PENDING'
        );
      case 'achievements':
        return allTasks.filter(
          task => task.status === 'COMPLETED' && task.priority === 'HIGH'
        );
      default:
        return allTasks;
    }
  };

  // Función para aplicar filtros
  const applyFilter = async (filterType: string) => {
    if (filterType === activeFilter) return;

    setFilterLoading(true);
    setActiveFilter(filterType);

    try {
      const combinedFilters = [
        'urgent',
        'today-important',
        'overdue-all',
        'unplanned-urgent',
        'achievements',
      ];

      if (combinedFilters.includes(filterType)) {
        if (tasks.length === 0) {
          const response = await authenticatedFetch(apiUrls.tasks.list());
          const data = await response.json();
          if (response.ok) {
            const allTasks = data.data;
            setTasks(allTasks);
            const filtered = applyCombinedFilter(filterType, allTasks);
            setFilteredTasks(filtered);
          } else {
            toast.error(`Error cargando tareas: ${data.message}`);
          }
        } else {
          const filtered = applyCombinedFilter(filterType, tasks);
          setFilteredTasks(filtered);
        }
        setFilterLoading(false);
        return;
      }

      let response;

      switch (filterType) {
        case 'all':
          response = await authenticatedFetch(apiUrls.tasks.list());
          break;
        case 'today':
          response = await authenticatedFetch(apiUrls.tasks.today());
          break;
        case 'overdue':
          response = await authenticatedFetch(apiUrls.tasks.overdue());
          break;
        case 'week':
          response = await authenticatedFetch(apiUrls.tasks.week());
          break;
        case 'no-date':
          response = await authenticatedFetch(apiUrls.tasks.noDate());
          break;
        case 'pending':
          setFilteredTasks(tasks.filter(task => task.status === 'PENDING'));
          setFilterLoading(false);
          return;
        case 'completed':
          setFilteredTasks(tasks.filter(task => task.status === 'COMPLETED'));
          setFilterLoading(false);
          return;
        case 'high-priority':
          setFilteredTasks(tasks.filter(task => task.priority === 'HIGH'));
          setFilterLoading(false);
          return;
        default:
          response = await authenticatedFetch(apiUrls.tasks.list());
      }

      if (response) {
        const data = await response.json();
        if (response.ok) {
          setFilteredTasks(data.data);
        } else {
          toast.error(`Error aplicando filtro: ${data.message}`);
        }
      }
    } catch (_error) {
      console.error('Error applying filter:', _error);
      toast.error('Error de conexión');
    } finally {
      setFilterLoading(false);
    }
  };

  // Función para búsqueda en tiempo real
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      applyFilter(activeFilter);
      return;
    }

    let baseTasks: Task[];
    const combinedFilters = [
      'urgent',
      'today-important',
      'overdue-all',
      'unplanned-urgent',
      'achievements',
    ];

    if (combinedFilters.includes(activeFilter)) {
      baseTasks = applyCombinedFilter(activeFilter, tasks);
    } else if (activeFilter === 'all') {
      baseTasks = tasks;
    } else {
      baseTasks = filteredTasks;
    }

    const filtered = baseTasks.filter(
      task =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredTasks(filtered);
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

  const applyTemplate = (template: {
    title: string;
    desc: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
  }) => {
    openTemplateTaskModal(template);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/60 text-red-100 border border-red-400/40';
      case 'MEDIUM':
        return 'bg-yellow-500/60 text-yellow-100 border border-yellow-400/40';
      case 'LOW':
        return 'bg-green-500/60 text-green-100 border border-green-400/40';
      default:
        return 'bg-gray-500/60 text-gray-100 border border-gray-400/40';
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
            <div className="flex-1 h-px bg-white/20"></div>
            <div
              className="px-4 text-xs font-bold text-white/60"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              {task.priority === 'MEDIUM'
                ? '🟡 Prioridad Media'
                : '🟢 Prioridad Baja'}
            </div>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
        );
      }

      if (currentPriority === null && task.priority === 'HIGH') {
        result.push(
          <div key={`header-high`} className="flex items-center mb-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <div
              className="px-4 text-xs font-bold text-white/60"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              🔴 Prioridad Alta
            </div>
            <div className="flex-1 h-px bg-white/20"></div>
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
          return 'border-l-rose-200 bg-rose-50/80';
        }
        if (dateInfo?.isToday) {
          return 'border-l-blue-300 bg-blue-100/60';
        }
        switch (priority) {
          case 'HIGH':
            return 'border-l-rose-200 bg-rose-50/80';
          case 'MEDIUM':
            return 'border-l-amber-200 bg-amber-50/80';
          case 'LOW':
            return 'border-l-teal-300 bg-teal-100/60';
          default:
            return 'border-l-slate-300 bg-slate-100/60';
        }
      };

      result.push(
        <div
          key={task.id}
          className={`p-3 rounded-lg border-l-4 border border-white/30 ${getPriorityStyles(
            task.priority,
            dateInfo,
            task.status
          )} shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={task.status === 'COMPLETED'}
                className="h-4 w-4 text-blue-600 rounded"
                onChange={() => toggleTask(task.id, task.status)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`font-medium truncate ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-white/50'
                        : 'text-white'
                    }`}
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${getPriorityColor(
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
                  <div
                    className="text-sm text-white/80 truncate font-medium"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                  >
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
                        ? 'text-red-200 font-medium'
                        : dateInfo.isToday
                          ? 'text-blue-200 font-medium'
                          : 'text-white/70'
                    }`}
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    <span>📅</span>
                    <span className="whitespace-nowrap">{dateInfo.text}</span>
                    {dateInfo.isOverdue && task.status !== 'COMPLETED' && (
                      <span className="text-red-200">⚠️</span>
                    )}
                  </div>
                ) : (
                  <div
                    className="text-white/60 flex items-center space-x-1 font-medium"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                  >
                    <span>📅</span>
                    <span className="whitespace-nowrap">Sin fecha</span>
                  </div>
                )}
              </div>

              <div>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap border ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-500/60 text-green-100 border-green-400/40'
                      : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/60 text-blue-100 border-blue-400/40'
                        : 'bg-yellow-500/60 text-yellow-100 border-yellow-400/40'
                  }`}
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  {task.status === 'COMPLETED'
                    ? 'Completada'
                    : task.status === 'IN_PROGRESS'
                      ? 'En progreso'
                      : 'Pendiente'}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  className="text-white bg-blue-500/70 border border-blue-400/50 hover:bg-blue-600/80 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md transform hover:scale-105"
                  onClick={() => editTask(task)}
                  title="Editar tarea"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
                >
                  Editar
                </button>
                <button
                  className="text-white bg-red-500/70 border border-red-400/50 hover:bg-red-600/80 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md transform hover:scale-105"
                  onClick={() => deleteTask(task.id, task.title)}
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    });

    return result;
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
            <Link href="/" className="text-blue-100 hover:text-white">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Introducción al servicio */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-8">
          <div className="text-center">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              📋 Gestiona tus Tareas de Forma Eficiente
            </h2>
            <p
              className="text-white text-base font-medium mb-6"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
            >
              Organiza tu día, establece prioridades y nunca olvides una tarea
              importante.
            </p>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-6">
          <div className="flex flex-col space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 font-medium text-base pl-10"
                placeholder="🔍 Buscar tareas por título o descripción..."
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">
                🔍
              </div>
            </div>

            {/* Filtros Inteligentes Combinados */}
            <div className="flex flex-wrap gap-2">
              <h3
                className="text-sm font-bold text-white mb-2 w-full"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                🎆 Filtros Inteligentes (Combinados):
              </h3>

              {[
                {
                  key: 'urgent',
                  label: 'Urgente',
                  icon: '🔥',
                  color: 'red',
                  desc: 'Vencidas + Alta prioridad',
                },
                {
                  key: 'today-important',
                  label: 'Hoy Importante',
                  icon: '📅',
                  color: 'blue',
                  desc: 'Hoy + Alta prioridad',
                },
                {
                  key: 'overdue-all',
                  label: 'Atrasadas',
                  icon: '⚠️',
                  color: 'orange',
                  desc: 'Vencidas + Sin completar',
                },
                {
                  key: 'unplanned-urgent',
                  label: 'Sin Planificar',
                  icon: '📋',
                  color: 'purple',
                  desc: 'Sin fecha + Alta prioridad',
                },
                {
                  key: 'achievements',
                  label: 'Logros',
                  icon: '✅',
                  color: 'green',
                  desc: 'Completadas + Alta prioridad',
                },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => applyFilter(filter.key)}
                  disabled={filterLoading}
                  className={`px-3 py-2 rounded-lg border transition-all duration-150 font-bold text-sm ${
                    activeFilter === filter.key
                      ? `bg-${filter.color}-500/70 border-${filter.color}-400/50 text-white shadow-md`
                      : 'bg-white/20 border-white/30 text-white/90 hover:bg-white/30 hover:border-white/40'
                  } ${filterLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  title={filter.desc}
                >
                  {filter.icon} {filter.label}
                  {filterLoading && activeFilter === filter.key && (
                    <span className="ml-2 inline-block animate-spin">⏳</span>
                  )}
                </button>
              ))}
            </div>

            {/* Filtros Básicos */}
            <div className="flex flex-wrap gap-2">
              <h3
                className="text-sm font-bold text-white mb-2 w-full"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                📋 Filtros Básicos:
              </h3>

              {[
                { key: 'all', label: 'Todas', icon: '📊', color: 'blue' },
                { key: 'today', label: 'Hoy', icon: '📅', color: 'green' },
                {
                  key: 'week',
                  label: 'Esta Semana',
                  icon: '🗓️',
                  color: 'cyan',
                },
                { key: 'overdue', label: 'Vencidas', icon: '⚠️', color: 'red' },
                {
                  key: 'no-date',
                  label: 'Sin Fecha',
                  icon: '📄',
                  color: 'gray',
                },
                {
                  key: 'pending',
                  label: 'Pendientes',
                  icon: '🔄',
                  color: 'yellow',
                },
                {
                  key: 'completed',
                  label: 'Completadas',
                  icon: '✅',
                  color: 'emerald',
                },
                {
                  key: 'high-priority',
                  label: 'Alta Prioridad',
                  icon: '🔴',
                  color: 'orange',
                },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => applyFilter(filter.key)}
                  disabled={filterLoading}
                  className={`px-3 py-2 rounded-lg border transition-all duration-150 font-bold text-sm ${
                    activeFilter === filter.key
                      ? `bg-${filter.color}-500/70 border-${filter.color}-400/50 text-white shadow-md`
                      : 'bg-white/20 border-white/30 text-white/90 hover:bg-white/30 hover:border-white/40'
                  } ${filterLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  {filter.icon} {filter.label}
                  {filterLoading && activeFilter === filter.key && (
                    <span className="ml-2 inline-block animate-spin">⏳</span>
                  )}
                </button>
              ))}
            </div>

            {/* Contador de resultados */}
            <div
              className="text-sm text-white/80 font-medium"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
            >
              {searchQuery ? (
                <>
                  🔍 <strong>{filteredTasks.length}</strong> resultado(s) para "
                  {searchQuery}"
                </>
              ) : (
                <>
                  📊 Mostrando <strong>{filteredTasks.length}</strong> tarea(s){' '}
                  {activeFilter !== 'all' &&
                    `(filtro: ${
                      [
                        { key: 'urgent', label: 'Urgente' },
                        { key: 'today-important', label: 'Hoy Importante' },
                        { key: 'overdue-all', label: 'Atrasadas' },
                        { key: 'unplanned-urgent', label: 'Sin Planificar' },
                        { key: 'achievements', label: 'Logros' },
                        { key: 'today', label: 'Hoy' },
                        { key: 'week', label: 'Esta Semana' },
                        { key: 'overdue', label: 'Vencidas' },
                        { key: 'no-date', label: 'Sin Fecha' },
                        { key: 'pending', label: 'Pendientes' },
                        { key: 'completed', label: 'Completadas' },
                        { key: 'high-priority', label: 'Alta Prioridad' },
                      ].find(f => f.key === activeFilter)?.label || activeFilter
                    })`}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Creación de Tareas */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-6">
          {/* Botón Crear Tarea Personalizada */}
          <div className="mb-6">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              Crear Tarea Personalizada
            </h2>
            <button
              onClick={openCreateTaskModal}
              className="w-full bg-blue-600/70 backdrop-blur-md text-white px-6 py-4 rounded-lg font-bold border border-blue-400/70 hover:bg-blue-700/80 transition-all duration-150 shadow-lg text-lg"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              ✨ Crear Nueva Tarea
            </button>
            <p
              className="text-white/80 text-sm mt-2 text-center font-medium"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
            >
              Configura título, descripción, prioridad, fecha y estado
              personalizados
            </p>
          </div>

          <h3
            className="text-xl font-bold text-white mb-4"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
          >
            📝 Plantillas Rápidas
          </h3>

          <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
            {[
              {
                title: 'Revisar emails',
                desc: 'Chequear y responder correos importantes',
                priority: 'MEDIUM',
                icon: '📧',
              },
              {
                title: 'Llamar a un cliente',
                desc: 'Seguimiento de proyecto o consulta',
                priority: 'HIGH',
                icon: '📞',
              },
              {
                title: 'Comprar víveres',
                desc: 'Lista de compras para la semana',
                priority: 'MEDIUM',
                icon: '🛒',
              },
              {
                title: 'Revisar presupuesto',
                desc: 'Análisis mensual de finanzas',
                priority: 'MEDIUM',
                icon: '📊',
              },
              {
                title: 'Preparar presentación',
                desc: 'Slides para reunión del próximo jueves',
                priority: 'HIGH',
                icon: '📊',
              },
              {
                title: 'Renovar documentos',
                desc: 'Licencia, seguro o trámites pendientes',
                priority: 'MEDIUM',
                icon: '📝',
              },
              {
                title: 'Hacer ejercicio',
                desc: 'Rutina de ejercicios o ir al gimnasio',
                priority: 'MEDIUM',
                icon: '💪',
              },
              {
                title: 'Pagar facturas',
                desc: 'Servicios, tarjetas y pagos pendientes',
                priority: 'HIGH',
                icon: '💳',
              },
              {
                title: 'Limpiar casa',
                desc: 'Tareas de limpieza y organización',
                priority: 'LOW',
                icon: '🧹',
              },
              {
                title: 'Estudiar curso',
                desc: 'Revisar material de estudio o capacitación',
                priority: 'MEDIUM',
                icon: '📚',
              },
              {
                title: 'Backup datos',
                desc: 'Respaldar archivos importantes',
                priority: 'LOW',
                icon: '💾',
              },
              {
                title: 'Cita médica',
                desc: 'Agendar o asistir a consulta médica',
                priority: 'HIGH',
                icon: '🏥',
              },
            ].map((template, index) => (
            <div
            key={index}
            onClick={() => applyTemplate(template)}
            className="px-0 py-1.5 rounded border transition-all duration-150 cursor-pointer bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40"
              >
                <div className="text-center">
                  <div className="text-sm mb-0.5">{template.icon}</div>
                  <div
                    className="text-xs font-bold leading-tight text-white/90"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    {template.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Tareas */}
        <div className="bg-white/25 shadow-lg border border-white/30 rounded-lg">
          <div className="p-6 border-b border-white/20">
            <h2
              className="text-xl font-bold text-white"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              Mis Tareas ({filteredTasks.length} de {tasks.length})
            </h2>
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
                {renderTasksWithSeparators(filteredTasks)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <toast.ToastContainer />

      {/* Confirm Modal */}
      <confirm.ConfirmModal />

      {/* Task Modal */}
      <EditTaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        isEditing={isEditingMode}
        onConfirm={handleTaskModalConfirm}
        onCancel={closeTaskModal}
      />
    </div>
  );
}
