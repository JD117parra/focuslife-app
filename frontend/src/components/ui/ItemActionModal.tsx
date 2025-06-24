'use client';

import { useEffect } from 'react';

interface ItemActionModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  type?: 'task' | 'habit' | 'transaction';
}

export function ItemActionModal({
  isOpen,
  title,
  description,
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

  if (!isOpen) return null;

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
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-md w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
              {getIcon()}
            </div>
            <h3 
              className="text-lg font-bold text-white"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              Gestionar {getTypeLabel()}
            </h3>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 
              className="font-bold text-white text-base mb-2 line-clamp-2"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
            >
              {title}
            </h4>
            {description && (
              <p 
                className="text-white/80 text-sm line-clamp-3"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                {description}
              </p>
            )}
          </div>

          <div 
            className="text-sm text-white/70 mb-6"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
          >
            ¿Qué deseas hacer con {type === 'task' ? 'esta tarea' : type === 'habit' ? 'este hábito' : 'esta transacción'}?
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={onEdit}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600/90 text-white hover:bg-blue-700/90 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 backdrop-blur-sm shadow-sm"
            >
              <span>📝</span>
              <span>Editar</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/90 text-white hover:bg-red-700/90 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 border border-red-500/30 backdrop-blur-sm shadow-sm"
            >
              <span>🗑️</span>
              <span>Eliminar</span>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold border border-white/30 hover:bg-white/30 transition-all duration-150 shadow-lg"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}