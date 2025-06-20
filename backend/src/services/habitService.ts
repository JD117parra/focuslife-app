import { prisma } from '../config/database';
import { CreateHabitDto, UpdateHabitDto, HabitResponse, CreateHabitEntryDto, HabitEntryResponse } from '../types';

export class HabitService {
  // Obtener todos los hábitos de un usuario con información completa
  static async getUserHabits(userId: string): Promise<any[]> {
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [
        { isActive: 'desc' }, // Activos primero
        { createdAt: 'desc' }
      ]
    });

    // Enriquecer cada hábito con estadísticas
    const enrichedHabits = await Promise.all(
      habits.map(async (habit) => {
        try {
          const [streak, dailyProgress, weeklyProgress] = await Promise.all([
            this.calculateHabitStreak(habit.id, userId),
            this.getHabitDailyProgress(habit.id, userId),
            this.getHabitWeeklyProgress(habit.id, userId)
          ]);

          return {
            ...habit,
            streak,
            dailyProgress,
            weeklyProgress
          };
        } catch (error) {
          console.error(`Error calculating stats for habit ${habit.id}:`, error);
          // En caso de error, devolver el hábito con valores por defecto
          return {
            ...habit,
            streak: 0,
            dailyProgress: { current: 0, target: habit.target },
            weeklyProgress: { completed: 0, total: 7, percentage: 0 }
          };
        }
      })
    );

    return enrichedHabits;
  }

  // Obtener un hábito específico por ID
  static async getHabitById(habitId: string, userId: string): Promise<HabitResponse | null> {
    const habit = await prisma.habit.findFirst({
      where: { 
        id: habitId,
        userId 
      }
    });

    return habit;
  }

  // Crear nuevo hábito
  static async createHabit(userId: string, habitData: CreateHabitDto): Promise<HabitResponse> {
    const { name, description, frequency = 'DAILY', target = 1 } = habitData;

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        frequency,
        target,
        userId,
        isActive: true
      }
    });

    return habit;
  }

  // Actualizar hábito
  static async updateHabit(habitId: string, userId: string, habitData: UpdateHabitDto): Promise<HabitResponse | null> {
    // Verificar que el hábito existe y pertenece al usuario
    const existingHabit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!existingHabit) {
      throw new Error('Habit not found or you do not have permission to update it');
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        ...habitData,
        updatedAt: new Date()
      }
    });

    return updatedHabit;
  }

  // Eliminar hábito
  static async deleteHabit(habitId: string, userId: string): Promise<boolean> {
    // Verificar que el hábito existe y pertenece al usuario
    const existingHabit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!existingHabit) {
      throw new Error('Habit not found or you do not have permission to delete it');
    }

    // Eliminar primero las entradas del hábito
    await prisma.habitEntry.deleteMany({
      where: { habitId }
    });

    // Luego eliminar el hábito
    await prisma.habit.delete({
      where: { id: habitId }
    });

    return true;
  }

  // Marcar hábito como completado para una fecha específica
  static async addHabitEntry(userId: string, entryData: CreateHabitEntryDto): Promise<HabitEntryResponse> {
    const { habitId, date, count = 1, notes } = entryData;

    // Verificar que el hábito existe y pertenece al usuario
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      throw new Error('Habit not found or you do not have permission to add entries');
    }

    // Verificar si ya existe una entrada para esta fecha
    const existingEntry = await prisma.habitEntry.findUnique({
      where: {
        habitId_userId_date: {
          habitId,
          userId,
          date: new Date(date)
        }
      }
    });

    if (existingEntry) {
      // Actualizar entrada existente
      const updatedEntry = await prisma.habitEntry.update({
        where: { id: existingEntry.id },
        data: {
          count: existingEntry.count + count,
          notes: notes || existingEntry.notes
        }
      });
      return updatedEntry;
    } else {
      // Crear nueva entrada
      const newEntry = await prisma.habitEntry.create({
        data: {
          habitId,
          userId,
          date: new Date(date),
          count,
          notes
        }
      });
      return newEntry;
    }
  }

  // Obtener entradas de un hábito en un rango de fechas
  static async getHabitEntries(habitId: string, userId: string, startDate?: string, endDate?: string): Promise<HabitEntryResponse[]> {
    const whereClause: any = {
      habitId,
      userId
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const entries = await prisma.habitEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    return entries;
  }

  // Obtener estadísticas de hábitos del usuario
  static async getHabitStats(userId: string) {
    const totalHabits = await prisma.habit.count({
      where: { userId }
    });

    const activeHabits = await prisma.habit.count({
      where: { userId, isActive: true }
    });

    // Obtener entradas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = await prisma.habitEntry.count({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // Obtener hábitos diarios activos para calcular progreso de hoy
    const dailyHabits = await prisma.habit.count({
      where: {
        userId,
        isActive: true,
        frequency: 'DAILY'
      }
    });

    return {
      total: totalHabits,
      active: activeHabits,
      todayCompleted: todayEntries,
      dailyTarget: dailyHabits,
      todayProgress: dailyHabits > 0 ? Math.round((todayEntries / dailyHabits) * 100) : 0
    };
  }

  // Alternar estado activo/inactivo de un hábito
  static async toggleHabitStatus(habitId: string, userId: string): Promise<HabitResponse | null> {
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        isActive: !habit.isActive,
        updatedAt: new Date()
      }
    });

    return updatedHabit;
  }

  // Eliminar entrada de hábito para una fecha específica
  static async deleteHabitEntry(habitId: string, userId: string, date?: string): Promise<boolean> {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Verificar que el hábito existe y pertenece al usuario
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      throw new Error('Habit not found or you do not have permission to modify entries');
    }

    // Buscar y eliminar la entrada para la fecha específica
    const deletedEntry = await prisma.habitEntry.deleteMany({
      where: {
        habitId,
        userId,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    });

    return deletedEntry.count > 0;
  }

  // Calcular la racha de un hábito específico
  static async calculateHabitStreak(habitId: string, userId: string): Promise<number> {
    // Obtener todas las entradas del hábito ordenadas por fecha descendente
    const entries = await prisma.habitEntry.findMany({
      where: {
        habitId,
        userId
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (entries.length === 0) {
      return 0;
    }

    // Crear un Set con las fechas donde se completó el hábito
    const completedDates = new Set(
      entries.map(entry => {
        const date = new Date(entry.date);
        // Normalizar a medianoche para comparación exacta
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Calcular la racha empezando desde hoy hacia atrás
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Empezar desde hoy y ir hacia atrás día por día
    let currentDate = new Date(today);
    
    while (completedDates.has(currentDate.getTime())) {
      streak++;
      // Retroceder un día
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  // Calcular el progreso diario de un hábito
  static async getHabitDailyProgress(habitId: string, userId: string, date?: string): Promise<{ current: number; target: number }> {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Obtener el hábito para conocer el target
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    // Obtener las entradas para la fecha específica
    const entry = await prisma.habitEntry.findFirst({
      where: {
        habitId,
        userId,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    });

    return {
      current: entry ? entry.count : 0,
      target: habit.target
    };
  }

  // Calcular el progreso semanal de un hábito
  static async getHabitWeeklyProgress(habitId: string, userId: string): Promise<{ completed: number; total: number; percentage: number }> {
    // Obtener el inicio de la semana (lunes)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajustar para que lunes sea 0
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Obtener entradas de esta semana
    const weeklyEntries = await prisma.habitEntry.findMany({
      where: {
        habitId,
        userId,
        date: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    // Obtener el hábito para conocer la frecuencia
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    // Calcular días objetivo basado en la frecuencia
    let targetDays = 7; // Por defecto, diario
    
    // Parsear la frecuencia si está en formato "X days per week"
    const frequencyMatch = habit.frequency.match(/(\d+)\s*days?\s*per\s*week/i);
    if (frequencyMatch) {
      targetDays = parseInt(frequencyMatch[1]);
    } else if (habit.frequency.toLowerCase().includes('daily')) {
      targetDays = 7;
    }

    const completed = weeklyEntries.length;
    const percentage = targetDays > 0 ? Math.round((completed / targetDays) * 100) : 0;

    return {
      completed,
      total: targetDays,
      percentage
    };
  }

  // Obtener hábitos diarios no completados hoy para el widget de resumen
  static async getTodayIncompleteHabits(userId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener todos los hábitos activos (no solo DAILY)
    const allActiveHabits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true
      }
    });

    // Filtrar hábitos que deberían completarse hoy
    const todayHabits = allActiveHabits.filter(habit => {
      const freq = habit.frequency.toLowerCase();
      
      // Considerar como "hábitos de hoy" los que:
      // 1. Son exactamente 'daily'
      // 2. Son '7 days per week' (diario)
      // 3. Son '5 days per week' o '6 days per week' (días laborales)
      // 4. Cualquier otro formato que implique frecuencia diaria/regular
      
      return (
        freq === 'daily' ||
        freq.includes('7 days per week') ||
        freq.includes('6 days per week') ||
        freq.includes('5 days per week') ||
        freq.includes('4 days per week') ||
        freq.includes('3 days per week')
        // Para 3+ días por semana, asumimos que hoy podría ser uno de esos días
      );
    });

    // Obtener entradas de hoy
    const todayEntries = await prisma.habitEntry.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Crear un Set de hábitos completados hoy
    const completedHabitIds = new Set(todayEntries.map(entry => entry.habitId));

    // Filtrar hábitos no completados
    const incompleteHabits = todayHabits.filter(habit => !completedHabitIds.has(habit.id));

    return incompleteHabits;
  }

  // Obtener racha más larga para logros
  static async getLongestStreak(userId: string): Promise<{ habitName: string; streak: number } | null> {
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true }
    });

    let longestStreak = 0;
    let bestHabit = null;

    for (const habit of habits) {
      const streak = await this.calculateHabitStreak(habit.id, userId);
      if (streak > longestStreak) {
        longestStreak = streak;
        bestHabit = habit;
      }
    }

    return bestHabit ? { habitName: bestHabit.name, streak: longestStreak } : null;
  }
}