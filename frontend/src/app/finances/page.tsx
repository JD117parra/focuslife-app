'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'
import { ConfirmModal, Modal } from '@/components/ui'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  date: string
  categoryId?: string
}

// Categorías predeterminadas
const EXPENSE_CATEGORIES = [
  { id: 'food', name: '🍽️ Alimentos', emoji: '🍽️' },
  { id: 'gas', name: '⛽ Gasolina', emoji: '⛽' },
  { id: 'utilities', name: '🏠 Servicios (agua, luz, gas)', emoji: '🏠' },
  { id: 'rent', name: '🏘️ Arriendo/Hipoteca', emoji: '🏘️' },
  { id: 'transport', name: '🚌 Transporte', emoji: '🚌' },
  { id: 'health', name: '🏥 Salud/Medicina', emoji: '🏥' },
  { id: 'education', name: '📚 Educación', emoji: '📚' },
  { id: 'entertainment', name: '🎬 Entretenimiento', emoji: '🎬' },
  { id: 'shopping', name: '🛍️ Compras', emoji: '🛍️' },
  { id: 'other_expense', name: '📦 Otros gastos', emoji: '📦' }
]

const INCOME_CATEGORIES = [
  { id: 'salary', name: '💼 Salario', emoji: '💼' },
  { id: 'freelance', name: '💻 Freelance', emoji: '💻' },
  { id: 'business', name: '🏢 Negocio', emoji: '🏢' },
  { id: 'investments', name: '📈 Inversiones', emoji: '📈' },
  { id: 'bonus', name: '🎁 Bonificación', emoji: '🎁' },
  { id: 'rental', name: '🏠 Renta de propiedad', emoji: '🏠' },
  { id: 'side_hustle', name: '💡 Trabajo extra', emoji: '💡' },
  { id: 'gifts', name: '🎉 Regalos/Dinero recibido', emoji: '🎉' },
  { id: 'other_income', name: '💰 Otros ingresos', emoji: '💰' }
]

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [category, setCategory] = useState('food') // Categoría inicial para gastos
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // Fecha de hoy por defecto
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  // Estados para edición
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState('EXPENSE')
  const [editCategory, setEditCategory] = useState('food')
  const [editDate, setEditDate] = useState('')
  
  const { success, error, ToastContainer } = useToast()

  useEffect(() => {
    loadTransactions()
  }, [])

  // Función para manejar cambio de tipo y actualizar categoría
  const handleTypeChange = (newType: string) => {
    setType(newType)
    // Cambiar a la primera categoría del tipo seleccionado
    if (newType === 'EXPENSE') {
      setCategory('food')
    } else {
      setCategory('salary')
    }
  }

  // Obtener categorías basadas en el tipo actual
  const getCurrentCategories = () => {
    return type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  }

  // Obtener información de categoría por ID
  const getCategoryInfo = (categoryId: string, transactionType: string) => {
    const categories = transactionType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    const category = categories.find(cat => cat.id === categoryId)
    return category || { name: 'Sin categoría', emoji: '💼' }
  }

  const loadTransactions = async () => {
  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      console.error('No auth token found')
      setTransactions([])
      return
    }

    const response = await fetch('http://localhost:5000/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setTransactions(data.data)
    } else {
      console.error('Error loading transactions:', data.message)
    }
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    setLoading(false)
  }
}

  const createTransaction = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!amount) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      error('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        amount: parseFloat(amount), 
        description, 
        type,
        category,
        date: date // Enviar la fecha seleccionada
      }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setTransactions([data.data, ...transactions])
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0]) // Resetear a hoy
      // Resetear categoría a la primera del tipo actual
      setCategory(type === 'EXPENSE' ? 'food' : 'salary')
      success('¡Transacción registrada exitosamente! 💰')
    } else {
      const data = await response.json()
      error('Error: ' + data.message)
    }
  } catch (catchError) {
    error('Error de conexión con el servidor')
  }
}

const handleDeleteClick = (transactionId: string) => {
  setTransactionToDelete(transactionId)
  setShowConfirmModal(true)
}

const confirmDelete = async () => {
  if (!transactionToDelete) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      error('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch(`http://localhost:5000/api/transactions/${transactionToDelete}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      // Remover la transacción de la lista
      setTransactions(transactions.filter(t => t.id !== transactionToDelete))
      success('¡Transacción eliminada exitosamente! ✓')
    } else {
      const data = await response.json()
      error('Error: ' + data.message)
    }
  } catch (catchError) {
    error('Error de conexión con el servidor')
  } finally {
    setShowConfirmModal(false)
    setTransactionToDelete(null)
  }
}

const cancelDelete = () => {
  setShowConfirmModal(false)
  setTransactionToDelete(null)
}

// Funciones para edición
const handleEditClick = (transaction: Transaction) => {
  setEditingTransaction(transaction)
  setEditAmount(transaction.amount.toString())
  setEditDescription(transaction.description || '')
  setEditType(transaction.type)
  // Obtener la categoría desde el transaction o inferirla
  const categoryInfo = getCategoryInfo(transaction.category || 'other', transaction.type)
  setEditCategory(transaction.category || (transaction.type === 'EXPENSE' ? 'food' : 'salary'))
  setEditDate(new Date(transaction.date).toISOString().split('T')[0])
  setShowEditModal(true)
}

const cancelEdit = () => {
  setShowEditModal(false)
  setEditingTransaction(null)
  setEditAmount('')
  setEditDescription('')
  setEditType('EXPENSE')
  setEditCategory('food')
  setEditDate('')
}

const handleEditTypeChange = (newType: string) => {
  setEditType(newType)
  // Cambiar a la primera categoría del tipo seleccionado
  if (newType === 'EXPENSE') {
    setEditCategory('food')
  } else {
    setEditCategory('salary')
  }
}

const updateTransaction = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!editAmount || !editingTransaction) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      error('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch(`http://localhost:5000/api/transactions/${editingTransaction.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        amount: parseFloat(editAmount), 
        description: editDescription, 
        type: editType,
        category: editCategory,
        date: editDate
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      // Actualizar la transacción en la lista
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? data.data : t
      ))
      success('¡Transacción actualizada exitosamente! ✓')
      cancelEdit()
    } else {
      const data = await response.json()
      error('Error: ' + data.message)
    }
  } catch (catchError) {
    error('Error de conexión con el servidor')
  }
}

  // Calcular totales
  const totalIncome = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
  
  const totalExpenses = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
  
  const balance = totalIncome - totalExpenses

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">💰</div>
          <p className="text-gray-600 mt-2">Cargando finanzas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">💰 Finanzas Personales</h1>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Financial Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">Ingresos</h3>
            <p className="text-2xl font-bold text-green-600">
              +${totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">Gastos</h3>
            <p className="text-2xl font-bold text-red-600">
              -${totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div className={`p-6 rounded-lg border ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <h3 className={`text-sm font-medium mb-2 ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              Balance
            </h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Create Transaction Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nueva Transacción</h2>
          <form onSubmit={createTransaction} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="EXPENSE">💸 Gasto</option>
                  <option value="INCOME">💵 Ingreso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {getCurrentCategories().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDate(new Date().toISOString().split('T')[0])}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const yesterday = new Date()
                        yesterday.setDate(yesterday.getDate() - 1)
                        setDate(yesterday.toISOString().split('T')[0])
                      }}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Ayer
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Registrar Transacción
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Transacciones Recientes ({transactions.length})
            </h2>
          </div>
          
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-gray-600">No tienes transacciones registradas aún.</p>
                <p className="text-gray-500 text-sm">Registra tu primera transacción usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => {
                  const categoryInfo = getCategoryInfo(transaction.category || 'other', transaction.type)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className="text-xl">
                          {categoryInfo.emoji}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {transaction.description || categoryInfo.name.split(' ').slice(1).join(' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {categoryInfo.name} • {(() => {
                            const transactionDate = new Date(transaction.date)
                            const today = new Date()
                            const yesterday = new Date()
                            yesterday.setDate(today.getDate() - 1)
                            
                            const isToday = transactionDate.toDateString() === today.toDateString()
                            const isYesterday = transactionDate.toDateString() === yesterday.toDateString()
                            
                            if (isToday) {
                              return 'Hoy'
                            } else if (isYesterday) {
                              return 'Ayer'
                            } else {
                              return transactionDate.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-lg font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => handleEditClick(transaction)}> Editar</button>
                      <button className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => handleDeleteClick(transaction.id)}> Eliminar</button>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Transaction Modal */}
      <Modal isOpen={showEditModal} onClose={cancelEdit}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar Transacción</h2>
          <form onSubmit={updateTransaction} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editType}
                  onChange={(e) => handleEditTypeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="EXPENSE">💸 Gasto</option>
                  <option value="INCOME">💵 Ingreso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {(editType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditDate(new Date().toISOString().split('T')[0])}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const yesterday = new Date()
                        yesterday.setDate(yesterday.getDate() - 1)
                        setEditDate(yesterday.toISOString().split('T')[0])
                      }}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Ayer
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 justify-end pt-4">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Actualizar Transacción
              </button>
            </div>
          </form>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Eliminar Transacción"
        message="¿Estás seguro de que deseas eliminar esta transacción?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonStyle="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}