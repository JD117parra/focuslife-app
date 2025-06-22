'use client';

import { useState, useCallback } from 'react';
import EditModal from '@/components/ui/EditModal';
import EditTaskModal from '@/components/ui/EditTaskModal';

interface EditOptions {
  title?: string;
  fieldLabel?: string;
  placeholder?: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
}

interface EditState extends EditOptions {
  isOpen: boolean;
  initialValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string | null;
}

interface TaskEditState {
  isOpen: boolean;
  task: TaskData | null;
  onConfirm: (updatedTask: Partial<TaskData>) => void;
  onCancel: () => void;
}

export function useEditModal() {
  const [editState, setEditState] = useState<EditState>({
    isOpen: false,
    initialValue: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [taskEditState, setTaskEditState] = useState<TaskEditState>({
    isOpen: false,
    task: null,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const edit = useCallback(
    (
      initialValue: string,
      options: EditOptions = {}
    ): Promise<string | null> => {
      return new Promise(resolve => {
        setEditState({
          isOpen: true,
          initialValue,
          title: options.title || 'Editar elemento',
          fieldLabel: options.fieldLabel || 'Nombre',
          placeholder: options.placeholder || 'Escribe aquí...',
          icon: options.icon || '✏️',
          confirmText: options.confirmText || 'Guardar',
          cancelText: options.cancelText || 'Cancelar',
          onConfirm: (value: string) => {
            setEditState(prev => ({ ...prev, isOpen: false }));
            resolve(value);
          },
          onCancel: () => {
            setEditState(prev => ({ ...prev, isOpen: false }));
            resolve(null);
          },
        });
      });
    },
    []
  );

  // Nuevo método para editar tareas completas
  const editTaskComplete = useCallback(
    (task: TaskData): Promise<Partial<TaskData> | null> => {
      return new Promise(resolve => {
        setTaskEditState({
          isOpen: true,
          task,
          onConfirm: (updatedTask: Partial<TaskData>) => {
            setTaskEditState(prev => ({ ...prev, isOpen: false }));
            resolve(updatedTask);
          },
          onCancel: () => {
            setTaskEditState(prev => ({ ...prev, isOpen: false }));
            resolve(null);
          },
        });
      });
    },
    []
  );

  // Métodos de conveniencia para casos específicos (solo para campos simples)
  const editTask = useCallback(
    (currentTitle: string): Promise<string | null> => {
      return edit(currentTitle, {
        title: 'Editar Tarea',
        fieldLabel: 'Título de la tarea',
        placeholder: 'Ingresa el nuevo título...',
        icon: '📋',
        confirmText: 'Guardar cambios',
      });
    },
    [edit]
  );

  const editHabit = useCallback(
    (currentName: string): Promise<string | null> => {
      return edit(currentName, {
        title: 'Editar Hábito',
        fieldLabel: 'Nombre del hábito',
        placeholder: 'Ingresa el nuevo nombre...',
        icon: '🎯',
        confirmText: 'Guardar cambios',
      });
    },
    [edit]
  );

  const editTransaction = useCallback(
    (currentDescription: string): Promise<string | null> => {
      return edit(currentDescription, {
        title: 'Editar Transacción',
        fieldLabel: 'Descripción',
        placeholder: 'Ingresa la nueva descripción...',
        icon: '💰',
        confirmText: 'Guardar cambios',
      });
    },
    [edit]
  );

  const EditModalComponent = useCallback(
    () => (
      <>
        <EditModal
          isOpen={editState.isOpen}
          title={editState.title}
          fieldLabel={editState.fieldLabel}
          initialValue={editState.initialValue}
          placeholder={editState.placeholder}
          icon={editState.icon}
          confirmText={editState.confirmText}
          cancelText={editState.cancelText}
          onConfirm={editState.onConfirm}
          onCancel={editState.onCancel}
        />
        <EditTaskModal
          isOpen={taskEditState.isOpen}
          task={taskEditState.task}
          onConfirm={taskEditState.onConfirm}
          onCancel={taskEditState.onCancel}
        />
      </>
    ),
    [editState, taskEditState]
  );

  return {
    edit,
    editTask,
    editTaskComplete,
    editHabit,
    editTransaction,
    EditModal: EditModalComponent,
  };
}
