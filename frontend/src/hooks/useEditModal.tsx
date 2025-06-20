'use client'

import { useState, useCallback } from 'react'
import EditModal from '@/components/ui/EditModal'

interface EditOptions {
  title?: string
  fieldLabel?: string
  placeholder?: string
  icon?: string
  confirmText?: string
  cancelText?: string
}

interface EditState extends EditOptions {
  isOpen: boolean
  initialValue: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function useEditModal() {
  const [editState, setEditState] = useState<EditState>({
    isOpen: false,
    initialValue: '',
    onConfirm: () => {},
    onCancel: () => {}
  })

  const edit = useCallback((initialValue: string, options: EditOptions = {}): Promise<string | null> => {
    return new Promise((resolve) => {
      setEditState({
        isOpen: true,
        initialValue,
        title: options.title || "Editar elemento",
        fieldLabel: options.fieldLabel || "Nombre",
        placeholder: options.placeholder || "Escribe aquí...",
        icon: options.icon || "✏️",
        confirmText: options.confirmText || "Guardar",
        cancelText: options.cancelText || "Cancelar",
        onConfirm: (value: string) => {
          setEditState(prev => ({ ...prev, isOpen: false }))
          resolve(value)
        },
        onCancel: () => {
          setEditState(prev => ({ ...prev, isOpen: false }))
          resolve(null)
        }
      })
    })
  }, [])

  // Métodos de conveniencia para casos específicos
  const editTask = useCallback((currentTitle: string): Promise<string | null> => {
    return edit(currentTitle, {
      title: "Editar Tarea",
      fieldLabel: "Título de la tarea",
      placeholder: "Ingresa el nuevo título...",
      icon: "📋",
      confirmText: "Guardar cambios"
    })
  }, [edit])

  const editHabit = useCallback((currentName: string): Promise<string | null> => {
    return edit(currentName, {
      title: "Editar Hábito",
      fieldLabel: "Nombre del hábito",
      placeholder: "Ingresa el nuevo nombre...",
      icon: "🎯",
      confirmText: "Guardar cambios"
    })
  }, [edit])

  const editTransaction = useCallback((currentDescription: string): Promise<string | null> => {
    return edit(currentDescription, {
      title: "Editar Transacción",
      fieldLabel: "Descripción",
      placeholder: "Ingresa la nueva descripción...",
      icon: "💰",
      confirmText: "Guardar cambios"
    })
  }, [edit])

  const EditModalComponent = useCallback(() => (
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
  ), [editState])

  return {
    edit,
    editTask,
    editHabit,
    editTransaction,
    EditModal: EditModalComponent
  }
}