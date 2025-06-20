import { prisma } from '../config/database';
import { CreateTaskDto, UpdateTaskDto, TaskResponse } from '../types';

export class TaskService {
  // Obtener todas las tareas de un usuario
  static async getUserTasks(userId: string): Promise<TaskResponse[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [
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

    return tasks;
  }

  // Obtener una tarea específica por ID
  static async getTaskById(taskId: string, userId: string): Promise<TaskResponse | null> {
    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
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

    return task;
  }

  // Crear nueva tarea
  static async createTask(userId: string, taskData: CreateTaskDto): Promise<TaskResponse> {
    const { title, description, dueDate, priority = 'MEDIUM', categoryId } = taskData;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        categoryId,
        userId,
        status: 'PENDING'
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

    return task;
  }

  // Actualizar tarea
  static async updateTask(taskId: string, userId: string, taskData: UpdateTaskDto): Promise<TaskResponse | null> {
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      throw new Error('Task not found or you do not have permission to update it');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
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

    return updatedTask;
  }

  // Eliminar tarea
  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      throw new Error('Task not found or you do not have permission to delete it');
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    return true;
  }

  // Marcar tarea como completada
  static async completeTask(taskId: string, userId: string): Promise<TaskResponse | null> {
    return this.updateTask(taskId, userId, { status: 'COMPLETED' });
  }

  // Obtener estadísticas de tareas del usuario
  static async getTaskStats(userId: string) {
    const stats = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        id: true
      }
    });

    const totalTasks = await prisma.task.count({
      where: { userId }
    });

    return {
      total: totalTasks,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Obtener tareas vencidas para el widget de resumen
  static async getOverdueTasks(userId: string): Promise<TaskResponse[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fin del día

    const overdueTasks = await prisma.task.findMany({
      where: {
        userId,
        status: {
          not: 'COMPLETED'
        },
        dueDate: {
          lte: today
        }
      },
      orderBy: {
        dueDate: 'asc'
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

    return overdueTasks;
  }

  // Obtener tareas completadas recientes para logros
  static async getRecentCompletedTasks(userId: string, days: number = 1): Promise<number> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    targetDate.setHours(0, 0, 0, 0);

    const completedCount = await prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: {
          gte: targetDate
        }
      }
    });

    return completedCount;
  }
}