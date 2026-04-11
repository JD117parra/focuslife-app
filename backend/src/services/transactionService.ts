import { prisma } from '../config/database';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionResponse,
  CreateCategoryDto,
  CategoryResponse,
} from '../types';

export class TransactionService {
  // Obtener todas las transacciones de un usuario
  static async getUserTransactions(
    userId: string,
    filters?: {
      type?: 'INCOME' | 'EXPENSE';
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<TransactionResponse[]> {
    const whereClause: Record<string, any> = { userId };

    // Aplicar filtros
    if (filters?.type) {
      whereClause.type = filters.type;
    }

    if (filters?.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.date = {};
      if (filters.startDate) whereClause.date.gte = new Date(filters.startDate);
      if (filters.endDate) whereClause.date.lte = new Date(filters.endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return transactions;
  }

  // Obtener una transacción específica por ID
  static async getTransactionById(
    transactionId: string,
    userId: string
  ): Promise<TransactionResponse | null> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return transaction;
  }

  // Crear nueva transacción
  static async createTransaction(
    userId: string,
    transactionData: CreateTransactionDto
  ): Promise<TransactionResponse> {
    const { amount, description, type, categoryId, date } = transactionData;

    // Para gastos, asegurar que el monto sea positivo (se maneja en el frontend)
    const finalAmount = type === 'EXPENSE' ? Math.abs(amount) : amount;

    const transaction = await prisma.transaction.create({
      data: {
        amount: finalAmount,
        description,
        type,
        categoryId,
        userId,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return transaction;
  }

  // Actualizar transacción
  static async updateTransaction(
    transactionId: string,
    userId: string,
    transactionData: UpdateTransactionDto
  ): Promise<TransactionResponse | null> {
    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existingTransaction) {
      throw new Error(
        'Transaction not found or you do not have permission to update it'
      );
    }

    // Procesar el monto si se está actualizando
    const updateData: Record<string, any> = { ...transactionData };
    if (updateData.amount !== undefined && updateData.type) {
      updateData.amount =
        updateData.type === 'EXPENSE'
          ? Math.abs(updateData.amount)
          : updateData.amount;
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return updatedTransaction;
  }

  // Eliminar transacción
  static async deleteTransaction(
    transactionId: string,
    userId: string
  ): Promise<boolean> {
    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existingTransaction) {
      throw new Error(
        'Transaction not found or you do not have permission to delete it'
      );
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return true;
  }

  // Obtener estadísticas financieras del usuario
  static async getFinancialStats(
    userId: string,
    period?: {
      startDate?: string;
      endDate?: string;
    }
  ) {
    const whereClause: Record<string, any> = { userId };

    if (period?.startDate || period?.endDate) {
      whereClause.date = {};
      if (period.startDate) whereClause.date.gte = new Date(period.startDate);
      if (period.endDate) whereClause.date.lte = new Date(period.endDate);
    }

    // Calcular totales por tipo
    const incomeStats = await prisma.transaction.aggregate({
      where: { ...whereClause, type: 'INCOME' },
      _sum: { amount: true },
      _count: { id: true },
    });

    const expenseStats = await prisma.transaction.aggregate({
      where: { ...whereClause, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalIncome = incomeStats._sum.amount || 0;
    const totalExpenses = expenseStats._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    // Obtener transacciones por categoría
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...whereClause, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true },
    });

    return {
      balance,
      totalIncome,
      totalExpenses,
      incomeTransactions: incomeStats._count.id,
      expenseTransactions: expenseStats._count.id,
      totalTransactions: incomeStats._count.id + expenseStats._count.id,
      expensesByCategory,
    };
  }

  // Obtener resumen del mes actual
  static async getCurrentMonthSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getFinancialStats(userId, {
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    });
  }

  // === MÉTODOS PARA CATEGORÍAS ===

  // Obtener todas las categorías de finanzas
  static async getFinanceCategories(): Promise<CategoryResponse[]> {
    const categories = await prisma.category.findMany({
      where: { type: 'FINANCE' },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  // Crear nueva categoría de finanzas
  static async createCategory(
    categoryData: CreateCategoryDto
  ): Promise<CategoryResponse> {
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        type: 'FINANCE',
      },
    });

    return category;
  }

  // Crear categorías por defecto para un usuario (llamar al registrarse)
  static async createDefaultCategories(): Promise<void> {
    const defaultCategories = [
      // Categorías de ingresos - EXPANDIDAS (24 opciones)
      { name: 'Salario', type: 'FINANCE', color: '#10b981', icon: '💰' },
      { name: 'Freelance', type: 'FINANCE', color: '#3b82f6', icon: '💻' },
      { name: 'Inversiones', type: 'FINANCE', color: '#8b5cf6', icon: '📈' },
      { name: 'Bonos', type: 'FINANCE', color: '#f59e0b', icon: '🎁' },
      { name: 'Comisiones', type: 'FINANCE', color: '#ef4444', icon: '💼' },
      { name: 'Ventas', type: 'FINANCE', color: '#84cc16', icon: '🛒' },
      { name: 'Alquiler', type: 'FINANCE', color: '#6366f1', icon: '🏠' },
      { name: 'Dividendos', type: 'FINANCE', color: '#8b5cf6', icon: '📊' },
      { name: 'Regalos', type: 'FINANCE', color: '#ec4899', icon: '🎁' },
      { name: 'Propinas', type: 'FINANCE', color: '#f97316', icon: '💵' },
      { name: 'Reembolsos', type: 'FINANCE', color: '#06b6d4', icon: '💳' },
      { name: 'Negocios', type: 'FINANCE', color: '#10b981', icon: '🏢' },
      { name: 'Pensión', type: 'FINANCE', color: '#64748b', icon: '👴' },
      { name: 'Becas', type: 'FINANCE', color: '#3b82f6', icon: '🎓' },
      { name: 'Trabajo extra', type: 'FINANCE', color: '#f59e0b', icon: '⏰' },
      { name: 'Otros ingresos', type: 'FINANCE', color: '#06b6d4', icon: '💎' },
      // NUEVAS CATEGORÍAS DE INGRESOS
      { name: 'Consultorías', type: 'FINANCE', color: '#16a34a', icon: '🤝' },
      { name: 'Cashback', type: 'FINANCE', color: '#0ea5e9', icon: '💸' },
      { name: 'Rifas', type: 'FINANCE', color: '#d946ef', icon: '🎲' },
      { name: 'Intereses', type: 'FINANCE', color: '#7c3aed', icon: '🏦' },
      { name: 'Seguros', type: 'FINANCE', color: '#dc2626', icon: '🛡️' },
      { name: 'Herencias', type: 'FINANCE', color: '#65a30d', icon: '👴' },
      { name: 'Préstamos', type: 'FINANCE', color: '#ea580c', icon: '💰' },
      { name: 'Agricultura', type: 'FINANCE', color: '#84cc16', icon: '🌾' },

      // Categorías de gastos - EXPANDIDAS (27 opciones)
      { name: 'Alimentación', type: 'FINANCE', color: '#f59e0b', icon: '🍽️' },
      { name: 'Transporte', type: 'FINANCE', color: '#ef4444', icon: '🚗' },
      {
        name: 'Entretenimiento',
        type: 'FINANCE',
        color: '#ec4899',
        icon: '🎬',
      },
      { name: 'Salud', type: 'FINANCE', color: '#84cc16', icon: '🏥' },
      { name: 'Educación', type: 'FINANCE', color: '#6366f1', icon: '📚' },
      { name: 'Hogar', type: 'FINANCE', color: '#8b5cf6', icon: '🏠' },
      { name: 'Ropa', type: 'FINANCE', color: '#d946ef', icon: '👕' },
      { name: 'Servicios', type: 'FINANCE', color: '#06b6d4', icon: '🔌' },
      { name: 'Seguros', type: 'FINANCE', color: '#64748b', icon: '🛡️' },
      { name: 'Impuestos', type: 'FINANCE', color: '#dc2626', icon: '📋' },
      { name: 'Belleza', type: 'FINANCE', color: '#f97316', icon: '💄' },
      { name: 'Mascotas', type: 'FINANCE', color: '#10b981', icon: '🐕' },
      { name: 'Regalos', type: 'FINANCE', color: '#ec4899', icon: '🎁' },
      { name: 'Viajes', type: 'FINANCE', color: '#8b5cf6', icon: '✈️' },
      { name: 'Suscripciones', type: 'FINANCE', color: '#6366f1', icon: '📱' },
      { name: 'Trabajo', type: 'FINANCE', color: '#64748b', icon: '💼' },
      { name: 'Préstamos', type: 'FINANCE', color: '#ef4444', icon: '💳' },
      { name: 'Otros gastos', type: 'FINANCE', color: '#64748b', icon: '📦' },
      // NUEVAS CATEGORÍAS DE GASTOS
      { name: 'Gasolina', type: 'FINANCE', color: '#dc2626', icon: '⛽' },
      { name: 'Farmacia', type: 'FINANCE', color: '#16a34a', icon: '💊' },
      { name: 'Gimnasio', type: 'FINANCE', color: '#0ea5e9', icon: '💪' },
      { name: 'Café', type: 'FINANCE', color: '#92400e', icon: '☕' },
      { name: 'Libros', type: 'FINANCE', color: '#7c3aed', icon: '📖' },
      { name: 'Tecnología', type: 'FINANCE', color: '#1f2937', icon: '💻' },
      { name: 'Streaming', type: 'FINANCE', color: '#db2777', icon: '📺' },
      { name: 'Donaciones', type: 'FINANCE', color: '#059669', icon: '🤲' },
      { name: 'Multas', type: 'FINANCE', color: '#dc2626', icon: '🚫' },
    ];

    for (const category of defaultCategories) {
      try {
        // Verificar si la categoría ya existe antes de crearla
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: category.name,
            type: 'FINANCE',
          },
        });

        if (!existingCategory) {
          await prisma.category.create({ data: category });
        }
      } catch (error) {
        console.error(`Error creating category ${category.name}:`, error);
      }
    }
  }
}
