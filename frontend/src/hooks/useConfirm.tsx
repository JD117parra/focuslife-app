'use client';

import { useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ConfirmOptions {
  title?: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'red' | 'blue' | 'green' | 'yellow';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message,
        icon: options.icon || '⚠️',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        confirmButtonColor: options.confirmButtonColor || 'red',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  // Métodos de conveniencia para casos comunes
  const confirmDelete = useCallback(
    (itemName?: string): Promise<boolean> => {
      return confirm({
        title: 'Eliminar elemento',
        message: itemName
          ? `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`
          : '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
        icon: '🗑️',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmButtonColor: 'red',
      });
    },
    [confirm]
  );

  const confirmAction = useCallback(
    (message: string, actionName: string = 'Continuar'): Promise<boolean> => {
      return confirm({
        title: 'Confirmar acción',
        message,
        icon: '⚠️',
        confirmText: actionName,
        cancelText: 'Cancelar',
        confirmButtonColor: 'blue',
      });
    },
    [confirm]
  );

  const ConfirmModalComponent = useCallback(
    () => (
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        icon={confirmState.icon}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        confirmButtonColor={confirmState.confirmButtonColor}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    ),
    [confirmState]
  );

  return {
    confirm,
    confirmDelete,
    confirmAction,
    ConfirmModal: ConfirmModalComponent,
  };
}
