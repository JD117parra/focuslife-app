'use client';

import { useEffect } from 'react';

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

interface ItemActionModalProps {
  isOpen: boolean;
  task: Task | null;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  type?: 'task' | 'habit' | 'transaction';
}

export function ItemActionModal({
  isOpen,
  task,
  onEdit,
  onDelete,
  onClose,
  type = 'task'
}: ItemActionModalProps) {
  // Cerrar modal con ESC y prevenir scroll del body
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  // Funciones auxiliares para formateo
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return { text: 'Hoy', isToday: true, isOverdue: false };
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return { text: 'Mañana', isToday: false, isOverdue: false };
    } else if (dateOnly < todayOnly) {
      return { text: date.toLocaleDateString('es-ES'), isToday: false, isOverdue: true };
    } else {
      return { text: date.toLocaleDateString('es-ES'), isToday: false, isOverdue: false };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴' };
      case 'MEDIUM':
        return { label: 'Media', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🟡' };
      case 'LOW':
        return { label: 'Baja', color: 'bg-green-100 text-green-700 border-green-300', icon: '🟢' };
      default:
        return { label: 'Sin prioridad', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '⚪' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completada', color: 'bg-green-100 text-green-700 border-green-300', icon: '✅' };
      case 'IN_PROGRESS':
        return { label: 'En progreso', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🔄' };
      case 'PENDING':
        return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳' };
      default:
        return { label: 'Sin estado', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '❓' };
    }
  };

  const dateInfo = formatDate(task.dueDate);
  const priorityInfo = getPriorityInfo(task.priority);
  const statusInfo = getStatusInfo(task.status);

  const getIcon = () => {
    switch (type) {
      case 'task': return '📋';
      case 'habit': return '🎯';
      case 'transaction': return '💰';
      default: return '📝';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'task': return 'tarea';
      case 'habit': return 'hábito';
      case 'transaction': return 'transacción';
      default: return 'elemento';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop con blur glassmorphism */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenedor centrado para el modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Modal con glassmorphism */}
        <div 
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-lg w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
                {getIcon()}
              </div>
              <h3 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                Detalles de la {getTypeLabel()}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl leading-none p-1"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              ×
            </button>
          </div>

          {/* Título y descripción */}
          <div className="mb-6">
            <h4 className="font-bold text-white text-lg mb-3 leading-snug" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-white/90 text-sm leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {task.description}
              </p>
            )}
          </div>

          {/* Detalles específicos según el tipo */}
          <div className="space-y-4 mb-6">
            {type === 'transaction' ? (
              /* Contenido específico para transacciones */
              <>
                {/* Tipo y Monto */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                      Tipo
                    </label>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
                      task.status === 'INCOME'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      <span>{task.status === 'INCOME' ? '💵' : '💸'}</span>
                      <span>{task.status === 'INCOME' ? 'Ingreso' : 'Gasto'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                      Monto
                    </label>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
                      task.status === 'INCOME'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      <span>{task.status === 'INCOME' ? '+' : '-'}</span>
                      <span>${parseFloat(task.priority).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Fecha de transacción */}
                <div>
                  <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                    Fecha de transacción
                  </label>
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                    <span>📅</span>
                    <span>{new Date(task.dueDate!).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </>
            ) : (
              /* Contenido para tareas/hábitos */
              <>
                {/* Estado y Prioridad */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                      Estado
                    </label>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${statusInfo.color}`}>
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                      Prioridad
                    </label>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${priorityInfo.color}`}>
                      <span>{priorityInfo.icon}</span>
                      <span>{priorityInfo.label}</span>
                    </div>
                  </div>
                </div>

                {/* Fecha límite */}
                <div>
                  <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                    Fecha límite
                  </label>
                  {dateInfo ? (
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                      dateInfo.isOverdue && task.status !== 'COMPLETED'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : dateInfo.isToday
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      <span>📅</span>
                      <span>{dateInfo.text}</span>
                      {dateInfo.isOverdue && task.status !== 'COMPLETED' && (
                        <span className="text-red-600">⚠️</span>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border border-gray-300">
                      <span>📅</span>
                      <span>Sin fecha límite</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Categoría */}
            {task.category && (
              <div>
                <label className="text-xs font-semibold text-white/90 uppercase tracking-wide mb-2 block" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                  Categoría
                </label>
                <div 
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border"
                  style={{ 
                    backgroundColor: `${task.category.color}20`,
                    color: task.category.color,
                    borderColor: `${task.category.color}50`
                  }}
                >
                  <span>🏷️</span>
                  <span>{task.category.name}</span>
                </div>
              </div>
            )}

            {/* Fechas de creación y actualización */}
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-white/30">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-white/90 uppercase tracking-wide block mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                    Creada
                  </span>
                  <span className="text-white/80" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                    {new Date(task.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-white/90 uppercase tracking-wide block mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                    Actualizada
                  </span>
                  <span className="text-white/80" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                    {new Date(task.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={onEdit}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <span>📝</span>
              <span>Editar</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <span>🗑️</span>
              <span>Eliminar</span>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-all duration-150 shadow-lg"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}