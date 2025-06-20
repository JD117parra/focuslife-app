'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useEditModal } from '@/hooks/useEditModal'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  date: string
  categoryId?: string
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [loading, setLoading] = useState(true)
  const { authenticatedFetch, isAuthenticated, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const editModal = useEditModal()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTransactions()
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  const loadTransactions = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:5000/api/transactions')
      const data = await response.json()
      
      if (response.ok) {
        setTransactions(data.data)
      } else {
        toast.error('Error cargando transacciones: ' + data.message)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !description) return

    try {
      const response = await authenticatedFetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          description, 
          type 
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTransactions([data.data, ...transactions])
        setAmount('')
        setDescription('')
        toast.success('¡Transacción registrada exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const deleteTransaction = async (transactionId: string, transactionDescription: string) => {
    const confirmed = await confirm.confirmDelete(transactionDescription)
    if (!confirmed) {
      return
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setTransactions(transactions.filter(t => t.id !== transactionId))
        toast.delete('¡Transacción eliminada exitosamente!')
      } else {
        const data = await response.json()
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const editTransaction = async (transactionId: string, currentDescription: string) => {
    const newDescription = await editModal.editTransaction(currentDescription)
    if (!newDescription) {
      return // Usuario canceló
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify({ description: newDescription }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTransactions(transactions.map((transaction: Transaction) => 
          transaction.id === transactionId 
            ? { ...transaction, description: newDescription }
            : transaction
        ))
        toast.success('¡Transacción editada exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">💰</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">💰</div>
          <p className="text-white mt-2">Cargando finanzas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-100 hover:text-white">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">💰 Finanzas Personales</h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Financial Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50/80 backdrop-blur-sm shadow-xl ring-1 ring-green-100/20 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">Ingresos</h3>
            <p className="text-2xl font-bold text-green-600">
              +${totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-red-50/80 backdrop-blur-sm shadow-xl ring-1 ring-red-100/20 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">Gastos</h3>
            <p className="text-2xl font-bold text-red-600">
              -${totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div className={`p-6 rounded-lg border backdrop-blur-sm shadow-xl ring-1 ${balance >= 0 ? 'bg-blue-50/80 border-blue-200 ring-blue-100/20' : 'bg-orange-50/80 border-orange-200 ring-orange-100/20'}`}>
            <h3 className={`text-sm font-medium mb-2 ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              Balance
            </h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Create Transaction Form */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nueva Transacción</h2>
          <form onSubmit={createTransaction} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="EXPENSE">💸 Gasto</option>
                  <option value="INCOME">💵 Ingreso</option>
                </select>
              </div>
              
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ej: Supermercado, Salario, Gasolina..."
                required
              />
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
        <div className="bg-white/90 backdrop-blur-md shadow-2xl ring-1 ring-white/10 rounded-lg">
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
                {transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className="text-xl">
                          {transaction.type === 'INCOME' ? '💵' : '💸'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-lg font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                      <button 
                        className="text-blue-600 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-blue-600 hover:shadow-md transform hover:scale-105"
                        onClick={() => editTransaction(transaction.id, transaction.description)}
                        title="Editar transacción"
                      >
                        Editar
                      </button>
                      <button 
                        className="text-red-600 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-red-600 hover:shadow-md transform hover:scale-105"
                        onClick={() => deleteTransaction(transaction.id, transaction.description)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <toast.ToastContainer />
      
      {/* Confirm Modal */}
      <confirm.ConfirmModal />
      
      {/* Edit Modal */}
      <editModal.EditModal />
    </div>
  )
}