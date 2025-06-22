import { prisma } from '../config/database';
import {
  CreateHabitDto,
  UpdateHabitDto,
  HabitResponse,
  CreateHabitEntryDto,
  HabitEntryResponse,
} from '../types';

export class HabitService {
  // Obtener todos los hábitos de un usuario
  static async getUserHabits(userId: string): Promise<HabitResponse[]> {
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [
        { isActive: 'desc' }, // Activos primero
        { createdAt: 'desc' },
      ],
    });

    return habits;
  }

  // Obtener un hábito específico por ID
  static async getHabitById(
    habitId: string,
    userId: string
  ): Promise<HabitResponse | null> {
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
    });

    return habit;
  }

  // Crear nuevo hábito
  static async createHabit(
    userId: string,
    habitData: CreateHabitDto
  ): Promise<HabitResponse> {
    const { name, description, frequency = 'DAILY', target = 1 } = habitData;

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        frequency,
        target,
        userId,
        isActive: true,
      },
    });

    return habit;
  }

  // Actualizar hábito
  static async updateHabit(
    habitId: string,
    userId: string,
    habitData: UpdateHabitDto
  ): Promise<HabitResponse | null> {
    // Verificar que el hábito existe y pertenece al usuario
    const existingHabit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!existingHabit) {
      throw new Error(
        'Habit not found or you do not have permission to update it'
      );
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        ...habitData,
        updatedAt: new Date(),
      },
    });

    return updatedHabit;
  }

  // Eliminar hábito
  static async deleteHabit(habitId: string, userId: string): Promise<boolean> {
    // Verificar que el hábito existe y pertenece al usuario
    const existingHabit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!existingHabit) {
      throw new Error(
        'Habit not found or you do not have permission to delete it'
      );
    }

    // Eliminar primero las entradas del hábito
    await prisma.habitEntry.deleteMany({
      where: { habitId },
    });

    // Luego eliminar el hábito
    await prisma.habit.delete({
      where: { id: habitId },
    });

    return true;
  }

  // Marcar hábito como completado para una fecha específica
  static async addHabitEntry(
    userId: string,
    entryData: CreateHabitEntryDto
  ): Promise<HabitEntryResponse> {
    const { habitId, date, count = 1, notes } = entryData;

    // Verificar que el hábito existe y pertenece al usuario
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      throw new Error(
        'Habit not found or you do not have permission to add entries'
      );
    }

    // Verificar si ya existe una entrada para esta fecha
    const existingEntry = await prisma.habitEntry.findUnique({
      where: {
        habitId_userId_date: {
          habitId,
          userId,
          date: new Date(date),
        },
      },
    });

    if (existingEntry) {
      // Actualizar entrada existente
      const updatedEntry = await prisma.habitEntry.update({
        where: { id: existingEntry.id },
        data: {
          count: existingEntry.count + count,
          notes: notes || existingEntry.notes,
        },
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
          notes,
        },
      });
      return newEntry;
    }
  }

  // Obtener entradas de un hábito en un rango de fechas
  static async getHabitEntries(
    habitId: string,
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitEntryResponse[]> {
    const whereClause: any = {
      habitId,
      userId,
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const entries = await prisma.habitEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return entries;
  }

  // Obtener estadísticas de hábitos del usuario
  static async getHabitStats(userId: string) {
    const totalHabits = await prisma.habit.count({
      where: { userId },
    });

    const activeHabits = await prisma.habit.count({
      where: { userId, isActive: true },
    });

    // Obtener entradas de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = await prisma.habitEntry.count({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Obtener hábitos diarios activos para calcular progreso de hoy
    const dailyHabits = await prisma.habit.count({
      where: {
        userId,
        isActive: true,
        frequency: 'DAILY',
      },
    });

    return {
      total: totalHabits,
      active: activeHabits,
      todayCompleted: todayEntries,
      dailyTarget: dailyHabits,
      todayProgress:
        dailyHabits > 0 ? Math.round((todayEntries / dailyHabits) * 100) : 0,
    };
  }

  // Eliminar entrada específica de hábito por ID
  static async deleteHabitEntry(
    entryId: string,
    userId: string
  ): Promise<boolean> {
    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await prisma.habitEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!existingEntry) {
      throw new Error(
        'Habit entry not found or you do not have permission to delete it'
      );
    }

    // Eliminar la entrada
    await prisma.habitEntry.delete({
      where: { id: entryId },
    });

    return true;
  }

  // Desmarcar hábito para una fecha específica (más intuitivo para el frontend)
  static async unmarkHabitForDate(
    habitId: string,
    userId: string,
    date: string
  ): Promise<boolean> {
    console.log(
      `🔍 Attempting to unmark habit ${habitId} for user ${userId} on date ${date}`
    );

    // Verificar que el hábito existe y pertenece al usuario
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      throw new Error(
        'Habit not found or you do not have permission to modify it'
      );
    }

    // Normalizar la fecha (solo fecha, sin hora)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    console.log(
      `🔍 Looking for entry with normalized date: ${targetDate.toISOString()}`
    );

    // Buscar la entrada específica para esta fecha
    const existingEntry = await prisma.habitEntry.findFirst({
      where: {
        habitId,
        userId,
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000), // Siguiente día
        },
      },
    });

    if (!existingEntry) {
      console.log(`❌ No entry found for habit ${habitId} on date ${date}`);
      throw new Error('No habit entry found for this date');
    }

    console.log(`✅ Found entry ${existingEntry.id}, deleting...`);

    // Eliminar la entrada
    await prisma.habitEntry.delete({
      where: { id: existingEntry.id },
    });

    console.log(`✅ Successfully unmarked habit ${habitId} for date ${date}`);
    return true;
  }

  // Alternar estado activo/inactivo de un hábito
  static async toggleHabitStatus(
    habitId: string,
    userId: string
  ): Promise<HabitResponse | null> {
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        isActive: !habit.isActive,
        updatedAt: new Date(),
      },
    });

    return updatedHabit;
  }
}
