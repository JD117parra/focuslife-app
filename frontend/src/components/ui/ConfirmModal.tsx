'use client'

import { Modal } from './Modal'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonStyle?: 'danger' | 'primary' | 'success'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonStyle = 'danger',
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  
  const getConfirmButtonStyles = () => {
    switch (confirmButtonStyle) {
      case 'danger':
        return 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
      case 'primary':
        return 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      case 'success':
        return 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
      default:
        return 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={getConfirmButtonStyles()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}