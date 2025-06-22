'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/hooks/useConfirm'
import { EditTransactionModal } from '@/components/ui'
import { apiUrls } from '@/config/api'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  date: string
  categoryId?: string
  category?: {
    id?: string
    name: string
    color?: string
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
  const [loading, setLoading] = useState(true)
  
  // Estado para el modal de transacciones
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditingMode, setIsEditingMode] = useState(false)
  
  const { authenticatedFetch, isAuthenticated, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()

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
        } else {
          await createDefaultCategories()
        }
      } else {
        await createDefaultCategories()
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      await createDefaultCategories()
    }
  }

  const createDefaultCategories = async () => {
    try {
      toast.info('Configurando categorías...')
      
      const response = await authenticatedFetch(apiUrls.transactions.categoriesDefaults(), {
        method: 'POST'
      })
      
      if (response.ok) {
        const reloadResponse = await authenticatedFetch(apiUrls.transactions.categoriesFinance())
        const reloadData = await reloadResponse.json()
        
        if (reloadResponse.ok && reloadData.data) {
          setCategories(reloadData.data)
          
          const incomeCategories = ['Salario', 'Freelance', 'Inversiones', 'Bonos', 'Comisiones', 'Ventas', 'Alquiler', 'Dividendos', 'Regalos', 'Propinas', 'Reembolsos', 'Negocios', 'Pensión', 'Becas', 'Trabajo extra', 'Otros ingresos', 'Consultorías', 'Cashback', 'Rifas', 'Intereses', 'Seguros', 'Herencias', 'Préstamos', 'Agricultura']
          const ingresos = reloadData.data.filter(cat => incomeCategories.includes(cat.name)).length
          const gastos = reloadData.data.filter(cat => !incomeCategories.includes(cat.name)).length
          
          toast.success(`✅ Categorías configuradas: ${ingresos} ingresos + ${gastos} gastos`)
        }
      } else {
        toast.error('Error configurando categorías')
      }
    } catch (error) {
      console.error('Error creating default categories:', error)
      toast.error('Error de conexión')
    }
  }

  // Funciones para manejar el modal de transacciones
  const openCreateTransactionModal = () => {
    setEditingTransaction(null)
    setIsEditingMode(false)
    setIsTransactionModalOpen(true)
  }

  const openEditTransactionModal = (transaction: Transaction) => {
    // Convertir la transacción para incluir category como string
    const transactionForEdit = {
      ...transaction,
      category: transaction.category?.name || ''
    }
    setEditingTransaction(transactionForEdit as any)
    setIsEditingMode(true)
    setIsTransactionModalOpen(true)
  }

  const openTemplateTransactionModal = (template: any) => {
    const templateTransaction = {
      description: template.description,
      type: template.type,
      category: template.category
    }
    setEditingTransaction(templateTransaction as any)
    setIsEditingMode(false)
    setIsTransactionModalOpen(true)
  }

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false)
    setEditingTransaction(null)
    setIsEditingMode(false)
  }

  const handleTransactionModalConfirm = async (transactionData: any) => {
    if (isEditingMode && editingTransaction?.id) {
      await updateTransactionComplete(editingTransaction.id, transactionData)
    } else {
      await createTransactionComplete(transactionData)
    }
    closeTransactionModal()
  }

  const createTransactionComplete = async (transactionData: any) => {
    try {
      // Convertir category a categoryId si es necesario (por compatibilidad)
      const requestData = {
        ...transactionData,
        categoryId: undefined // Enviamos sin categoría por ahora
      }
      delete requestData.category // Eliminamos el campo category

      const response = await authenticatedFetch(apiUrls.transactions.create(), {
        method: 'POST',
        body: JSON.stringify(requestData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Agregar la categoría manual al objeto para mostrar en la UI
        const transactionWithCategory = {
          ...data.data,
          category: transactionData.category ? { name: transactionData.category } : null
        }
        setTransactions([transactionWithCategory, ...transactions])
        toast.success('¡Transacción registrada exitosamente!')
      } else {
        toast.error('Error: ' + data.message)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    }
  }

  const updateTransactionComplete = async (transactionId: string, transactionData: any) => {
    try {
      // Convertir category a categoryId si es necesario (por compatibilidad)
      const requestData = {
        ...transactionData,
        categoryId: undefined // Enviamos sin categoría por ahora
      }
      delete requestData.category // Eliminamos el campo category

      const response = await authenticatedFetch(apiUrls.transactions.update(transactionId), {
        method: 'PUT',
        body: JSON.stringify(requestData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Actualizar la transacción con la categoría manual
        const updatedTransaction = {
          ...data.data,
          category: transactionData.category ? { name: transactionData.category } : null
        }
        setTransactions(transactions.map((transaction: Transaction) => 
          transaction.id === transactionId 
            ? { ...transaction, ...updatedTransaction }
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

  const editTransaction = (transaction: Transaction) => {
    openEditTransactionModal(transaction)
  }

  // Función para usar plantilla
  const useTemplate = (template: {description: string, type: 'INCOME' | 'EXPENSE', category: string}) => {
    openTemplateTransactionModal(template)
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

        {/* Sección de Creación de Transacciones */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-6">
          {/* Botón Crear Transacción Personalizada */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>Registrar Transacción Personalizada</h2>
            <button
              onClick={openCreateTransactionModal}
              className="w-full bg-purple-600/70 backdrop-blur-md text-white px-6 py-4 rounded-lg font-bold border border-purple-400/70 hover:bg-purple-700/80 transition-all duration-150 shadow-lg text-lg"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              💰 Nueva Transacción
            </button>
            <p className="text-white/80 text-sm mt-2 text-center font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
              Configura tipo, monto, descripción y categoría personalizados
            </p>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>💸 Plantillas de Gastos</h3>
          
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1 mb-6">
            {[
              // Gastos comunes
              { description: 'Supermercado', type: 'EXPENSE', icon: '🛒', category: 'Alimentación' },
              { description: 'Gasolina', type: 'EXPENSE', icon: '⛽', category: 'Transporte' },
              { description: 'Almuerzo', type: 'EXPENSE', icon: '🍽️', category: 'Alimentación' },
              { description: 'Farmacia', type: 'EXPENSE', icon: '💊', category: 'Salud' },
              { description: 'Transporte público', type: 'EXPENSE', icon: '🚌', category: 'Transporte' },
              { description: 'Café', type: 'EXPENSE', icon: '☕', category: 'Alimentación' },
              { description: 'Restaurante', type: 'EXPENSE', icon: '🍴', category: 'Alimentación' },
              { description: 'Cine', type: 'EXPENSE', icon: '🎥', category: 'Entretenimiento' },
              { description: 'Gimnasio', type: 'EXPENSE', icon: '🏋️', category: 'Salud' },
              { description: 'Ropa', type: 'EXPENSE', icon: '👕', category: 'Vestimenta' },
              { description: 'Internet', type: 'EXPENSE', icon: '📶', category: 'Servicios' },
              { description: 'Electricidad', type: 'EXPENSE', icon: '⚡', category: 'Servicios' },
              { description: 'Agua', type: 'EXPENSE', icon: '💧', category: 'Servicios' },
              { description: 'Teléfono', type: 'EXPENSE', icon: '📱', category: 'Servicios' },
              { description: 'Taxi/Uber', type: 'EXPENSE', icon: '🚕', category: 'Transporte' },
              { description: 'Libros', type: 'EXPENSE', icon: '📚', category: 'Educación' },
              { description: 'Streaming', type: 'EXPENSE', icon: '📺', category: 'Entretenimiento' },
              { description: 'Seguros', type: 'EXPENSE', icon: '🛡️', category: 'Seguros' }
            ].map((template, index) => (
              <div 
                key={index}
                onClick={() => useTemplate(template)}
                className="px-0 py-1.5 rounded border transition-all duration-150 cursor-pointer bg-white/10 border-red-400/40 hover:bg-white/20 hover:border-red-400/60"
              >
                <div className="text-center">
                  <div className="text-sm mb-0.5">{template.icon}</div>
                  <div className="text-xs font-bold leading-tight text-white/90" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                    {template.description}
                  </div>
                  <div className="text-xs font-bold text-red-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                    {template.category}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>💵 Plantillas de Ingresos</h3>
          
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
            {[
              // Ingresos comunes
              { description: 'Salario', type: 'INCOME', icon: '💼', category: 'Trabajo' },
              { description: 'Freelance', type: 'INCOME', icon: '💻', category: 'Trabajo' },
              { description: 'Bono', type: 'INCOME', icon: '🎁', category: 'Trabajo' },
              { description: 'Venta', type: 'INCOME', icon: '🏪', category: 'Negocios' },
              { description: 'Propina', type: 'INCOME', icon: '💵', category: 'Trabajo' },
              { description: 'Reembolso', type: 'INCOME', icon: '💳', category: 'Diversos' },
              { description: 'Consultoría', type: 'INCOME', icon: '📈', category: 'Trabajo' },
              { description: 'Inversión', type: 'INCOME', icon: '💰', category: 'Inversiones' },
              { description: 'Alquiler', type: 'INCOME', icon: '🏠', category: 'Propiedades' },
              { description: 'Comisión', type: 'INCOME', icon: '💹', category: 'Trabajo' },
              { description: 'Regalo', type: 'INCOME', icon: '🎁', category: 'Diversos' },
              { description: 'Trabajo extra', type: 'INCOME', icon: '⏰', category: 'Trabajo' }
            ].map((template, index) => (
              <div 
                key={index}
                onClick={() => useTemplate(template)}
                className="px-0 py-1.5 rounded border transition-all duration-150 cursor-pointer bg-white/10 border-green-400/40 hover:bg-white/20 hover:border-green-400/60"
              >
                <div className="text-center">
                  <div className="text-sm mb-0.5">{template.icon}</div>
                  <div className="text-xs font-bold leading-tight text-white/90" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                    {template.description}
                  </div>
                  <div className="text-xs font-bold text-green-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                    {template.category}
                  </div>
                </div>
              </div>
            ))}
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
                <p className="text-white/90 text-base font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>Registra tu primera transacción usando el botón de arriba.</p>
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
                        onClick={() => editTransaction(transaction)}
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
      
      {/* Transaction Modal */}
      <EditTransactionModal
        isOpen={isTransactionModalOpen}
        transaction={editingTransaction}
        isEditing={isEditingMode}
        onConfirm={handleTransactionModalConfirm}
        onCancel={closeTransactionModal}
      />
    </div>
  )
}