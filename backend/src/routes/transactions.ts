import { Router, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateCategoryDto,
} from '../types';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/transactions - Obtener todas las transacciones del usuario
router.get(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { type, categoryId, startDate, endDate } = req.query;

      const transactions = await TransactionService.getUserTransactions(
        req.user.id,
        {
          type: type as 'INCOME' | 'EXPENSE',
          categoryId: categoryId as string,
          startDate: startDate as string,
          endDate: endDate as string,
        }
      );

      res.json({
        message: 'Transactions retrieved successfully',
        data: transactions,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Failed to retrieve transactions' });
    }
  }
);

// GET /api/transactions/stats - Obtener estadísticas financieras
router.get(
  '/stats',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { startDate, endDate } = req.query;

      const stats = await TransactionService.getFinancialStats(req.user.id, {
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({
        message: 'Financial stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Get financial stats error:', error);
      res.status(500).json({ message: 'Failed to retrieve financial stats' });
    }
  }
);

// GET /api/transactions/summary - Obtener resumen del mes actual
router.get(
  '/summary',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const summary = await TransactionService.getCurrentMonthSummary(
        req.user.id
      );

      res.json({
        message: 'Monthly summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      console.error('Get monthly summary error:', error);
      res.status(500).json({ message: 'Failed to retrieve monthly summary' });
    }
  }
);

// GET /api/transactions/:id - Obtener una transacción específica
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(
        id,
        req.user.id
      );

      if (!transaction) {
        res.status(404).json({ message: 'Transaction not found' });
        return;
      }

      res.json({
        message: 'Transaction retrieved successfully',
        data: transaction,
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ message: 'Failed to retrieve transaction' });
    }
  }
);

// POST /api/transactions - Crear nueva transacción
router.post(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const transactionData: CreateTransactionDto = req.body;

      if (
        !transactionData.amount ||
        !transactionData.description ||
        !transactionData.type
      ) {
        res
          .status(400)
          .json({ message: 'Amount, description and type are required' });
        return;
      }

      const transaction = await TransactionService.createTransaction(
        req.user.id,
        transactionData
      );

      res.status(201).json({
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to create transaction';
      res.status(400).json({ message });
    }
  }
);

// PUT /api/transactions/:id - Actualizar transacción
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const transactionData: UpdateTransactionDto = req.body;

      const transaction = await TransactionService.updateTransaction(
        id,
        req.user.id,
        transactionData
      );

      res.json({
        message: 'Transaction updated successfully',
        data: transaction,
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update transaction';
      res.status(400).json({ message });
    }
  }
);

// DELETE /api/transactions/:id - Eliminar transacción
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      await TransactionService.deleteTransaction(id, req.user.id);

      res.json({
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to delete transaction';
      res.status(400).json({ message });
    }
  }
);

// === RUTAS PARA CATEGORÍAS ===

// GET /api/transactions/categories/finance - Obtener categorías de finanzas
router.get(
  '/categories/finance',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const categories = await TransactionService.getFinanceCategories();

      res.json({
        message: 'Finance categories retrieved successfully',
        data: categories,
      });
    } catch (error) {
      console.error('Get finance categories error:', error);
      res
        .status(500)
        .json({ message: 'Failed to retrieve finance categories' });
    }
  }
);

// POST /api/transactions/categories - Crear nueva categoría
router.post(
  '/categories',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const categoryData: CreateCategoryDto = req.body;

      if (!categoryData.name) {
        res.status(400).json({ message: 'Category name is required' });
        return;
      }

      const category = await TransactionService.createCategory({
        ...categoryData,
        type: 'FINANCE',
      });

      res.status(201).json({
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      console.error('Create category error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to create category';
      res.status(400).json({ message });
    }
  }
);

// POST /api/transactions/categories/defaults - Crear categorías por defecto
router.post(
  '/categories/defaults',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      await TransactionService.createDefaultCategories();

      res.status(201).json({
        message: 'Default categories created successfully',
      });
    } catch (error) {
      console.error('Create default categories error:', error);
      res.status(500).json({ message: 'Failed to create default categories' });
    }
  }
);

export default router;
