'use client'

import { useEffect, useRef, useState } from 'react'

interface HabitData {
  id?: string
  name: string
  description?: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  target: number
  isActive: boolean
}

interface EditHabitModalProps {
  isOpen: boolean
  habit: HabitData | null
  isEditing: boolean
  onConfirm: (habitData: Partial<HabitData>) => void
  onCancel: () => void
}

export default function EditHabitModal({
  isOpen,
  habit,
  isEditing,
  onConfirm,
  onCancel
}: EditHabitModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY')
  const [target, setTarget] = useState(1)
  const [isActive, setIsActive] = useState(true)
  
  const modalRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Cargar datos del hábito cuando se abra el modal
  useEffect(() => {
    if (habit && isOpen) {
      setName(habit.name || '')
      setDescription(habit.description || '')
      setFrequency(habit.frequency || 'DAILY')
      setTarget(habit.target || 1)
      setIsActive(habit.isActive !== false)
    } else if (isOpen && !isEditing) {
      // Resetear para crear nuevo hábito
      setName('')
      setDescription('')
      setFrequency('DAILY')
      setTarget(1)
      setIsActive(true)
    }
  }, [habit, isOpen, isEditing])

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Focus en el input del nombre cuando se abre
      setTimeout(() => {
        nameInputRef.current?.focus()
        if (isEditing) {
          nameInputRef.current?.select()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onCancel, isEditing])

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
    if (name.trim()) {
      const habitData: Partial<HabitData> = {
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        target,
        isActive
      }
      onConfirm(habitData)
    }
  }

  if (!isOpen) return null

  const getFrequencyIcon = (freq: string) => {
    switch (freq) {
      case 'DAILY': return '📅'
      case 'WEEKLY': return '📊'
      case 'MONTHLY': return '🗓️'
      default: return '📅'
    }
  }

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
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
              🎯
            </div>
            <h3 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              {isEditing ? 'Editar Hábito' : 'Crear Nuevo Hábito'}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                Nombre del Hábito *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Hacer ejercicio, Leer, Meditar..."
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-600"
                required
                maxLength={100}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                Descripción (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu hábito, metas específicas, recordatorios..."
                rows={3}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 resize-none shadow-sm transition-all duration-200 placeholder:text-gray-600"
                maxLength={500}
              />
            </div>

            {/* Primera fila: Frecuencia y Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                  Frecuencia
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200"
                >
                  <option value="DAILY">{getFrequencyIcon('DAILY')} Diario</option>
                  <option value="WEEKLY">{getFrequencyIcon('WEEKLY')} Semanal</option>
                  <option value="MONTHLY">{getFrequencyIcon('MONTHLY')} Mensual</option>
                </select>
                <p className="text-white/80 text-xs mt-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                  {frequency === 'DAILY' && 'Se realiza todos los días'}
                  {frequency === 'WEEKLY' && 'Se realiza cada semana'}
                  {frequency === 'MONTHLY' && 'Se realiza cada mes'}
                </p>
              </div>

              {/* Meta/Target */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                  Meta por Día
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200"
                />
                <p className="text-white/80 text-xs mt-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                  Número de veces a realizar por día
                </p>
              </div>
            </div>

            {/* Estado Activo */}
            <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm border border-white/40 rounded-lg p-4">
              <div>
                <label className="text-sm font-medium text-white/90" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                  Estado del Hábito
                </label>
                <p className="text-white/80 text-xs mt-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                  {isActive ? 'Hábito activo y visible en el dashboard' : 'Hábito pausado (no aparece en tracking diario)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
                  isActive 
                    ? 'bg-green-500/80 border border-green-400/50' 
                    : 'bg-white/30 border border-white/50'
                } backdrop-blur-sm shadow-sm`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
                {isEditing ? 'Guardar Cambios' : 'Crear Hábito'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}