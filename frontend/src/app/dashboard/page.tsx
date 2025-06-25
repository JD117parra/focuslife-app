'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiUrls } from '@/config/api';

interface TaskStats {
  total: number;
  byStatus: {
    PENDING?: number;
    COMPLETED?: number;
    IN_PROGRESS?: number;
  };
  byDate?: {
    today?: number;
    overdue?: number;
    noDate?: number;
  };
}

interface HabitStats {
  total: number;
  active: number;
  todayCompleted: number;
  dailyTarget: number;
  todayProgress: number;
}

interface FinanceStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransactions: number;
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  count: number;
  notes?: string;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  target: number;
  isActive: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const {
    user,
    authenticatedFetch,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  // 🏆 SISTEMA DE NIVELES ÉPICOS
  const getEpicLevel = () => {
    const stats = getPlayerStats();
    const habitRanking = getHabitRanking();
    const achievements = getAchievements();
    
    // Calcular métricas para determinar el nivel épico
    const averageConsistency = habitRanking.length > 0 
      ? habitRanking.reduce((sum, habit) => sum + habit.consistency, 0) / habitRanking.length 
      : 0;
    
    const earnedAchievements = achievements.filter(a => a.earned).length;
    const totalAchievements = achievements.length;
    const achievementRate = totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0;
    
    // Calcular días activos vs días del mes (porcentaje)
    const daysInMonth = new Date().getDate();
    const monthlyActivity = daysInMonth > 0 ? (stats.uniqueDaysThisMonth / daysInMonth) * 100 : 0;
    
    // Puntuación compuesta para determinar nivel épico
    const epicScore = (
      (stats.currentStreak * 2) +  // Racha vale doble
      (averageConsistency * 1.5) + // Consistencia promedio
      (achievementRate * 1.2) +   // Porcentaje de logros
      (monthlyActivity * 1.3) +   // Actividad mensual
      (Math.min(stats.level, 20) * 5) // Nivel base (máximo 20)
    );
    
    // Determinar nivel épico basado en puntuación
    let epicLevel;
    if (epicScore >= 300) {
      epicLevel = {
        title: 'DIOS DE LOS HÁBITOS',
        emoji: '👑',
        color: 'from-yellow-300 via-yellow-400 to-yellow-500',
        textColor: 'text-yellow-100',
        description: 'Perfección absoluta',
        borderColor: 'border-yellow-400',
        glowColor: 'shadow-yellow-400/50'
      };
    } else if (epicScore >= 250) {
      epicLevel = {
        title: 'SEMI-DIOS',
        emoji: '⚡',
        color: 'from-purple-400 via-purple-500 to-purple-600',
        textColor: 'text-purple-100',
        description: 'Poder sobrenatural',
        borderColor: 'border-purple-400',
        glowColor: 'shadow-purple-400/50'
      };
    } else if (epicScore >= 200) {
      epicLevel = {
        title: 'HÉROE LEGENDARIO',
        emoji: '🦸‍♂️',
        color: 'from-blue-400 via-blue-500 to-blue-600',
        textColor: 'text-blue-100',
        description: 'Inspiración para otros',
        borderColor: 'border-blue-400',
        glowColor: 'shadow-blue-400/50'
      };
    } else if (epicScore >= 150) {
      epicLevel = {
        title: 'GUERRERO ÉLITE',
        emoji: '⚔️',
        color: 'from-red-400 via-red-500 to-red-600',
        textColor: 'text-red-100',
        description: 'Disciplina de acero',
        borderColor: 'border-red-400',
        glowColor: 'shadow-red-400/50'
      };
    } else if (epicScore >= 100) {
      epicLevel = {
        title: 'GUERRERO',
        emoji: '🛡️',
        color: 'from-orange-400 via-orange-500 to-orange-600',
        textColor: 'text-orange-100',
        description: 'Luchador incansable',
        borderColor: 'border-orange-400',
        glowColor: 'shadow-orange-400/50'
      };
    } else if (epicScore >= 60) {
      epicLevel = {
        title: 'EXPLORADOR',
        emoji: '🗺️',
        color: 'from-green-400 via-green-500 to-green-600',
        textColor: 'text-green-100',
        description: 'En busca de mejoras',
        borderColor: 'border-green-400',
        glowColor: 'shadow-green-400/50'
      };
    } else if (epicScore >= 30) {
      epicLevel = {
        title: 'APRENDIZ',
        emoji: '📚',
        color: 'from-cyan-400 via-cyan-500 to-cyan-600',
        textColor: 'text-cyan-100',
        description: 'Forjando el camino',
        borderColor: 'border-cyan-400',
        glowColor: 'shadow-cyan-400/50'
      };
    } else {
      epicLevel = {
        title: 'NOVATO',
        emoji: '🌱',
        color: 'from-gray-400 via-gray-500 to-gray-600',
        textColor: 'text-gray-100',
        description: 'Comenzando la aventura',
        borderColor: 'border-gray-400',
        glowColor: 'shadow-gray-400/50'
      };
    }
    
    return {
      ...epicLevel,
      score: Math.round(epicScore),
      nextLevelScore: getNextLevelThreshold(epicScore),
      metrics: {
        averageConsistency: Math.round(averageConsistency),
        achievementRate: Math.round(achievementRate),
        monthlyActivity: Math.round(monthlyActivity),
        currentStreak: stats.currentStreak,
        level: stats.level
      }
    };
  };
  
  // Función auxiliar para obtener el umbral del siguiente nivel
  const getNextLevelThreshold = (currentScore: number) => {
    const thresholds = [30, 60, 100, 150, 200, 250, 300];
    return thresholds.find(threshold => threshold > currentScore) || 300;
  };
  
  const getPlayerStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calcular puntos del mes actual
    const monthlyEntries = habitEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    
    const monthlyPoints = monthlyEntries.reduce((sum, entry) => sum + entry.count, 0);
    const totalPoints = habitEntries.reduce((sum, entry) => sum + entry.count, 0);
    
    // Calcular nivel basado en puntos totales
    const level = Math.floor(totalPoints / 50) + 1;
    const pointsToNextLevel = ((Math.floor(totalPoints / 50) + 1) * 50) - totalPoints;
    
    // Días únicos con al menos un hábito completado este mes
    const uniqueDaysThisMonth = new Set(
      monthlyEntries.filter(entry => entry.count > 0).map(entry => entry.date)
    ).size;
    
    // Calcular racha actual (días consecutivos)
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasAnyHabit = habitEntries.some(
        entry => entry.date === dateStr && entry.count > 0
      );
      
      if (hasAnyHabit) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return {
      level,
      totalPoints,
      monthlyPoints,
      pointsToNextLevel,
      currentStreak,
      uniqueDaysThisMonth
    };
  };
  
  const getHabitRanking = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return habits.map(habit => {
      // Obtener entradas del mes actual para este hábito
      const monthlyEntries = habitEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.habitId === habit.id && 
               entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      });
      
      // Días únicos con progreso
      const uniqueDays = new Set(monthlyEntries.map(entry => entry.date)).size;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const currentDay = new Date().getDate();
      const daysElapsed = Math.min(currentDay, daysInMonth);
      
      // Calcular consistencia basada en días transcurridos
      const consistency = daysElapsed > 0 ? (uniqueDays / daysElapsed) * 100 : 0;
      
      // Calcular puntos totales de este hábito este mes
      const monthlyPoints = monthlyEntries.reduce((sum, entry) => sum + entry.count, 0);
      
      return {
        ...habit,
        consistency: Math.round(consistency),
        streak: 0, // Simplified for dashboard
        monthlyPoints,
        uniqueDays,
        daysElapsed
      };
    }).sort((a, b) => b.consistency - a.consistency);
  };
  
  const getAchievements = () => {
    const stats = getPlayerStats();
    const achievements = [];
    
    // Logros de racha
    if (stats.currentStreak >= 30) {
      achievements.push({ 
        id: 'streak_30', 
        name: 'Maestro de la Constancia', 
        description: '30 días consecutivos', 
        emoji: '🏆', 
        color: 'from-yellow-400 to-yellow-600',
        earned: true 
      });
    } else if (stats.currentStreak >= 21) {
      achievements.push({ 
        id: 'streak_21', 
        name: 'Leyenda de Hábitos', 
        description: '21 días consecutivos', 
        emoji: '🥇', 
        color: 'from-yellow-400 to-yellow-600',
        earned: true 
      });
    } else if (stats.currentStreak >= 7) {
      achievements.push({ 
        id: 'streak_7', 
        name: 'Guerrero Semanal', 
        description: '7 días consecutivos', 
        emoji: '🥈', 
        color: 'from-gray-300 to-gray-500',
        earned: true 
      });
    } else {
      achievements.push({ 
        id: 'streak_7', 
        name: 'Guerrero Semanal', 
        description: `${stats.currentStreak}/7 días consecutivos`, 
        emoji: '🥈', 
        color: 'from-gray-200 to-gray-300',
        earned: false 
      });
    }
    
    // Logros de nivel
    if (stats.level >= 10) {
      achievements.push({ 
        id: 'level_10', 
        name: 'Veterano', 
        description: 'Nivel 10 alcanzado', 
        emoji: '⭐', 
        color: 'from-purple-400 to-purple-600',
        earned: true 
      });
    } else if (stats.level >= 5) {
      achievements.push({ 
        id: 'level_5', 
        name: 'Entusiasta', 
        description: 'Nivel 5 alcanzado', 
        emoji: '🌟', 
        color: 'from-blue-400 to-blue-600',
        earned: true 
      });
    } else {
      achievements.push({ 
        id: 'level_5', 
        name: 'Entusiasta', 
        description: `Nivel ${stats.level}/5`, 
        emoji: '🌟', 
        color: 'from-gray-200 to-gray-300',
        earned: false 
      });
    }
    
    // Logro de mes perfecto
    const daysInMonth = new Date().getDate(); // Días transcurridos
    const perfectMonth = stats.uniqueDaysThisMonth >= daysInMonth && daysInMonth >= 7;
    achievements.push({ 
      id: 'perfect_month', 
      name: 'Mes Perfecto', 
      description: perfectMonth ? 'Sin fallar ni un día' : `${stats.uniqueDaysThisMonth}/${daysInMonth} días activos`, 
      emoji: '💎', 
      color: perfectMonth ? 'from-cyan-400 to-cyan-600' : 'from-gray-200 to-gray-300',
      earned: perfectMonth 
    });
    
    return achievements;
  };

  const loadTaskStats = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.tasks.stats());

      if (response.ok) {
        const data = await response.json();
        setTaskStats(data.data);
      }
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  }, [authenticatedFetch]);

  const loadHabitStats = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.stats());

      if (response.ok) {
        const data = await response.json();
        setHabitStats(data.data);
      }
    } catch (error) {
      console.error('Error loading habit stats:', error);
    }
  }, [authenticatedFetch]);

  const loadFinanceStats = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.transactions.summary());

      if (response.ok) {
        const data = await response.json();
        setFinanceStats(data.data);
      }
    } catch (error) {
      console.error('Error loading finance stats:', error);
    }
  }, [authenticatedFetch]);

  const loadHabits = useCallback(async () => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.list());
      const data = await response.json();

      if (response.ok) {
        setHabits(data.data);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  }, [authenticatedFetch]);

  const loadHabitEntries = useCallback(async () => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const allEntries: HabitEntry[] = [];

      // Cargar entradas en paralelo
      const entryPromises = habits.map(async (habit) => {
        try {
          const response = await authenticatedFetch(
            `${apiUrls.habits.entries(habit.id)}?startDate=${startDate}&endDate=${endDate}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              return data.data.map((entry: any) => ({
                id: entry.id,
                habitId: habit.id,
                date: entry.date.split('T')[0],
                count: entry.count,
                notes: entry.notes,
              }));
            }
          }
        } catch (error) {
          console.error(`Error loading entries for habit ${habit.id}:`, error);
        }
        return [];
      });

      const results = await Promise.all(entryPromises);
      allEntries.push(...results.flat());
      setHabitEntries(allEntries);
    } catch (error) {
      console.error('Error loading habit entries:', error);
    }
  }, [habits, authenticatedFetch]);

  const loadAllStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Cargar todas las estadísticas en paralelo
      await Promise.all([
        loadTaskStats(),
        loadHabitStats(),
        loadFinanceStats(),
        loadHabits(),
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [loadTaskStats, loadHabitStats, loadFinanceStats, loadHabits, authenticatedFetch]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadAllStats();
    }
  }, [authLoading, isAuthenticated, loadAllStats]);

  useEffect(() => {
    if (habits.length > 0) {
      loadHabitEntries();
    }
  }, [habits, loadHabitEntries, authenticatedFetch]);

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-optimized flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">📊</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a la página principal
  if (!authLoading && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-optimized">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              FocusLife Dashboard
            </h1>
            <div className="flex items-center space-x-6">
              <span className="text-blue-100 mr-6 text-lg">
                ¡Hola{' '}
                <span className="font-bold text-white text-xl">
                  {user?.name || user?.email || 'Usuario'}
                </span>!
              </span>
              <Link
                href="/"
                className="text-blue-100 hover:text-white font-bold text-lg"
              >
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-shadow-medium">
            ¿Qué vamos a gestionar hoy?
          </h2>
          <p className="text-white/90 text-shadow-light">
            Elige una sección para que comencemos
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Tareas */}
          <div
            className="glass-effect glass-effect-hover shadow-lg p-8 text-center cursor-pointer"
            onClick={() => router.push('/tasks')}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2 text-shadow-medium">
              Gestión de Tareas
            </h3>
            <p className="text-white/90 text-shadow-light">
              Organiza y gestiona tus tareas diarias
            </p>
            <div className="mt-4 inline-block bg-blue-600/60 text-white px-4 py-2 rounded-lg font-medium border border-blue-400/40 hover:bg-blue-700/70 transition-colors duration-200 text-shadow-strong">
              Ir a Tareas →
            </div>
          </div>

          {/* Hábitos */}
          <div
            className="glass-effect glass-effect-hover shadow-lg p-8 text-center cursor-pointer"
            onClick={() => router.push('/habits')}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2 text-shadow-medium">
              Seguimiento de Hábitos
            </h3>
            <p className="text-white/90 text-shadow-light">
              Construye y mantén hábitos positivos
            </p>
            <div className="mt-4 inline-block bg-green-600/60 text-white px-4 py-2 rounded-lg font-medium border border-green-400/40 hover:bg-green-700/70 transition-colors duration-200 text-shadow-strong">
              Ir a Hábitos →
            </div>
          </div>

          {/* Finanzas */}
          <div
            className="glass-effect glass-effect-hover shadow-lg p-8 text-center cursor-pointer"
            onClick={() => router.push('/finances')}
          >
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2 text-shadow-medium">
              Finanzas Personales
            </h3>
            <p className="text-white/90 text-shadow-light">
              Controla tus ingresos y gastos
            </p>
            <div className="mt-4 inline-block bg-purple-600/60 text-white px-4 py-2 rounded-lg font-medium border border-purple-400/40 hover:bg-purple-700/70 transition-colors duration-200 text-shadow-strong">
              Ir a Finanzas →
            </div>
          </div>
        </div>

        {/* Widget de Resumen General */}
        <div className="glass-effect shadow-lg p-6 mt-12 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white text-shadow-medium">
                📊 Resumen General
              </h2>
            </div>
            <div className="text-sm text-white/80 text-shadow-light">
              📅{' '}
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Widget de Tareas */}
              <div className="bg-blue-500/40 shadow-lg border-2 border-blue-300/70 rounded-lg widget-stat">
                <div className="mb-3">
                  <h3 className="font-semibold text-blue-50 flex items-center text-shadow-strong">
                    📋 Tareas
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-50 text-shadow-light">
                      Pendientes
                    </span>
                    <span className="font-bold text-white text-lg text-shadow-strong">
                      {taskStats?.byStatus?.PENDING || 0}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-50 text-shadow-light">
                      Completadas
                    </span>
                    <span className="font-medium text-white text-shadow-strong">
                      {taskStats?.byStatus?.COMPLETED || 0}
                    </span>
                  </div>

                  {taskStats?.byDate && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-50 text-shadow-light">
                          Para hoy
                        </span>
                        <span className="font-medium text-white text-shadow-strong">
                          {taskStats.byDate.today || 0}
                        </span>
                      </div>

                      {taskStats.byDate.overdue > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-200 flex items-center text-shadow-light">
                            ⚠️ Vencidas
                          </span>
                          <span className="font-bold text-red-200 text-shadow-strong">
                            {taskStats.byDate.overdue}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Widget de Hábitos - Nivel Épico */}
              {habits.length > 0 ? (
                <div
                  className="bg-green-500/40 p-3 rounded-lg border-2 border-green-400/60 shadow-lg cursor-pointer transition-all duration-200 hover:bg-green-500/50"
                  onClick={() => router.push('/habits')}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-2xl animate-pulse">{getEpicLevel().emoji}</div>
                    <div>
                      <h2 className="text-base font-bold text-white mb-1" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                        {getEpicLevel().title}
                      </h2>
                      <p className="text-xs text-white/90 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                        {getEpicLevel().description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Métricas compactas */}
                  <div className="grid grid-cols-3 gap-1 mt-1 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
                      <div className="text-xs font-bold text-white">{getEpicLevel().metrics.currentStreak}</div>
                      <div className="text-xs text-white/80 font-medium">Racha</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
                      <div className="text-xs font-bold text-white">{getEpicLevel().metrics.averageConsistency}%</div>
                      <div className="text-xs text-white/80 font-medium">Consistencia</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
                      <div className="text-xs font-bold text-white">{habitStats?.active || 0}</div>
                      <div className="text-xs text-white/80 font-medium">Hábitos</div>
                    </div>
                  </div>

                  {/* Tarjeta de Nivel - Movida abajo */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                    <h4 className="text-xs font-bold text-white mb-1">Progreso de Nivel</h4>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/80">Nivel {getPlayerStats().level}</span>
                      <span className="text-xs text-white/80">{getEpicLevel().score} puntos</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-1 mb-1">
                      <div 
                        className="bg-white h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((getEpicLevel().score / getEpicLevel().nextLevelScore) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-white/80 text-center">
                      {getEpicLevel().nextLevelScore - getEpicLevel().score} puntos para siguiente nivel
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/40 shadow-lg border-2 border-green-400/60 rounded-lg widget-stat cursor-pointer" onClick={() => router.push('/habits')}>
                  <div className="mb-3">
                    <h3 className="font-semibold text-green-50 flex items-center text-shadow-strong">
                      🌱 Hábitos
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      <p className="text-green-50 text-sm text-shadow-light">
                        No tienes hábitos configurados aún
                      </p>
                      <p className="text-green-50/80 text-xs text-shadow-light mt-1">
                        ¡Comienza tu aventura!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Widget de Finanzas */}
              <div className="bg-purple-500/40 shadow-lg border-2 border-purple-400/60 rounded-lg widget-stat">
                <div className="mb-3">
                  <h3 className="font-semibold text-white flex items-center text-shadow-strong">
                    💰 Finanzas
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Balance
                    </span>
                    <span
                      className={`font-bold text-lg text-shadow-strong ${
                        (financeStats?.balance || 0) >= 0
                          ? 'text-green-200'
                          : 'text-red-200'
                      }`}
                    >
                      ${(financeStats?.balance || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Ingresos
                    </span>
                    <span className="font-medium text-green-200 text-shadow-strong">
                      +${(financeStats?.totalIncome || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Gastos
                    </span>
                    <span className="font-medium text-red-200 text-shadow-strong">
                      -${(financeStats?.totalExpenses || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/90 text-shadow-light">
                      Transacciones
                    </span>
                    <span className="font-medium text-purple-200 text-shadow-strong">
                      {financeStats?.totalTransactions || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
