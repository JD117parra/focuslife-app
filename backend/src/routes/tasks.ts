import { Router, Response } from 'express';
import { TaskService } from '../services/taskService';
import { CreateTaskDto, UpdateTaskDto } from '../types';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/tasks - Obtener todas las tareas del usuario
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const tasks = await TaskService.getUserTasks(req.user.id);

    res.json({
      message: 'Tasks retrieved successfully',
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to retrieve tasks' });
  }
});

// GET /api/tasks/stats - Obtener estadísticas de tareas
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const stats = await TaskService.getTaskStats(req.user.id);

    res.json({
      message: 'Task stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve task stats' });
  }
});

// GET /api/tasks/:id - Obtener una tarea específica
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const task = await TaskService.getTaskById(id, req.user.id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({
      message: 'Task retrieved successfully',
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Failed to retrieve task' });
  }
});

// POST /api/tasks - Crear nueva tarea
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const taskData: CreateTaskDto = req.body;

    if (!taskData.title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const task = await TaskService.createTask(req.user.id, taskData);

    res.status(201).json({
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create task';
    res.status(400).json({ message });
  }
});

// PUT /api/tasks/:id - Actualizar tarea
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const taskData: UpdateTaskDto = req.body;

    const task = await TaskService.updateTask(id, req.user.id, taskData);

    res.json({
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update task';
    res.status(400).json({ message });
  }
});

// PATCH /api/tasks/:id/complete - Marcar tarea como completada
router.patch('/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const task = await TaskService.completeTask(id, req.user.id);

    res.json({
      message: 'Task completed successfully',
      data: task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    const message = error instanceof Error ? error.message : 'Failed to complete task';
    res.status(400).json({ message });
  }
});

// DELETE /api/tasks/:id - Eliminar tarea
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    await TaskService.deleteTask(id, req.user.id);

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    res.status(400).json({ message });
  }
});

export default router;