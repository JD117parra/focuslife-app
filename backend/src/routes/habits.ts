import { Router, Response } from 'express';
import { HabitService } from '../services/habitService';
import { CreateHabitDto, UpdateHabitDto, CreateHabitEntryDto } from '../types';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// LOGGING MEJORADO PARA DEBUG
router.use((req, res, next) => {
  console.log(
    '🎯 HABITS ROUTER:',
    req.method,
    req.originalUrl,
    req.body ? 'Body:' : '',
    req.body
  );
  next();
});

// DELETE /api/habits/:habitId/unmark - Desmarcar hábito para una fecha específica (más intuitivo)
router.delete(
  '/:habitId/unmark',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log(
      '🎯 UNMARK endpoint reached for habit:',
      req.params.habitId,
      'date:',
      req.body.date
    );
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { habitId } = req.params;
      const { date } = req.body;

      if (!date) {
        res.status(400).json({ message: 'Date is required' });
        return;
      }

      await HabitService.unmarkHabitForDate(habitId, req.user.id, date);

      res.json({
        message: 'Habit unmarked successfully for the specified date',
      });
    } catch (error) {
      console.error('Unmark habit error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to unmark habit';
      res.status(400).json({ message });
    }
  }
);

// DELETE /api/habits/entries/:entryId - Eliminar entrada específica de hábito por ID (método alternativo)
router.delete(
  '/entries/:entryId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log('🟢 DELETE ENTRY endpoint reached:', req.params.entryId);
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { entryId } = req.params;
      await HabitService.deleteHabitEntry(entryId, req.user.id);

      res.json({
        message: 'Habit entry deleted successfully',
      });
    } catch (error) {
      console.error('Delete habit entry error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to delete habit entry';
      res.status(400).json({ message });
    }
  }
);

// GET /api/habits - Obtener todos los hábitos del usuario
router.get(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const habits = await HabitService.getUserHabits(req.user.id);

      res.json({
        message: 'Habits retrieved successfully',
        data: habits,
      });
    } catch (error) {
      console.error('Get habits error:', error);
      res.status(500).json({ message: 'Failed to retrieve habits' });
    }
  }
);

// GET /api/habits/stats - Obtener estadísticas de hábitos
router.get(
  '/stats',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const stats = await HabitService.getHabitStats(req.user.id);

      res.json({
        message: 'Habit stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Get habit stats error:', error);
      res.status(500).json({ message: 'Failed to retrieve habit stats' });
    }
  }
);

// GET /api/habits/:id - Obtener un hábito específico
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
      const habit = await HabitService.getHabitById(id, req.user.id);

      if (!habit) {
        res.status(404).json({ message: 'Habit not found' });
        return;
      }

      res.json({
        message: 'Habit retrieved successfully',
        data: habit,
      });
    } catch (error) {
      console.error('Get habit error:', error);
      res.status(500).json({ message: 'Failed to retrieve habit' });
    }
  }
);

// POST /api/habits - Crear nuevo hábito
router.post(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const habitData: CreateHabitDto = req.body;

      if (!habitData.name) {
        res.status(400).json({ message: 'Name is required' });
        return;
      }

      const habit = await HabitService.createHabit(req.user.id, habitData);

      res.status(201).json({
        message: 'Habit created successfully',
        data: habit,
      });
    } catch (error) {
      console.error('Create habit error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to create habit';
      res.status(400).json({ message });
    }
  }
);

// PUT /api/habits/:id - Actualizar hábito
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
      const habitData: UpdateHabitDto = req.body;

      const habit = await HabitService.updateHabit(id, req.user.id, habitData);

      res.json({
        message: 'Habit updated successfully',
        data: habit,
      });
    } catch (error) {
      console.error('Update habit error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update habit';
      res.status(400).json({ message });
    }
  }
);

// PATCH /api/habits/:id/toggle - Alternar estado activo/inactivo
router.patch(
  '/:id/toggle',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const habit = await HabitService.toggleHabitStatus(id, req.user.id);

      res.json({
        message: 'Habit status updated successfully',
        data: habit,
      });
    } catch (error) {
      console.error('Toggle habit error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to toggle habit status';
      res.status(400).json({ message });
    }
  }
);

// DELETE /api/habits/:id - Eliminar hábito
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
      await HabitService.deleteHabit(id, req.user.id);

      res.json({
        message: 'Habit deleted successfully',
      });
    } catch (error) {
      console.error('Delete habit error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to delete habit';
      res.status(400).json({ message });
    }
  }
);

// POST /api/habits/:id/entries - Registrar entrada de hábito (marcar como hecho)
router.post(
  '/:id/entries',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log(
      '✅ MARK HABIT endpoint reached for habit:',
      req.params.id,
      'date:',
      req.body.date
    );
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const entryData: CreateHabitEntryDto = {
        habitId: id,
        date: req.body.date || new Date().toISOString(),
        count: req.body.count || 1,
        notes: req.body.notes,
      };

      const entry = await HabitService.addHabitEntry(req.user.id, entryData);

      res.status(201).json({
        message: 'Habit entry added successfully',
        data: entry,
      });
    } catch (error) {
      console.error('Add habit entry error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to add habit entry';
      res.status(400).json({ message });
    }
  }
);

// GET /api/habits/:id/entries - Obtener entradas de un hábito
router.get(
  '/:id/entries',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log('📋 GET ENTRIES endpoint reached for habit:', req.params.id);
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const entries = await HabitService.getHabitEntries(
        id,
        req.user.id,
        startDate as string,
        endDate as string
      );

      res.json({
        message: 'Habit entries retrieved successfully',
        data: entries,
      });
    } catch (error) {
      console.error('Get habit entries error:', error);
      res.status(500).json({ message: 'Failed to retrieve habit entries' });
    }
  }
);

export default router;
