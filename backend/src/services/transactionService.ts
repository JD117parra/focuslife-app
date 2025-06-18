import { prisma } from '../config/database';
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponse, CreateCategoryDto, CategoryResponse } from '../types';

export class TransactionService {
  // Obtener todas las transacciones de un usuario
  static async getUserTransactions(userId: string, filters?: {
    type?: 'INCOME' | 'EXPENSE';
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionResponse[]> {
    const whereClause: any = { userId };

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
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return transactions;
  }

  // Obtener una transacción específica por ID
  static async getTransactionById(transactionId: string, userId: string): Promise<TransactionResponse | null> {
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        userId 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return transaction;
  }

  // Crear nueva transacción
  static async createTransaction(userId: string, transactionData: CreateTransactionDto): Promise<TransactionResponse> {
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
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return transaction;
  }

  // Actualizar transacción
  static async updateTransaction(transactionId: string, userId: string, transactionData: UpdateTransactionDto): Promise<TransactionResponse | null> {
    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found or you do not have permission to update it');
    }

    // Procesar el monto si se está actualizando
    const updateData: any = { ...transactionData };
    if (updateData.amount !== undefined && updateData.type) {
      updateData.amount = updateData.type === 'EXPENSE' ? Math.abs(updateData.amount) : updateData.amount;
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    return updatedTransaction;
  }

  // Eliminar transacción
  static async deleteTransaction(transactionId: string, userId: string): Promise<boolean> {
    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found or you do not have permission to delete it');
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    });

    return true;
  }

  // Obtener estadísticas financieras del usuario
  static async getFinancialStats(userId: string, period?: {
    startDate?: string;
    endDate?: string;
  }) {
    const whereClause: any = { userId };

    if (period?.startDate || period?.endDate) {
      whereClause.date = {};
      if (period.startDate) whereClause.date.gte = new Date(period.startDate);
      if (period.endDate) whereClause.date.lte = new Date(period.endDate);
    }

    // Calcular totales por tipo
    const incomeStats = await prisma.transaction.aggregate({
      where: { ...whereClause, type: 'INCOME' },
      _sum: { amount: true },
      _count: { id: true }
    });

    const expenseStats = await prisma.transaction.aggregate({
      where: { ...whereClause, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true }
    });

    const totalIncome = incomeStats._sum.amount || 0;
    const totalExpenses = expenseStats._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    // Obtener transacciones por categoría
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...whereClause, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { id: true }
    });

    return {
      balance,
      totalIncome,
      totalExpenses,
      incomeTransactions: incomeStats._count.id,
      expenseTransactions: expenseStats._count.id,
      totalTransactions: incomeStats._count.id + expenseStats._count.id,
      expensesByCategory
    };
  }

  // Obtener resumen del mes actual
  static async getCurrentMonthSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getFinancialStats(userId, {
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString()
    });
  }

  // === MÉTODOS PARA CATEGORÍAS ===

  // Obtener todas las categorías de finanzas
  static async getFinanceCategories(): Promise<CategoryResponse[]> {
    const categories = await prisma.category.findMany({
      where: { type: 'FINANCE' },
      orderBy: { name: 'asc' }
    });

    return categories;
  }

  // Crear nueva categoría de finanzas
  static async createCategory(categoryData: CreateCategoryDto): Promise<CategoryResponse> {
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        type: 'FINANCE'
      }
    });

    return category;
  }

  // Crear categorías por defecto para un usuario (llamar al registrarse)
  static async createDefaultCategories(): Promise<void> {
    const defaultCategories = [
      // Categorías de ingresos
      { name: 'Salario', type: 'FINANCE', color: '#10b981', icon: '💰' },
      { name: 'Freelance', type: 'FINANCE', color: '#3b82f6', icon: '💻' },
      { name: 'Inversiones', type: 'FINANCE', color: '#8b5cf6', icon: '📈' },
      { name: 'Otros ingresos', type: 'FINANCE', color: '#06b6d4', icon: '💎' },
      
      // Categorías de gastos
      { name: 'Alimentación', type: 'FINANCE', color: '#f59e0b', icon: '🍽️' },
      { name: 'Transporte', type: 'FINANCE', color: '#ef4444', icon: '🚗' },
      { name: 'Entretenimiento', type: 'FINANCE', color: '#ec4899', icon: '🎬' },
      { name: 'Salud', type: 'FINANCE', color: '#84cc16', icon: '🏥' },
      { name: 'Educación', type: 'FINANCE', color: '#6366f1', icon: '📚' },
      { name: 'Hogar', type: 'FINANCE', color: '#8b5cf6', icon: '🏠' },
      { name: 'Ropa', type: 'FINANCE', color: '#d946ef', icon: '👕' },
      { name: 'Otros gastos', type: 'FINANCE', color: '#64748b', icon: '📦' }
    ];

    for (const category of defaultCategories) {
      try {
        await prisma.category.create({ data: category });
      } catch (error) {
        // Ignorar errores de duplicado
        console.log(`Category ${category.name} might already exist`);
      }
    }
  }
}