'use client';

import { useEffect, useRef, useState } from 'react';

interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string | null;
}

interface EditTaskModalProps {
  isOpen: boolean;
  task: TaskData | null;
  isEditing: boolean; // true para editar, false para crear
  onConfirm: (taskData: Partial<TaskData>) => void;
  onCancel: () => void;
}

export default function EditTaskModal({
  isOpen,
  task,
  isEditing,
  onConfirm,
  onCancel,
}: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos de la tarea cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      if (task && isEditing) {
        // Modo edición: cargar datos existentes
        setTitle(task.title || '');
        setDescription(task.description || '');
        setPriority(task.priority as 'LOW' | 'MEDIUM' | 'HIGH');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : ''); // Solo la fecha, sin hora
        setStatus(task.status || 'PENDING');
      } else if (task && !isEditing) {
        // Modo creación con plantilla: usar datos de plantilla
        setTitle(task.title || '');
        setDescription(task.description || '');
        setPriority(task.priority as 'LOW' | 'MEDIUM' | 'HIGH');
        setDueDate(''); // Limpiar fecha para que usuario la establezca
        setStatus('PENDING'); // Siempre empezar como pendiente
      } else if (!task && !isEditing) {
        // Modo creación limpia: resetear todo
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
        setStatus('PENDING');
      }
    }
  }, [task, isOpen, isEditing]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Focus en el input del título cuando se abre
      setTimeout(() => {
        titleInputRef.current?.focus();
        if (isEditing) {
          titleInputRef.current?.select();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar título siempre, fecha solo al crear
    if (title.trim() && (isEditing || dueDate.trim())) {
      const taskData: Partial<TaskData> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || null,
        status,
      };
      onConfirm(taskData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop con blur glassmorphism */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Contenedor centrado para el modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Modal con glassmorphism */}
        <div
          ref={modalRef}
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-2xl w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
              📋
            </div>
            <h3
              className="text-lg font-bold text-white"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Título */}
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-2"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
              >
                Título *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título de la tarea..."
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-600"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-2"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
              >
                Descripción
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descripción opcional..."
                rows={3}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 resize-none shadow-sm transition-all duration-200 placeholder:text-gray-600"
              />
            </div>

            {/* Primera fila: Prioridad, Fecha y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prioridad */}
              <div>
                <label
                  className="block text-sm font-medium text-white/90 mb-2"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={e =>
                    setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
                  }
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200"
                >
                  <option value="LOW">🟢 Baja</option>
                  <option value="MEDIUM">🟡 Media</option>
                  <option value="HIGH">🔴 Alta</option>
                </select>
              </div>

              {/* Fecha límite */}
              <div>
                <label
                  className="block text-sm font-medium text-white/90 mb-2"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Fecha límite{!isEditing ? ' *' : ''}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200"
                  required={!isEditing}
                />
              </div>

              {/* Estado */}
              <div>
                <label
                  className="block text-sm font-medium text-white/90 mb-2"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Estado
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200"
                >
                  <option value="PENDING">📝 Pendiente</option>
                  <option value="IN_PROGRESS">🔄 En progreso</option>
                  <option value="COMPLETED">✅ Completada</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold border border-white/30 hover:bg-white/30 transition-all duration-150 shadow-lg"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600/90 text-white hover:bg-blue-700/90 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 backdrop-blur-sm shadow-sm"
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
