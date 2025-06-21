'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { useEditModal } from '@/hooks/useEditModal'
import { apiUrls } from '@/config/api'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  date: string
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
    icon?: string
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon?: string
  type: string
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(true)
  const { authenticatedFetch, isAuthenticated, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const editModal = useEditModal()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTransactions()
      loadCategories()
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated])

  const loadTransactions = async () => {
    try {
      const response = await authenticatedFetch(apiUrls.transactions.list())
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

  const loadCategories = async () => {
    try {
      const response = await authenticatedFetch(apiUrls.transactions.categoriesFinance())
      const data = await response.json()
      
      if (response.ok) {
        if (data.data && data.data.length > 0) {
          setCategories(data.data)
          console.log('Categorías cargadas:', data.data.length, 'categorías')
        } else {
          // Si no hay categorías, crear las por defecto automáticamente
          console.log('No hay categorías, creando automáticamente...')
          await createDefaultCategories()
        }
      } else {
        console.log('Error en respuesta, creando categorías automáticamente...')
        await createDefaultCategories()
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      console.log('Error de conexión, creando categorías automáticamente...')
      await createDefaultCategories()
    }
  }

  const createDefaultCategories = async () => {
    try {
      console.log('🔄 Actualizando categorías...')
      toast.info('Actualizando categorías...')
      
      const response = await authenticatedFetch(apiUrls.transactions.categoriesDefaults(), {
        method: 'POST'
      })
      
      if (response.ok) {
        console.log('✅ Categorías actualizadas exitosamente')
        // Recargar categorías después de crear las por defecto
        const reloadResponse = await authenticatedFetch(apiUrls.transactions.categoriesFinance())
        const reloadData = await reloadResponse.json()
        
        if (reloadResponse.ok && reloadData.data) {
          setCategories(reloadData.data)
          console.log(`📄 Categorías totales cargadas: ${reloadData.data.length}`)
          
          // Contar categorías por tipo para mostrar feedback
          const incomeCategories = ['Salario', 'Freelance', 'Inversiones', 'Bonos', 'Comisiones', 'Ventas', 'Alquiler', 'Dividendos', 'Regalos', 'Propinas', 'Reembolsos', 'Negocios', 'Pensión', 'Becas', 'Trabajo extra', 'Otros ingresos', 'Consultorías', 'Cashback', 'Rifas', 'Intereses', 'Seguros', 'Herencias', 'Préstamos', 'Agricultura']
          const ingresos = reloadData.data.filter(cat => incomeCategories.includes(cat.name)).length
          const gastos = reloadData.data.filter(cat => !incomeCategories.includes(cat.name)).length
          
          toast.success(`✅ Categorías actualizadas: ${ingresos} ingresos + ${gastos} gastos`)
        }
      } else {
        console.error('⚠️ Error actualizando categorías')
        const errorData = await response.json()
        console.error('Error details:', errorData)
        toast.error('Error actualizando categorías')
      }
    } catch (error) {
      console.error('Error creating default categories:', error)
      toast.error('Error de conexión')
    }
  }

  // Filtrar categorías según el tipo de transacción
  const getFilteredCategories = () => {
    // Verificar que categories sea un array válido
    if (!categories || !Array.isArray(categories)) {
      return []
    }
    
    // Categorías a excluir temporalmente
    const excludedCategories = ['Deportes', 'Internet', 'Mantenimiento']
    
    // Categorías de ingresos - EXPANDIDAS para incluir todas las nuevas opciones (24 total)
    const incomeCategories = [
      'Salario', 'Freelance', 'Inversiones', 'Bonos', 'Comisiones', 
      'Ventas', 'Alquiler', 'Dividendos', 'Regalos', 'Propinas', 
      'Reembolsos', 'Negocios', 'Pensión', 'Becas', 'Trabajo extra', 
      'Otros ingresos', 'Consultorías', 'Cashback', 'Rifas', 'Intereses',
      'Seguros', 'Herencias', 'Préstamos', 'Agricultura'
    ]
    
    let filteredCategories;
    if (type === 'INCOME') {
      filteredCategories = categories.filter(cat => incomeCategories.includes(cat.name))
    } else {
      filteredCategories = categories.filter(cat => !incomeCategories.includes(cat.name))
    }
    
    // Excluir las categorías temporalmente ocultas
    return filteredCategories.filter(cat => !excludedCategories.includes(cat.name))
  }

  // Manejar selección/deseleción de categoría (toggle)
  const handleCategoryToggle = (category: Category) => {
    if (categoryId === category.id) {
      // Si ya está seleccionada, la quitamos
      setCategoryId('')
    } else {
      // Si no está seleccionada, la seleccionamos
      setCategoryId(category.id)
    }
  }

  // Resetear categoría cuando cambie el tipo
  const handleTypeChange = (newType: string) => {
    setType(newType)
    setCategoryId('') // Limpiar selección de categoría
  }

  const createTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !description) return

    try {
      const response = await authenticatedFetch(apiUrls.transactions.create(), {
        method: 'POST',
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          description, 
          type,
          categoryId: categoryId || undefined // Incluir categoría si se seleccionó
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTransactions([data.data, ...transactions])
        setAmount('')
        setDescription('')
        setCategoryId('') // Limpiar selección de categoría
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
      const response = await authenticatedFetch(apiUrls.transactions.delete(transactionId), {
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
      const response = await authenticatedFetch(apiUrls.transactions.update(transactionId), {
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
        {/* Create Transaction Form */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>💰 Registrar Nueva Transacción</h2>
          <form onSubmit={createTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Tipo</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white"
                >
                  <option value="EXPENSE" className="bg-gray-800 text-white">💸 Gasto</option>
                  <option value="INCOME" className="bg-gray-800 text-white">💵 Ingreso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-white mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Cantidad</label>
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
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-white mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60"
                  placeholder="Ej: Supermercado, Salario, Gasolina..."
                  required
                />
              </div>
            </div>
            
            {/* Selector de Categoría */}
            <div>
              <label className="block text-sm font-bold text-white mb-3" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                Categoría {type === 'INCOME' ? 'de Ingreso' : 'de Gasto'} (opcional)
              </label>
              
              {getFilteredCategories().length > 0 ? (
                <>
                  {/* Grid de categorías */}
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
                    {getFilteredCategories().map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-0 py-1.5 rounded border transition-all duration-150 ${
                          categoryId === category.id
                            ? 'bg-white/30 border-white/60 shadow-md'
                            : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                        }`}
                        style={{
                          backgroundColor: categoryId === category.id 
                            ? `${category.color}40` 
                            : undefined,
                          borderColor: categoryId === category.id 
                            ? `${category.color}80` 
                            : undefined
                        }}
                      >
                        <div className="text-center">
                          <div className="text-sm mb-0.5">{category.icon || '📋'}</div>
                          <div 
                            className={`text-xs font-bold leading-tight ${
                              categoryId === category.id ? 'text-white' : 'text-white/90'
                            }`} 
                            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                          >
                            {category.name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Mostrar categoría seleccionada */}
                  {categoryId && (
                    <div className="mt-3 text-center">
                      <span className="text-sm font-medium text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                        Seleccionado: <strong>{getFilteredCategories().find(c => c.id === categoryId)?.name}</strong>
                      </span>
                      <p className="text-sm text-white/80 mt-1 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                        Haz clic de nuevo para quitar
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-white/10 rounded-lg border border-white/20">
                  <div className="text-3xl mb-2">🔄</div>
                  <p className="text-white text-base font-medium mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                    Configurando categorías {type === 'INCOME' ? 'de ingresos' : 'de gastos'}...
                  </p>
                  <div className="flex justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                  </div>
                  <p className="text-sm text-white/80 mt-3 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                    {type === 'INCOME' 
                      ? 'Preparando: Salario, Freelance, Bonos, Consultorías, y 20 más'
                      : 'Preparando: Alimentación, Transporte, Seguros, Gasolina, y 20 más'
                    }
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-purple-600/70 backdrop-blur-md text-white py-3 px-8 rounded-lg font-bold border border-purple-400/70 hover:bg-purple-700/80 transition-all duration-150 shadow-lg text-base"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Registrar Transacción
              </button>
            </div>
          </form>
        </div>

        {/* Financial Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/40 backdrop-blur-md shadow-lg border-2 border-green-400/60 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-green-100 mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Ingresos</h3>
            <p className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              +${totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-red-500/40 backdrop-blur-md shadow-lg border-2 border-red-400/60 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-red-100 mb-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Gastos</h3>
            <p className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              -${totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-2 backdrop-blur-md shadow-lg ${
            balance >= 0 
              ? 'bg-blue-500/40 border-blue-400/60' 
              : 'bg-orange-500/40 border-orange-400/60'
          }`}>
            <h3 className={`text-sm font-bold mb-1 ${
              balance >= 0 ? 'text-blue-100' : 'text-orange-100'
            }`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              Balance
            </h3>
            <p className={`text-xl font-bold text-white`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 rounded-lg">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              Transacciones Recientes ({transactions.length})
            </h2>
          </div>
          
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <p className="text-white font-bold text-lg" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>No tienes transacciones registradas aún.</p>
                <p className="text-white/90 text-base font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Registra tu primera transacción usando el formulario de arriba.</p>
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
                          {transaction.category?.icon || (transaction.type === 'INCOME' ? '💵' : '💸')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>{transaction.description}</h3>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-white/80 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                            {new Date(transaction.date).toLocaleDateString('es-ES')}
                          </p>
                          {transaction.category && (
                            <>
                              <span className="text-white/50">•</span>
                              <span 
                                className="text-xs px-2 py-1 rounded-full text-white/80 border" 
                                style={{ 
                                  backgroundColor: `${transaction.category.color}40`,
                                  borderColor: `${transaction.category.color}60`,
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' 
                                }}
                              >
                                {transaction.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-xl font-bold ${
                        transaction.type === 'INCOME' ? 'text-green-200' : 'text-red-200'
                      }`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                        {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                      </span>
                      <button 
                        className="text-white bg-blue-500/70 backdrop-blur-md border border-blue-400/50 hover:bg-blue-600/80 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md transform hover:scale-105"
                        onClick={() => editTransaction(transaction.id, transaction.description)}
                        title="Editar transacción"
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
                      >
                        Editar
                      </button>
                      <button 
                        className="text-white bg-red-500/70 backdrop-blur-md border border-red-400/50 hover:bg-red-600/80 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:shadow-md transform hover:scale-105"
                        onClick={() => deleteTransaction(transaction.id, transaction.description)}
                        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
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