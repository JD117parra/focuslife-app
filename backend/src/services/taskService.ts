import { prisma } from '../config/database';
import { CreateTaskDto, UpdateTaskDto, TaskResponse } from '../types';

export class TaskService {
  // Obtener todas las tareas de un usuario con mejor ordenamiento por fecha
  static async getUserTasks(userId: string): Promise<TaskResponse[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [
        { dueDate: 'asc' }, // Fechas más próximas primero (null values van al final en SQLite)
        { priority: 'desc' }, // Prioridad alta primero  
        { createdAt: 'desc' } // Más recientes primero
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

  // Crear nueva tarea con validación de fecha mejorada
  static async createTask(userId: string, taskData: CreateTaskDto): Promise<TaskResponse> {
    const { title, description, dueDate, priority = 'MEDIUM', categoryId } = taskData;

    // Validar fecha de vencimiento
    let parsedDueDate: Date | null = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      
      // Verificar que la fecha sea válida
      if (isNaN(parsedDueDate.getTime())) {
        throw new Error('Invalid due date format. Please use ISO format (YYYY-MM-DD)');
      }
      
      // Verificar que la fecha no sea en el pasado (opcional - comentar si no quieres esta validación)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDueDate < today) {
        console.warn(`⚠️ Task "${title}" has due date in the past: ${dueDate}`);
        // No lanzamos error, solo advertencia
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: parsedDueDate,
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

    console.log(`✅ Task created: "${title}" ${dueDate ? `(due: ${dueDate})` : '(no due date)'}`);
    return task;
  }

  // Actualizar tarea con validación de fecha mejorada
  static async updateTask(taskId: string, userId: string, taskData: UpdateTaskDto): Promise<TaskResponse | null> {
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      throw new Error('Task not found or you do not have permission to update it');
    }

    // Validar fecha de vencimiento si se proporciona
    let parsedDueDate: Date | undefined = undefined;
    if (taskData.dueDate !== undefined) {
      if (taskData.dueDate === null || taskData.dueDate === '') {
        parsedDueDate = undefined; // Remover fecha
      } else {
        parsedDueDate = new Date(taskData.dueDate);
        
        // Verificar que la fecha sea válida
        if (isNaN(parsedDueDate.getTime())) {
          throw new Error('Invalid due date format. Please use ISO format (YYYY-MM-DD)');
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...taskData,
        dueDate: parsedDueDate,
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

  // Obtener estadísticas de tareas del usuario con información de fechas
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

    // Estadísticas adicionales por fecha
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await prisma.task.count({
      where: { 
        userId, 
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const overdueTasks = await prisma.task.count({
      where: { 
        userId, 
        dueDate: {
          lt: today
        },
        status: {
          not: 'COMPLETED'
        }
      }
    });

    const noDateTasks = await prisma.task.count({
      where: { 
        userId,
        dueDate: null
      }
    });

    return {
      total: totalTasks,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      byDate: {
        today: todayTasks,
        overdue: overdueTasks,
        noDate: noDateTasks
      }
    };
  }

  // ===== NUEVAS FUNCIONALIDADES DE FECHAS =====

  // Obtener tareas de hoy
  static async getTodayTasks(userId: string): Promise<TaskResponse[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        dueDate: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: [
        { priority: 'desc' },
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

    console.log(`📅 Found ${tasks.length} tasks for today`);
    return tasks;
  }

  // Obtener tareas vencidas (que no están completadas)
  static async getOverdueTasks(userId: string): Promise<TaskResponse[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        dueDate: {
          lt: today
        },
        status: {
          not: 'COMPLETED'
        }
      },
      orderBy: [
        { dueDate: 'desc' }, // Más recientes primero
        { priority: 'desc' }
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

    console.log(`⚠️ Found ${tasks.length} overdue tasks`);
    return tasks;
  }

  // Obtener tareas de esta semana
  static async getThisWeekTasks(userId: string): Promise<TaskResponse[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calcular inicio de la semana (lunes)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea día 1
    startOfWeek.setDate(diff);
    
    // Calcular fin de la semana (domingo)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        dueDate: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
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

    console.log(`📆 Found ${tasks.length} tasks for this week`);
    return tasks;
  }

  // Obtener tareas sin fecha de vencimiento
  static async getTasksWithoutDate(userId: string): Promise<TaskResponse[]> {
    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        dueDate: null
      },
      orderBy: [
        { priority: 'desc' },
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

    console.log(`📝 Found ${tasks.length} tasks without due date`);
    return tasks;
  }

  // Obtener tareas por rango de fechas
  static async getTasksByDateRange(userId: string, startDate: string, endDate: string): Promise<TaskResponse[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validar fechas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date range. Please use ISO format (YYYY-MM-DD)');
    }
    
    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }

    // Ajustar para incluir todo el día final
    end.setHours(23, 59, 59, 999);

    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        dueDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
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

    console.log(`📊 Found ${tasks.length} tasks between ${startDate} and ${endDate}`);
    return tasks;
  }
}