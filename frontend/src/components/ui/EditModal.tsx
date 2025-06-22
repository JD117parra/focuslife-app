'use client'

import { useEffect, useRef, useState } from 'react'

interface EditModalProps {
  isOpen: boolean
  title?: string
  fieldLabel?: string
  initialValue: string
  placeholder?: string
  icon?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export default function EditModal({
  isOpen,
  title = "Editar elemento",
  fieldLabel = "Nombre",
  initialValue,
  placeholder = "Escribe aquí...",
  icon = "✏️",
  confirmText = "Guardar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel
}: EditModalProps) {
  const [value, setValue] = useState(initialValue)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Actualizar valor cuando cambia initialValue
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Focus en el input cuando se abre
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select() // Seleccionar todo el texto
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onCancel])

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim()) {
        onConfirm(value.trim())
      }
    }
  }

  if (!isOpen) return null

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
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-lg w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
              {icon}
            </div>
            <h3 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              {title}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {fieldLabel}
              </label>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-600"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/30">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold border border-white/30 hover:bg-white/30 transition-all duration-150 shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                {cancelText}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600/90 text-white hover:bg-blue-700/90 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 backdrop-blur-sm shadow-sm"
              >
                {confirmText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}