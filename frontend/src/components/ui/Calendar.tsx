'use client'

import { useState, useEffect } from 'react'

interface CalendarProps {
  isOpen: boolean
  selectedDate?: string // formato YYYY-MM-DD
  onDateSelect: (date: string) => void
  onClose: () => void
  position?: { top: number; left: number }
}

export function Calendar({ isOpen, selectedDate, onDateSelect, onClose, position }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate))
    }
  }, [selectedDate])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.calendar-container')) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // Obtener primer día del mes y días en el mes
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  // Nombres de meses y días
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  // Navegar meses
  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }
  
  // Seleccionar fecha
  const selectDate = (day: number) => {
    const selectedDate = new Date(year, month, day)
    const dateString = selectedDate.toISOString().split('T')[0]
    onDateSelect(dateString)
    onClose()
  }
  
  // Ir a hoy
  const goToToday = () => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    onDateSelect(todayString)
    onClose()
  }

  // Crear array de días
  const days = []
  
  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const calendarStyle = position ? {
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
    zIndex: 1000
  } : {}

  return (
    <div 
      className="calendar-container bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80"
      style={calendarStyle}
    >
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          ←
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          →
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2"></div>
          }

          const dateString = new Date(year, month, day).toISOString().split('T')[0]
          const isSelected = selectedDate === dateString
          const isToday = today.getFullYear() === year && 
                         today.getMonth() === month && 
                         today.getDate() === day

          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              className={`
                p-2 text-sm rounded-full hover:bg-blue-100 transition-colors
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isToday && !isSelected ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                ${!isSelected && !isToday ? 'text-gray-700 hover:text-blue-600' : ''}
              `}
              type="button"
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        <button
          onClick={goToToday}
          className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          type="button"
        >
          Hoy
        </button>
        <button
          onClick={() => {
            onDateSelect('')
            onClose()
          }}
          className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          type="button"
        >
          Sin fecha
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          type="button"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}