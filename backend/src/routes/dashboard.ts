import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { TaskService } from '../services/taskService';
import { HabitService } from '../services/habitService';
import { TransactionService } from '../services/transactionService';

const router = Router();

// GET /api/dashboard/summary - Obtener resumen inteligente para el widget
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userId = req.user.id;

    // Obtener todos los datos en paralelo para mejor performance
    const [
      overdueTasks,
      incompleteHabits,
      monthlyFinances,
      todayExpenses,
      recentCompletedTasks,
      longestStreak
    ] = await Promise.all([
      TaskService.getOverdueTasks(userId),
      HabitService.getTodayIncompleteHabits(userId),
      TransactionService.getCurrentMonthSummary(userId),
      TransactionService.getTodayExpensesSummary(userId),
      TaskService.getRecentCompletedTasks(userId, 1), // Tareas completadas ayer
      HabitService.getLongestStreak(userId)
    ]);

    // Procesar información para el widget
    const summary = {
      // 🔴 Atención requerida
      attention: {
        overdueTasks: {
          count: overdueTasks.length,
          items: overdueTasks.slice(0, 3).map(task => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate
          }))
        },
        incompleteHabits: {
          count: incompleteHabits.length,
          items: incompleteHabits.slice(0, 3).map(habit => ({
            id: habit.id,
            name: habit.name
          }))
        }
      },

      // 🟡 Finanzas
      finances: {
        monthlyBalance: monthlyFinances.balance,
        totalExpenses: monthlyFinances.totalExpenses,
        totalIncome: monthlyFinances.totalIncome,
        todaySpent: todayExpenses.totalSpent,
        todayTransactions: todayExpenses.transactionCount,
        topTodayExpenses: todayExpenses.topExpenses.map(expense => ({
          amount: expense.amount,
          description: expense.description,
          category: expense.category?.name || 'Sin categoría'
        }))
      },

      // 🟢 Logros
      achievements: {
        tasksCompletedYesterday: recentCompletedTasks,
        longestHabitStreak: longestStreak ? {
          habitName: longestStreak.habitName,
          days: longestStreak.streak
        } : null
      }
    };

    res.json({
      message: 'Dashboard summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ 
      message: 'Failed to get dashboard summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;