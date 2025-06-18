'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

  useEffect(() => {
    loadTransactions()
  }, [])

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
  
  if (!amount || !description) return

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      alert('No estás autenticado. Por favor inicia sesión.')
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
        type 
      }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setTransactions([data.data, ...transactions])
      setAmount('')
      setDescription('')
      alert('Transacción registrada exitosamente!')
    } else {
      alert('Error: ' + data.message)
    }
  } catch (error) {
    alert('Error de conexión con el servidor')
  }
}

const deleteTransaction = async (transactionId: string) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
    return
  }

  try {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      alert('No estás autenticado. Por favor inicia sesión.')
      return
    }

    const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      // Remover la transacción de la lista
      setTransactions(transactions.filter(t => t.id !== transactionId))
      alert('Transacción eliminada exitosamente!')
    } else {
      const data = await response.json()
      alert('Error: ' + data.message)
    }
  } catch (error) {
    alert('Error de conexión con el servidor')
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
                      <button className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => deleteTransaction(transaction.id)}> Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}