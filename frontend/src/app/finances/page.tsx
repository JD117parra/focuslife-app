'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { EditTransactionModal, ItemActionModal, TemplateModal } from '@/components/ui';
import { apiUrls } from '@/config/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// 💸 PLANTILLAS DE GASTOS - MOVIDAS A TemplateModal.tsx
// Se mantienen por compatibilidad hasta confirmar funcionamiento
/*
const EXPENSE_TEMPLATES = [
  {
    description: 'Supermercado',
    type: 'EXPENSE' as const,
    icon: '🛒',
    category: 'Alimentación',
  },
  {
    description: 'Gasolina',
    type: 'EXPENSE' as const,
    icon: '⛽',
    category: 'Transporte',
  },
  {
    description: 'Almuerzo',
    type: 'EXPENSE' as const,
    icon: '🍽️',
    category: 'Alimentación',
  },
  {
    description: 'Farmacia',
    type: 'EXPENSE' as const,
    icon: '💊',
    category: 'Salud',
  },
  {
    description: 'Transporte público',
    type: 'EXPENSE' as const,
    icon: '🚌',
    category: 'Transporte',
  },
  {
    description: 'Café',
    type: 'EXPENSE' as const,
    icon: '☕',
    category: 'Alimentación',
  },
  {
    description: 'Restaurante',
    type: 'EXPENSE' as const,
    icon: '🍴',
    category: 'Alimentación',
  },
  {
    description: 'Cine',
    type: 'EXPENSE' as const,
    icon: '🎥',
    category: 'Entretenimiento',
  },
  {
    description: 'Gimnasio',
    type: 'EXPENSE' as const,
    icon: '🏋️',
    category: 'Salud',
  },
  {
    description: 'Ropa',
    type: 'EXPENSE' as const,
    icon: '👕',
    category: 'Vestimenta',
  },
  {
    description: 'Internet',
    type: 'EXPENSE' as const,
    icon: '📶',
    category: 'Servicios',
  },
  {
    description: 'Electricidad',
    type: 'EXPENSE' as const,
    icon: '⚡',
    category: 'Servicios',
  },
  {
    description: 'Agua',
    type: 'EXPENSE' as const,
    icon: '💧',
    category: 'Servicios',
  },
  {
    description: 'Teléfono',
    type: 'EXPENSE' as const,
    icon: '📱',
    category: 'Servicios',
  },
  {
    description: 'Taxi/Uber',
    type: 'EXPENSE' as const,
    icon: '🚕',
    category: 'Transporte',
  },
  {
    description: 'Libros',
    type: 'EXPENSE' as const,
    icon: '📚',
    category: 'Educación',
  },
  {
    description: 'Streaming',
    type: 'EXPENSE' as const,
    icon: '📺',
    category: 'Entretenimiento',
  },
  {
    description: 'Seguros',
    type: 'EXPENSE' as const,
    icon: '🛡️',
    category: 'Seguros',
  },
] as const;
*/

const INCOME_TEMPLATES = [
  {
    description: 'Salario',
    type: 'INCOME' as const,
    icon: '💼',
    category: 'Trabajo',
  },
  {
    description: 'Freelance',
    type: 'INCOME' as const,
    icon: '💻',
    category: 'Trabajo',
  },
  {
    description: 'Bono',
    type: 'INCOME' as const,
    icon: '🎁',
    category: 'Trabajo',
  },
  {
    description: 'Venta',
    type: 'INCOME' as const,
    icon: '🏪',
    category: 'Negocios',
  },
  {
    description: 'Propina',
    type: 'INCOME' as const,
    icon: '💵',
    category: 'Trabajo',
  },
  {
    description: 'Reembolso',
    type: 'INCOME' as const,
    icon: '💳',
    category: 'Diversos',
  },
  {
    description: 'Consultoría',
    type: 'INCOME' as const,
    icon: '📈',
    category: 'Trabajo',
  },
  {
    description: 'Inversión',
    type: 'INCOME' as const,
    icon: '💰',
    category: 'Inversiones',
  },
  {
    description: 'Alquiler',
    type: 'INCOME' as const,
    icon: '🏠',
    category: 'Propiedades',
  },
  {
    description: 'Comisión',
    type: 'INCOME' as const,
    icon: '💹',
    category: 'Trabajo',
  },
  {
    description: 'Regalo',
    type: 'INCOME' as const,
    icon: '🎁',
    category: 'Diversos',
  },
  {
    description: 'Trabajo extra',
    type: 'INCOME' as const,
    icon: '⏰',
    category: 'Trabajo',
  },
] as const;

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  categoryId?: string;
  category?: {
    id?: string;
    name: string;
    color?: string;
    icon?: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: string;
}

interface TransactionData {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category?: string;
}

interface TemplateData {
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  icon?: string;
}

interface TransactionWithCategory extends Omit<Transaction, 'category'> {
  category?: string | { name: string };
}

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el filtro de transacciones
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  // Control para evitar duplicación de notificación de bienvenida
  const welcomeShownRef = useRef(false);

  // Estado para el modal de transacciones
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithCategory | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Estado para el modal de acciones
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Estado para el modal de plantillas
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const {
    authenticatedFetch,
    isAuthenticated,
    isLoading: authLoading,
    user,
  } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // 📊 FUNCIONES SIMPLES - Sin useCallback innecesario
  const createDefaultCategories = async () => {
    try {
      toast.info('Configurando categorías...');

      const response = await authenticatedFetch(
        apiUrls.transactions.categoriesDefaults(),
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        const reloadResponse = await authenticatedFetch(
          apiUrls.transactions.categoriesFinance()
        );
        const reloadData = await reloadResponse.json();

        if (reloadResponse.ok && reloadData.data) {
          setCategories(reloadData.data);

          const incomeCategories = [
            'Salario',
            'Freelance',
            'Inversiones',
            'Bonos',
            'Comisiones',
            'Ventas',
            'Alquiler',
            'Dividendos',
            'Regalos',
            'Propinas',
            'Reembolsos',
            'Negocios',
            'Pensión',
            'Becas',
            'Trabajo extra',
            'Otros ingresos',
            'Consultorías',
            'Cashback',
            'Rifas',
            'Intereses',
            'Seguros',
            'Herencias',
            'Préstamos',
            'Agricultura',
          ];
          const ingresos = reloadData.data.filter((cat: Category) =>
            incomeCategories.includes(cat.name)
          ).length;
          const gastos = reloadData.data.filter(
            (cat: Category) => !incomeCategories.includes(cat.name)
          ).length;

          toast.success(
            `✅ Categorías configuradas: ${ingresos} ingresos + ${gastos} gastos`
          );
        }
      } else {
        toast.error('Error configurando categorías');
      }
    } catch (_error) {
      console.error('Error creating default categories:', _error);
      toast.error('Error de conexión');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await authenticatedFetch(
        apiUrls.transactions.categoriesFinance()
      );
      const data = await response.json();

      if (response.ok) {
        if (data.data && data.data.length > 0) {
          setCategories(data.data);
        } else {
          await createDefaultCategories();
        }
      } else {
        await createDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      await createDefaultCategories();
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await authenticatedFetch(apiUrls.transactions.list());
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.data);
      } else {
        toast.error(`Error cargando transacciones: ${data.message}`);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTransactions();
      loadCategories();
      
      // Toast de bienvenida - solo una vez
      if (!welcomeShownRef.current) {
        welcomeShownRef.current = true;
        setTimeout(() => {
          toast.welcome(
            `¿Alguna cuenta que hacer hoy ${user?.name || user?.email || 'Usuario'}? 💰`,
            4000
          );
        }, 500);
      }
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  // Funciones para manejar el modal de transacciones
  const openCreateTransactionModal = () => {
    setEditingTransaction(null);
    setIsEditingMode(false);
    setIsTransactionModalOpen(true);
  };

  const openEditTransactionModal = (transaction: Transaction) => {
    // Convertir la transacción para incluir category como string
    const transactionForEdit: TransactionWithCategory = {
      ...transaction,
      category: transaction.category?.name || '',
    };
    setEditingTransaction(transactionForEdit);
    setIsEditingMode(true);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
    setIsEditingMode(false);
  };

  // Funciones para manejar el modal de plantillas
  const openTemplateModal = () => {
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const handleTemplateSelect = (template: any) => {
    // Convertir template a formato de transacción
    const templateTransaction: TransactionWithCategory = {
      id: '',
      amount: 0,
      description: template.description,
      type: template.type,
      date: new Date().toISOString(),
      category: template.category,
    };
    
    closeTemplateModal();
    setEditingTransaction(templateTransaction);
    setIsEditingMode(false);
    setIsTransactionModalOpen(true);
  };

  const handleCreateFromScratch = () => {
    closeTemplateModal();
    openCreateTransactionModal();
  };

  const handleTransactionModalConfirm = async (transactionData: Partial<TransactionData>) => {
    if (isEditingMode && editingTransaction?.id) {
      await updateTransactionComplete(editingTransaction.id, transactionData as TransactionData);
    } else {
      await createTransactionComplete(transactionData as TransactionData);
    }
    closeTransactionModal();
  };

  // Funciones para el modal de acciones
  const openActionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleEditFromAction = () => {
    if (selectedTransaction) {
      closeActionModal();
      openEditTransactionModal(selectedTransaction);
    }
  };

  const handleDeleteFromAction = () => {
    if (selectedTransaction) {
      closeActionModal();
      deleteTransaction(selectedTransaction.id, selectedTransaction.description);
    }
  };

  const createTransactionComplete = async (transactionData: TransactionData) => {
    try {
      // Convertir category a categoryId si es necesario (por compatibilidad)
      const requestData = {
        ...transactionData,
        categoryId: undefined, // Enviamos sin categoría por ahora
      };
      delete (requestData as TransactionData & { category?: string }).category; // Eliminamos el campo category

      const response = await authenticatedFetch(apiUrls.transactions.create(), {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        // Agregar la categoría manual al objeto para mostrar en la UI
        const transactionWithCategory = {
          ...data.data,
          category: transactionData.category
            ? { name: transactionData.category }
            : null,
        };
        setTransactions(prev => [transactionWithCategory, ...prev]);
        toast.success('¡Transacción registrada exitosamente!');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const updateTransactionComplete = async (
    transactionId: string,
    transactionData: TransactionData
  ) => {
    try {
      // Convertir category a categoryId si es necesario (por compatibilidad)
      const requestData = {
        ...transactionData,
        categoryId: undefined, // Enviamos sin categoría por ahora
      };
      delete (requestData as TransactionData & { category?: string }).category; // Eliminamos el campo category

      const response = await authenticatedFetch(
        apiUrls.transactions.update(transactionId),
        {
          method: 'PUT',
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Actualizar la transacción con la categoría manual
        const updatedTransaction = {
          ...data.data,
          category: transactionData.category
            ? { name: transactionData.category }
            : null,
        };
        setTransactions(prev =>
          prev.map((transaction: Transaction) =>
            transaction.id === transactionId
              ? { ...transaction, ...updatedTransaction }
              : transaction
          )
        );
        toast.success('¡Transacción editada exitosamente!');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const deleteTransaction = async (
    transactionId: string,
    transactionDescription: string
  ) => {
    const confirmed = await confirm.confirmDelete(transactionDescription);
    if (!confirmed) {
      return;
    }

    try {
      const response = await authenticatedFetch(
        apiUrls.transactions.delete(transactionId),
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        toast.delete('¡Transacción eliminada exitosamente!');
      } else {
        const data = await response.json();
        toast.error(`Error: ${data.message}`);
      }
    } catch (_error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  // Función para usar plantilla - OBSOLETA
  // Movida a TemplateModal.tsx, se mantiene por compatibilidad

  // 🧮 Calcular totales - SIMPLES sin memoización innecesaria
  const getTotalIncome = () => {
    return transactions
      .filter((t: Transaction) => t.type === 'INCOME')
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter((t: Transaction) => t.type === 'EXPENSE')
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  // 📊 Funciones para análisis mensual
  const getCurrentMonthTransactions = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  };

  const getPreviousMonthTransactions = () => {
    const now = new Date();
    const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === previousMonth && transactionDate.getFullYear() === previousYear;
    });
  };

  const getMonthlyComparison = () => {
    const currentMonthTransactions = getCurrentMonthTransactions();
    const previousMonthTransactions = getPreviousMonthTransactions();
    
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const previousIncome = previousMonthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const previousExpenses = previousMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      current: { income: currentIncome, expenses: currentExpenses, balance: currentIncome - currentExpenses },
      previous: { income: previousIncome, expenses: previousExpenses, balance: previousIncome - previousExpenses },
      growth: {
        income: previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome * 100) : 0,
        expenses: previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses * 100) : 0,
        balance: previousIncome - previousExpenses !== 0 ? (((currentIncome - currentExpenses) - (previousIncome - previousExpenses)) / Math.abs(previousIncome - previousExpenses) * 100) : 0
      }
    };
  };

  // Funciones para manejar filtros
  const handleFilterChange = (filter: 'ALL' | 'INCOME' | 'EXPENSE') => {
    setActiveFilter(filter);
  };

  // Filtrar transacciones según el filtro activo
  const getFilteredTransactions = () => {
    switch (activeFilter) {
      case 'INCOME':
        return transactions.filter(t => t.type === 'INCOME');
      case 'EXPENSE':
        return transactions.filter(t => t.type === 'EXPENSE');
      default:
        return transactions;
    }
  };

  // 📊 Renderizar dashboard de resumen financiero
  const renderFinancialDashboard = () => {
    const monthlyComparison = getMonthlyComparison();
    const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const previousMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    // Datos para el gráfico de barras
    const chartData = [
      {
        name: 'Mes Anterior',
        Ingresos: monthlyComparison.previous.income,
        Gastos: monthlyComparison.previous.expenses,
        Balance: monthlyComparison.previous.balance
      },
      {
        name: 'Mes Actual',
        Ingresos: monthlyComparison.current.income,
        Gastos: monthlyComparison.current.expenses,
        Balance: monthlyComparison.current.balance
      }
    ];
    
    // Datos para el gráfico circular
    const pieData = [
      { name: 'Ingresos', value: monthlyComparison.current.income, color: '#10b981' },
      { name: 'Gastos', value: monthlyComparison.current.expenses, color: '#ef4444' }
    ];
    
    return (
      <div className="space-y-6">
        {/* Header del Dashboard */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
            📊 Resumen Financiero - {currentMonth}
          </h3>
          <p className="text-white/90" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
            Análisis completo de tus finanzas y comparación mensual
          </p>
        </div>

        {/* Tarjetas de comparación mensual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                💵 Ingresos
              </h4>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                monthlyComparison.growth.income >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {monthlyComparison.growth.income >= 0 ? '⬆️' : '⬇️'} {Math.abs(monthlyComparison.growth.income).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                +${monthlyComparison.current.income.toLocaleString()}
              </p>
              <p className="text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {previousMonth}: +${monthlyComparison.previous.income.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                💸 Gastos
              </h4>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                monthlyComparison.growth.expenses <= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {monthlyComparison.growth.expenses >= 0 ? '⬆️' : '⬇️'} {Math.abs(monthlyComparison.growth.expenses).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-200" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                -${monthlyComparison.current.expenses.toLocaleString()}
              </p>
              <p className="text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {previousMonth}: -${monthlyComparison.previous.expenses.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                ⚖️ Balance
              </h4>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                monthlyComparison.growth.balance >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {monthlyComparison.growth.balance >= 0 ? '⬆️' : '⬇️'} {Math.abs(monthlyComparison.growth.balance).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-2xl font-bold ${
                monthlyComparison.current.balance >= 0 ? 'text-blue-200' : 'text-orange-200'
              }`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                ${monthlyComparison.current.balance.toLocaleString()}
              </p>
              <p className="text-sm text-white/80" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {previousMonth}: ${monthlyComparison.previous.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Comparación Mensual */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              📈 Comparación Mensual
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="name" stroke="white" fontSize={12} />
                <YAxis stroke="white" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value) => [`${Number(value).toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico Circular - Distribución Actual */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
              🍰 Distribución del Mes
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mensaje de análisis */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
            📝 Análisis Financiero
          </h4>
          <div className="space-y-3">
            {monthlyComparison.growth.income > 0 ? (
              <p className="text-green-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                🚀 ¡Excelente! Tus ingresos aumentaron un {monthlyComparison.growth.income.toFixed(1)}% respecto al mes anterior.
              </p>
            ) : monthlyComparison.growth.income < 0 ? (
              <p className="text-orange-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                📉 Tus ingresos disminuyeron un {Math.abs(monthlyComparison.growth.income).toFixed(1)}% este mes. Considera nuevas oportunidades de ingresos.
              </p>
            ) : (
              <p className="text-blue-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                📊 Tus ingresos se mantuvieron estables este mes.
              </p>
            )}
            
            {monthlyComparison.growth.expenses < 0 ? (
              <p className="text-green-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                🎉 ¡Buen trabajo! Redujiste tus gastos en un {Math.abs(monthlyComparison.growth.expenses).toFixed(1)}%.
              </p>
            ) : monthlyComparison.growth.expenses > 0 ? (
              <p className="text-red-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                ⚠️ Tus gastos aumentaron un {monthlyComparison.growth.expenses.toFixed(1)}%. Revisa tus categorías de gasto.
              </p>
            ) : (
              <p className="text-blue-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                📋 Tus gastos se mantuvieron estables este mes.
              </p>
            )}
            
            {monthlyComparison.current.balance > monthlyComparison.previous.balance ? (
              <p className="text-green-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                🎆 ¡Felicitaciones! Tu balance mejoró ${(monthlyComparison.current.balance - monthlyComparison.previous.balance).toLocaleString()} respecto al mes anterior.
              </p>
            ) : monthlyComparison.current.balance < monthlyComparison.previous.balance ? (
              <p className="text-orange-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                💰 Tu balance disminuyó ${Math.abs(monthlyComparison.current.balance - monthlyComparison.previous.balance).toLocaleString()}. Considera ajustar tus hábitos financieros.
              </p>
            ) : (
              <p className="text-blue-200 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                📊 Tu balance se mantuvo estable este mes.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🎨 RENDERIZADO DIRECTO DE TRANSACCIONES - Como en tareas
  const renderTransactions = () => {
    const filteredTransactions = getFilteredTransactions();
    return filteredTransactions.map((transaction) => (
      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg cursor-pointer hover:scale-[1.02] transition-transform duration-200" onClick={() => openActionModal(transaction)}>
        <div className="flex items-center space-x-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border ${
              transaction.type === 'INCOME'
                ? 'bg-green-500/60 border-green-400/40'
                : 'bg-red-500/60 border-red-400/40'
            } shadow-lg`}
          >
            <span className="text-xl">
              {transaction.category?.icon ||
                (transaction.type === 'INCOME' ? '💵' : '💸')}
            </span>
          </div>
          <div>
            <h3
              className="font-bold text-white text-lg"
              style={{
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
              }}
            >
              {transaction.description}
            </h3>
            <div className="flex items-center space-x-2">
              <p
                className="text-sm text-white/80 font-medium"
                style={{
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                }}
              >
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
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
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
          <span
            className={`text-xl font-bold ${
              transaction.type === 'INCOME'
                ? 'text-green-200'
                : 'text-red-200'
            }`}
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
          >
            {transaction.type === 'INCOME' ? '+' : '-'}$
            {Math.abs(transaction.amount).toLocaleString()}
          </span>
        </div>
      </div>
    ));
  };

  // Calcular totales para mostrar
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">💰</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!authLoading && typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">💰</div>
          <p className="text-white mt-2">Cargando finanzas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-blue-100 hover:text-white"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">
                💰 Finanzas Personales
              </h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white font-bold text-lg">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Sección de Creación de Transacciones */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 p-6 rounded-lg mb-6">
          {/* Botón Crear Transacción */}
          <div className="mb-6 px-4">
            <button
            onClick={openTemplateModal}
            className="w-full bg-purple-600/70 backdrop-blur-md text-white px-6 py-4 rounded-lg font-bold border border-purple-400/70 hover:bg-purple-700/80 transition-all duration-150 shadow-lg text-base"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>💰 Nueva Transacción</button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/15 backdrop-blur-md shadow-lg border border-white/30 rounded-lg">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-bold text-white"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                {activeFilter === 'ALL' 
                  ? `Transacciones Recientes (${getFilteredTransactions().length} de ${transactions.length})`
                  : activeFilter === 'INCOME'
                    ? `Ingresos (${getFilteredTransactions().length} de ${transactions.length})`
                    : `Gastos (${getFilteredTransactions().length} de ${transactions.length})`
                }
                {activeFilter !== 'ALL' && (
                  <button
                    onClick={() => handleFilterChange('ALL')}
                    className="ml-3 text-sm bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-lg hover:bg-white/30 transition-all duration-150"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    Mostrar todas
                  </button>
                )}
              </h2>
              
              {/* Financial Summary Cards */}
              <div className="flex gap-4">
                <div 
                  className={`p-3 rounded-lg min-w-[180px] cursor-pointer transition-all duration-200 hover:scale-105 ${
                    activeFilter === 'INCOME'
                      ? 'bg-green-200/90 border-2 border-green-400 shadow-lg'
                      : 'bg-green-100/90 border-2 border-green-300'
                  }`}
                  onClick={() => handleFilterChange('INCOME')}
                >
                  <h3 className="text-xs font-bold text-green-800 mb-1">
                    Ingresos
                  </h3>
                  <p className="text-lg font-bold text-green-900">
                    +${totalIncome.toLocaleString()}
                  </p>
                </div>

                <div 
                  className={`p-3 rounded-lg min-w-[180px] cursor-pointer transition-all duration-200 hover:scale-105 ${
                    activeFilter === 'EXPENSE'
                      ? 'bg-red-200/90 border-2 border-red-400 shadow-lg'
                      : 'bg-red-100/90 border-2 border-red-300'
                  }`}
                  onClick={() => handleFilterChange('EXPENSE')}
                >
                  <h3 className="text-xs font-bold text-red-800 mb-1">
                    Gastos
                  </h3>
                  <p className="text-lg font-bold text-red-900">
                    -${totalExpenses.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-lg border-2 min-w-[180px] cursor-pointer transition-all duration-200 hover:scale-105 ${
                    activeFilter === 'ALL'
                      ? balance >= 0
                        ? 'bg-blue-200/90 border-blue-400 shadow-lg'
                        : 'bg-orange-200/90 border-orange-400 shadow-lg'
                      : balance >= 0
                        ? 'bg-blue-100/90 border-blue-300'
                        : 'bg-orange-100/90 border-orange-300'
                  }`}
                  onClick={() => handleFilterChange('ALL')}
                >
                  <h3
                    className={`text-xs font-bold mb-1 ${
                      balance >= 0 ? 'text-blue-800' : 'text-orange-800'
                    }`}
                  >
                    Balance
                  </h3>
                  <p
                    className={`text-lg font-bold ${
                      balance >= 0 ? 'text-blue-900' : 'text-orange-900'
                    }`}
                  >
                    ${balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeFilter === 'ALL' ? (
              /* Dashboard de resumen financiero */
              renderFinancialDashboard()
            ) : getFilteredTransactions().length === 0 ? (
              /* Mensaje cuando no hay transacciones del tipo filtrado */
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  No hay {activeFilter === 'INCOME' ? 'ingresos' : 'gastos'} registrados.
                </p>
                <p
                  className="text-white/90 text-base font-medium"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Haz click en "Mostrar todas" para ver el resumen completo.
                </p>
              </div>
            ) : (
              /* Lista de transacciones filtradas */
              <div className="space-y-3">
                {renderTransactions()}
              </div>
            )}
            
            {/* Mensaje cuando no hay transacciones en total */}
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  No tienes transacciones registradas aún.
                </p>
                <p
                  className="text-white/90 text-base font-medium"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Registra tu primera transacción usando el botón de arriba.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <toast.ToastContainer />

      {/* Confirm Modal */}
      <confirm.ConfirmModal />

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        type="finance"
        onTemplateSelect={handleTemplateSelect}
        onCreateFromScratch={handleCreateFromScratch}
        onCancel={closeTemplateModal}
      />

      {/* Transaction Modal */}
      <EditTransactionModal
        isOpen={isTransactionModalOpen}
        transaction={editingTransaction ? {
          ...editingTransaction,
          category: typeof editingTransaction.category === 'object'
            ? editingTransaction.category?.name
            : editingTransaction.category,
        } : null}
        isEditing={isEditingMode}
        onConfirm={handleTransactionModalConfirm}
        onCancel={closeTransactionModal}
      />

      {/* Item Action Modal */}
      <ItemActionModal
        isOpen={isActionModalOpen}
        task={selectedTransaction ? {
          id: selectedTransaction.id,
          title: selectedTransaction.description,
          description: selectedTransaction.category?.name ? `Categoría: ${selectedTransaction.category.name}` : undefined,
          status: selectedTransaction.type, // INCOME o EXPENSE
          priority: selectedTransaction.amount.toString(), // Monto como string
          dueDate: selectedTransaction.date,
          category: selectedTransaction.category ? {
            id: selectedTransaction.category.id ?? '',
            name: selectedTransaction.category.name,
            color: selectedTransaction.category.color ?? '',
          } : undefined,
          createdAt: selectedTransaction.date,
          updatedAt: selectedTransaction.date,
        } : null}
        onEdit={handleEditFromAction}
        onDelete={handleDeleteFromAction}
        onClose={closeActionModal}
        type="transaction"
      />
    </div>
  );
}
