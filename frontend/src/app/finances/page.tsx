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
          <div className="bg-green-500/20 backdrop-blur-md shadow-lg border border-green-400/30 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-green-100 mb-2" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>Ingresos</h3>
            <p className="text-2xl font-bold text-green-200" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
              +${totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-red-500/20 backdrop-blur-md shadow-lg border border-red-400/30 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-red-100 mb-2" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>Gastos</h3>
            <p className="text-2xl font-bold text-red-200" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
              -${totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div className={`p-6 rounded-lg border backdrop-blur-md shadow-lg ${
            balance >= 0 
              ? 'bg-blue-500/20 border-blue-400/30' 
              : 'bg-orange-500/20 border-orange-400/30'
          }`}>
            <h3 className={`text-sm font-medium mb-2 ${
              balance >= 0 ? 'text-blue-100' : 'text-orange-100'
            }`} style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
              Balance
            </h3>
            <p className={`text-2xl font-bold ${
              balance >= 0 ? 'text-blue-200' : 'text-orange-200'
            }`} style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Create Transaction Form */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-white mb-4" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>Registrar Nueva Transacción</h2>
          <form onSubmit={createTransaction} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white"
                >
                  <option value="EXPENSE" className="bg-gray-800 text-white">💸 Gasto</option>
                  <option value="INCOME" className="bg-gray-800 text-white">💵 Ingreso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
                placeholder="Ej: Supermercado, Salario, Gasolina..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-purple-600/60 backdrop-blur-md text-white py-3 rounded-lg font-bold border border-purple-400/60 hover:bg-purple-700/70 transition-all duration-300 shadow-lg"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
            >
              Registrar Transacción
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 rounded-lg">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Transacciones Recientes ({transactions.length})
            </h2>
          </div>
          
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-white/90" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>No tienes transacciones registradas aún.</p>
                <p className="text-white/70 text-sm" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>Registra tu primera transacción usando el formulario de arriba.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border ${
                        transaction.type === 'INCOME' 
                          ? 'bg-green-500/60 border-green-400/40' 
                          : 'bg-red-500/60 border-red-400/40'
                      } shadow-lg`}>
                        <span className="text-xl">
                          {transaction.type === 'INCOME' ? '💵' : '💸'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>{transaction.description}</h3>
                        <p className="text-sm text-white/70" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                          {new Date(transaction.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-lg font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-200' : 'text-red-200'
                      }`} style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                      <button 
                        className="text-white bg-blue-500/60 backdrop-blur-sm border border-blue-400/40 hover:bg-blue-600/70 text-sm px-3 py-1.5 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105"
                        onClick={() => editTransaction(transaction.id, transaction.description)}
                        title="Editar transacción"
                        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
                      >
                        Editar
                      </button>
                      <button 
                        className="text-white bg-red-500/60 backdrop-blur-sm border border-red-400/40 hover:bg-red-600/70 text-sm px-3 py-1.5 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-105"
                        onClick={() => deleteTransaction(transaction.id, transaction.description)}
                        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
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