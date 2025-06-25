'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { useEditModal } from '@/hooks/useEditModal';
import { EditHabitModal, ItemActionModal, TemplateModal } from '@/components/ui';
import { apiUrls } from '@/config/api';

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  target: number;
  isActive: boolean;
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  count: number;
  notes?: string;
}

// 🎨 FUNCIÓN DE ICONOS SIMPLE
const getHabitIcon = (habitName: string) => {
  const name = habitName.toLowerCase();
  
  if (name.includes('ejercicio') || name.includes('gym') || name.includes('deporte')) return '🏃‍♂️';
  if (name.includes('leer') || name.includes('lectura')) return '📚';
  if (name.includes('meditar') || name.includes('meditación')) return '🧘‍♀️';
  if (name.includes('agua') || name.includes('beber')) return '💧';
  if (name.includes('temprano') || name.includes('despertar')) return '🌅';
  if (name.includes('estudiar') || name.includes('aprender')) return '📝';
  if (name.includes('gratitud') || name.includes('agradecer')) return '🙏';
  if (name.includes('diario') || name.includes('escribir')) return '📔';
  if (name.includes('aire libre') || name.includes('naturaleza')) return '🌿';
  if (name.includes('digital') || name.includes('pantalla')) return '📵';
  if (name.includes('organizar') || name.includes('limpiar')) return '🧹';
  if (name.includes('creativo') || name.includes('arte')) return '🎨';
  if (name.includes('cocinar')) return '👨‍🍳';
  if (name.includes('caminar') || name.includes('paso')) return '🚶‍♂️';
  if (name.includes('dormir') || name.includes('sueño')) return '😴';
  if (name.includes('saludable') || name.includes('fruta')) return '🥗';
  if (name.includes('familia') || name.includes('llamar')) return '📞';
  if (name.includes('música') || name.includes('instrumento')) return '🎸';
  if (name.includes('vitamina')) return '💊';
  if (name.includes('yoga') || name.includes('estir')) return '🧘‍♀️';
  return '⭐';
};

// 🌟 PLANTILLAS SIMPLES
// Movidas a TemplateModal.tsx - este array ya no se usa
// pero se mantiene por compatibilidad hasta confirmar funcionamiento

// 🎮 FUNCIONES DE GAMIFICACIÓN
const getStreakLevel = (streak: number) => {
  if (streak >= 21) return { level: 'gold', emoji: '🥇', color: 'from-yellow-400 to-yellow-600', text: 'text-yellow-700' };
  if (streak >= 7) return { level: 'silver', emoji: '🥈', color: 'from-gray-300 to-gray-500', text: 'text-gray-700' };
  if (streak >= 1) return { level: 'bronze', emoji: '🥉', color: 'from-orange-400 to-orange-600', text: 'text-orange-700' };
  return { level: 'none', emoji: '–', color: 'from-gray-200 to-gray-300', text: 'text-gray-600' };
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el filtro de vista
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'HABITS'>('DASHBOARD');
  
  // Control para evitar duplicación de notificación de bienvenida
  const welcomeShownRef = useRef(false);

  // Estado para el modal de hábitos
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // Estado para el modal de acciones
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  // Estado para el modal de plantillas
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // Estado para mostrar/ocultar la sección de logros
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Estado para mostrar/ocultar el calendario de actividad
  const [showCalendar, setShowCalendar] = useState(false);
  
  const { authenticatedFetch, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const editModal = useEditModal();

  // 📊 FUNCIONES SIMPLES - Sin useCallback innecesario
  const loadHabits = async () => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.list());
      const data = await response.json();

      if (response.ok) {
        setHabits(data.data);
      } else {
        toast.error('Error cargando hábitos: ' + data.message);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadHabitEntries = async () => {
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
  };

  // Funciones CRUD simples
  const createHabitComplete = async (habitData: any) => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.create(), {
        method: 'POST',
        body: JSON.stringify(habitData),
      });

      const data = await response.json();
      if (response.ok) {
        setHabits(prev => [...prev, data.data]);
        await loadHabitEntries();
        toast.success('¡Hábito creado exitosamente!');
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const updateHabitComplete = async (habitId: string, habitData: any) => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.update(habitId), {
        method: 'PUT',
        body: JSON.stringify(habitData),
      });

      const data = await response.json();
      if (response.ok) {
        setHabits(prev => prev.map((habit: Habit) => 
          habit.id === habitId ? { ...habit, ...data.data } : habit
        ));
        toast.success('¡Hábito editado exitosamente!');
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const deleteHabit = async (habitId: string, habitName: string) => {
    const confirmed = await confirm.confirmDelete(habitName);
    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(apiUrls.habits.delete(habitId), {
        method: 'DELETE',
      });

      if (response.ok) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        toast.delete('¡Hábito eliminado exitosamente!');
      } else {
        const data = await response.json();
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadHabits();
      
      // Toast de bienvenida - solo una vez
      if (!welcomeShownRef.current) {
        welcomeShownRef.current = true;
        setTimeout(() => {
          toast.welcome(
            `¡Ánimo con esos hábitos ${user?.name || user?.email || 'Usuario'}! 🎯`,
            4000
          );
        }, 500);
      }
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (habits.length > 0) {
      loadHabitEntries();
    }
  }, [habits]);

  // Funciones para manejar el modal
  const openCreateHabitModal = () => {
    setEditingHabit(null);
    setIsEditingMode(false);
    setIsHabitModalOpen(true);
  };

  const openEditHabitModal = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditingMode(true);
    setIsHabitModalOpen(true);
  };

  // Funciones para manejar el modal de plantillas
  const openTemplateModal = () => {
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const handleTemplateSelect = (template: any) => {
    // Convertir template a formato de hábito
    const templateHabit = {
      name: template.name,
      description: template.description,
      frequency: 'DAILY',
      target: 1,
      isActive: true,
    };
    
    closeTemplateModal();
    setEditingHabit(templateHabit as any);
    setIsEditingMode(false);
    setIsHabitModalOpen(true);
  };

  const handleCreateFromScratch = () => {
    closeTemplateModal();
    openCreateHabitModal();
  };

  const closeHabitModal = () => {
    setIsHabitModalOpen(false);
    setEditingHabit(null);
    setIsEditingMode(false);
  };

  const handleHabitModalConfirm = async (habitData: any) => {
    if (isEditingMode && editingHabit?.id) {
      await updateHabitComplete(editingHabit.id, habitData);
    } else {
      await createHabitComplete(habitData);
    }
    closeHabitModal();
  };

  // Funciones para el modal de acciones
  const openActionModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedHabit(null);
  };

  const handleEditFromAction = () => {
    if (selectedHabit) {
      closeActionModal();
      openEditHabitModal(selectedHabit);
    }
  };

  const handleDeleteFromAction = () => {
    if (selectedHabit) {
      closeActionModal();
      deleteHabit(selectedHabit.id, selectedHabit.name);
    }
  };

  // 🧮 Funciones de cálculo SIMPLES - Sin memoización innecesaria
  const getTodayProgress = (habitId: string, target: number) => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = habitEntries.filter(
      entry => entry.habitId === habitId && entry.date === today
    );
    const todayCount = todayEntries.reduce((sum, entry) => sum + entry.count, 0);
    return { completed: todayCount, target };
  };

  const getStreak = (habitId: string) => {
    let streakCount = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasEntry = habitEntries.some(
        entry => entry.habitId === habitId && entry.date === dateStr && entry.count > 0
      );

      if (hasEntry) {
        streakCount++;
      } else if (i > 0) {
        break;
      }
    }
    return streakCount;
  };

  const getWeeklyProgress = (habitId: string) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    let completedDays = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasEntry = habitEntries.some(
        entry => entry.habitId === habitId && entry.date === dateStr && entry.count > 0
      );

      if (hasEntry) completedDays++;
    }

    return {
      completed: completedDays,
      total: 7,
      percentage: Math.round((completedDays / 7) * 100),
    };
  };

  const toggleHabitComplete = async (habitId: string, target: number) => {
    const today = new Date().toISOString().split('T')[0];
    const { completed } = getTodayProgress(habitId, target);
    const isCurrentlyCompleted = completed >= target;

    if (isCurrentlyCompleted) {
      await unmarkHabitComplete(habitId, today);
    } else {
      await markHabitComplete(habitId, target, today);
    }
  };

  const markHabitComplete = async (habitId: string, target: number, today: string) => {
    try {
      const response = await authenticatedFetch(apiUrls.habits.entries(habitId), {
        method: 'POST',
        body: JSON.stringify({ date: today, count: 1 }),
      });

      const data = await response.json();
      if (response.ok) {
        if (!data.data?.id) {
          toast.error('Error: El servidor no devolvió un ID válido');
          return;
        }

        const newEntry: HabitEntry = {
          id: data.data.id,
          habitId,
          date: today,
          count: 1,
        };
        
        setHabitEntries(prev => [...prev, newEntry]);

        const newCompleted = getTodayProgress(habitId, target).completed + 1;
        if (newCompleted >= target) {
          toast.success('¡Meta del día completada! 🎉');
        } else {
          toast.success(`Progreso: ${newCompleted}/${target} ¡Sigue así!`);
        }
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error marking habit complete:', error);
      toast.error('Error de conexión con el servidor');
    }
  };

  const unmarkHabitComplete = async (habitId: string, today: string) => {
    try {
      const todayEntries = habitEntries.filter(
        entry => entry.habitId === habitId && entry.date === today
      );

      if (todayEntries.length === 0) {
        toast.warning('No hay entradas que desmarcar');
        return;
      }

      const entryToDelete = todayEntries[todayEntries.length - 1];
      const response = await authenticatedFetch(apiUrls.habits.deleteEntry(entryToDelete.id), {
        method: 'DELETE',
      });

      if (response.ok) {
        setHabitEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
        toast.success('Hábito desmarcado');
      } else {
        const data = await response.json();
        toast.error('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error unmarking habit:', error);
      toast.error('Error de conexión con el servidor');
    }
  };

  // 🎮 FUNCIONES DE GAMIFICACIÓN Y ANÁLISIS
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
  
  const getCalendarHeatmapData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const heatmapData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Contar hábitos completados ese día
      const dayEntries = habitEntries.filter(
        entry => entry.date === dateStr && entry.count > 0
      );
      
      const completedHabits = dayEntries.length;
      const maxPossibleHabits = habits.length;
      
      // Calcular intensidad (0-4 niveles)
      let intensity = 0;
      if (completedHabits > 0) {
        const percentage = (completedHabits / Math.max(maxPossibleHabits, 1)) * 100;
        if (percentage >= 100) intensity = 4;
        else if (percentage >= 75) intensity = 3;
        else if (percentage >= 50) intensity = 2;
        else intensity = 1;
      }
      
      heatmapData.push({
        day,
        date: dateStr,
        completedHabits,
        maxPossibleHabits,
        intensity,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' })
      });
    }
    
    return heatmapData;
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
      
      // Obtener racha actual para este hábito
      const habitStreak = getStreak(habit.id);
      
      // Calcular puntos totales de este hábito este mes
      const monthlyPoints = monthlyEntries.reduce((sum, entry) => sum + entry.count, 0);
      
      return {
        ...habit,
        consistency: Math.round(consistency),
        streak: habitStreak,
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

  // 🎨 RENDERIZADO DIRECTO DE HÁBITOS - Como en tareas
  const renderHabits = () => {
    return habits.map((habit) => {
      const todayProgress = getTodayProgress(habit.id, habit.target);
      const streak = getStreak(habit.id);
      const weeklyProgress = getWeeklyProgress(habit.id);
      const isCompleted = todayProgress.completed >= todayProgress.target;
      const streakLevel = getStreakLevel(streak);
      
      // 🏆 Colores planos según nivel de logro
      const getCardStyles = (level: string) => {
        switch (level) {
          case 'gold':
            return 'bg-yellow-100 border-2 border-yellow-300 shadow-lg';
          case 'silver':
            return 'bg-gray-100 border-2 border-gray-300 shadow-lg';
          case 'bronze':
            return 'bg-orange-100 border-2 border-orange-300 shadow-lg';
          default:
            return 'bg-white border-2 border-gray-200 shadow-lg';
        }
      };

      return (
        <div key={habit.id} className={`${getCardStyles(streakLevel.level)} rounded-lg p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200`} onClick={() => openActionModal(habit)}>
          {/* Header with icon and name */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getHabitIcon(habit.name)}</span>
              <h3 className="font-bold text-gray-800 text-base leading-tight">
                {habit.name}
              </h3>
            </div>
          </div>

          {/* Frequency and target info */}
          <p className="text-gray-600 font-medium text-sm mb-3">
            {habit.frequency} | Meta: {habit.target} vez(es)
          </p>

          {/* Toggle button centered */}
          <div className="flex justify-center mb-4">
            <button
              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 ${
                isCompleted
                  ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                  : 'border-blue-500 bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleHabitComplete(habit.id, habit.target);
              }}
              title={isCompleted ? 'Click para desmarcar' : 'Click para marcar como completado'}
            >
              <span className="text-3xl font-bold">{isCompleted ? '✓' : '+' }</span>
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-600 mb-1">
                Hoy
              </div>
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 shadow-lg ${
                  isCompleted
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300'
                }`}
              >
                {todayProgress.completed}/{todayProgress.target}
              </div>
              {isCompleted && (
                <div className="text-xs text-green-600 mt-1 font-bold">
                  ¡Completado!
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-gray-600 mb-1">
                Racha {streakLevel.emoji}
              </div>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 bg-gradient-to-br ${streakLevel.color} border-white shadow-lg`}>
                <span className={`text-white font-bold ${streak > 0 ? 'text-base' : 'text-lg'}`}>
                  {streak > 0 ? streak : '–'}
                </span>
              </div>
              {streak > 0 && (
                <div className={`text-xs font-bold mt-1 ${streakLevel.text}`}>
                  {streakLevel.level === 'gold' && 'Leyenda'}
                  {streakLevel.level === 'silver' && 'Experto'}
                  {streakLevel.level === 'bronze' && 'En marcha'}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2 font-bold">
              <span>Progreso semanal</span>
              <span>
                {weeklyProgress.completed}/{weeklyProgress.total} días
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${weeklyProgress.percentage}%` }}
              ></div>
            </div>
          </div>


        </div>
      );
    });
  };

  // 🎮 RENDERIZADO DEL DASHBOARD DE GAMIFICACIÓN
  const renderGamificationDashboard = () => {
    const stats = getPlayerStats();
    const heatmapData = getCalendarHeatmapData();
    const habitRanking = getHabitRanking();
    const achievements = getAchievements();
    const epicLevel = getEpicLevel();
    const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    // Función para obtener color del calendario
    const getHeatmapColor = (intensity: number) => {
      switch (intensity) {
        case 4: return 'bg-green-600'; // 100%
        case 3: return 'bg-green-500'; // 75%+
        case 2: return 'bg-green-400'; // 50%+
        case 1: return 'bg-green-300'; // 25%+
        default: return 'bg-gray-200'; // 0%
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Nivel Épico - Sección Principal */}
        <div className="bg-green-500/40 p-3 rounded-lg border-2 border-green-400/60 shadow-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-3xl animate-pulse">{epicLevel.emoji}</div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                  {epicLevel.title}
                </h2>
                <p className="text-xs text-white/90 font-medium" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                  {epicLevel.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-white/80 font-bold">
                    Puntuación: {epicLevel.score}
                  </span>
                  <span className="text-xs text-white/80">
                    • Siguiente nivel: {epicLevel.nextLevelScore}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                <h4 className="text-xs font-bold text-white mb-1">Progreso al siguiente nivel</h4>
                <div className="w-32 bg-white/30 rounded-full h-1 mb-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((epicLevel.score / epicLevel.nextLevelScore) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/80">
                  {epicLevel.nextLevelScore - epicLevel.score} puntos restantes
                </p>
              </div>
            </div>
          </div>
          
          {/* Métricas completas unificadas */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-1 mt-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
              <div className="text-xl mb-1">🎆</div>
              <div className="text-xs font-bold text-white">Nivel {stats.level}</div>
              <div className="text-xs text-white/80 font-medium">{stats.pointsToNextLevel} XP para subir</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
              <div className="text-xl mb-1">💎</div>
              <div className="text-xs font-bold text-white">{stats.monthlyPoints}</div>
              <div className="text-xs text-white/80 font-medium">XP Este Mes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
              <div className="text-xl mb-1">🔥</div>
              <div className="text-xs font-bold text-white">{epicLevel.metrics.currentStreak} días</div>
              <div className="text-xs text-white/80 font-medium">Racha Actual</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center cursor-pointer hover:bg-white/30 transition-all duration-200" onClick={() => setShowCalendar(!showCalendar)}>
              <div className="text-xl mb-1">📅</div>
              <div className="text-xs font-bold text-white">{stats.uniqueDaysThisMonth}</div>
              <div className="text-xs text-white/80 font-medium">Días Activos</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
              <div className="text-xl mb-1">🎯</div>
              <div className="text-xs font-bold text-white">{epicLevel.metrics.averageConsistency}%</div>
              <div className="text-xs text-white/80 font-medium">Consistencia</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center cursor-pointer hover:bg-white/30 transition-all duration-200" onClick={() => setShowAchievements(!showAchievements)}>
              <div className="text-xl mb-1">🏆</div>
              <div className="text-xs font-bold text-white">{epicLevel.metrics.achievementRate}%</div>
              <div className="text-xs text-white/80 font-medium">Logros</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 text-center">
              <div className="text-xl mb-1">📈</div>
              <div className="text-xs font-bold text-white">{epicLevel.metrics.monthlyActivity}%</div>
              <div className="text-xs text-white/80 font-medium">Actividad</div>
            </div>
          </div>
        </div>

        {/* Calendario de Calor y Logros */}
        {(showCalendar || showAchievements) && (
          <div className={`grid gap-6 ${
            showCalendar && showAchievements 
              ? 'grid-cols-1 lg:grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {/* Calendario de Calor - Solo se muestra si showCalendar es true */}
            {showCalendar && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                    🔥 Calendario de Actividad
                  </h4>
                  <button 
                    onClick={() => setShowCalendar(false)}
                    className="text-white/70 hover:text-white transition-colors duration-200 text-xl"
                    title="Cerrar calendario de actividad"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-white/70 p-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {heatmapData.map((dayData) => {
                    const today = new Date().getDate();
                    const isToday = dayData.day === today;
                    const isFuture = dayData.day > today;
                    
                    return (
                      <div 
                        key={dayData.day}
                        className={`
                          aspect-square rounded text-xs font-bold flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer
                          ${getHeatmapColor(dayData.intensity)}
                          ${isToday ? 'ring-2 ring-white' : ''}
                          ${isFuture ? 'opacity-30' : ''}
                        `}
                        title={`${dayData.day}: ${dayData.completedHabits}/${dayData.maxPossibleHabits} hábitos`}
                      >
                        <span className={`${dayData.intensity > 0 ? 'text-white' : 'text-gray-600'}`}>
                          {dayData.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-white/70">
                  <span>Menos</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="w-3 h-3 bg-green-300 rounded"></div>
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                  </div>
                  <span>Más</span>
                </div>
              </div>
            )}

            {/* Logros y Medallas - Solo se muestra si showAchievements es true */}
            {showAchievements && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                    🏆 Logros
                  </h4>
                  <button 
                    onClick={() => setShowAchievements(false)}
                    className="text-white/70 hover:text-white transition-colors duration-200 text-xl"
                    title="Cerrar sección de logros"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`
                      flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
                      ${achievement.earned 
                        ? 'bg-white/30 border-white/40 shadow-lg' 
                        : 'bg-white/10 border-white/20'
                      }
                    `}>
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${achievement.color} shadow-lg
                        ${achievement.earned ? '' : 'grayscale opacity-50'}
                      `}>
                        {achievement.emoji}
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-bold ${achievement.earned ? 'text-white' : 'text-white/60'}`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                          {achievement.name}
                        </h5>
                        <p className={`text-sm ${achievement.earned ? 'text-white/80' : 'text-white/50'}`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <div className="text-green-300 text-xl">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ranking de Hábitos */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
          <h4 className="text-lg font-bold text-white mb-4" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
            📊 Ranking de Consistencia
          </h4>
          <div className="space-y-3">
            {habitRanking.map((habit, index) => {
              const podiumEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
              const consistencyColor = habit.consistency >= 90 ? 'text-green-200' : 
                                     habit.consistency >= 70 ? 'text-blue-200' :
                                     habit.consistency >= 50 ? 'text-yellow-200' : 'text-red-200';
              
              return (
                <div key={habit.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {typeof podiumEmoji === 'string' && podiumEmoji.startsWith('#') ? (
                        <span className="text-white/70 font-bold">{podiumEmoji}</span>
                      ) : (
                        podiumEmoji
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getHabitIcon(habit.name)}</span>
                      <div>
                        <h5 className="font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                          {habit.name}
                        </h5>
                        <p className="text-sm text-white/70">
                          {habit.uniqueDays}/{habit.daysElapsed} días activos | Racha: {habit.streak}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${consistencyColor}`} style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                      {habit.consistency}%
                    </p>
                    <p className="text-sm text-white/70">
                      {habit.monthlyPoints} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {habitRanking.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌱</div>
              <p className="text-white font-bold" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                Crea hábitos para ver tu ranking de consistencia
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Funciones para manejar filtros
  const handleViewChange = (view: 'DASHBOARD' | 'HABITS') => {
    setActiveView(view);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <p className="text-white mt-2">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!authLoading && typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <p className="text-white mt-2">Cargando hábitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-100 hover:text-white">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">🎯 Seguimiento de Hábitos</h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white font-bold text-lg">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Predefined Habits Section */}
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 p-6 rounded-lg mb-8">
          {/* Create Custom Habit Button */}
          <div className="mb-6 px-4">
            <button
              onClick={openTemplateModal}
              className="w-full bg-purple-600/70 backdrop-blur-md text-white px-6 py-4 rounded-lg font-bold border border-purple-400/70 hover:bg-purple-700/80 transition-all duration-150 shadow-lg text-base"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              🌟 Crear Nuevo Hábito
            </button>
          </div>
        </div>

        {/* Dashboard/Habits Section */}
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg">
          <div className="p-6 border-b border-white/40">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-bold text-white"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                {activeView === 'DASHBOARD' 
                  ? `Dashboard de Hábitos (${habits.length} hábitos)`
                  : `Mis Hábitos (${habits.length})`
                }
                {activeView !== 'DASHBOARD' && (
                  <button
                    onClick={() => handleViewChange('DASHBOARD')}
                    className="ml-3 text-sm bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-lg hover:bg-white/30 transition-all duration-150"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    Ver Dashboard
                  </button>
                )}
              </h2>
              
              {/* Right side content */}
              <div className="flex items-center space-x-4">
                {activeView === 'DASHBOARD' && (
                  <button
                    onClick={() => handleViewChange('HABITS')}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-150 text-white font-bold text-sm"
                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                  >
                    🎨 Ver Hábitos
                  </button>
                )}
                {activeView === 'HABITS' && habits.length > 0 && (
                  <div className="bg-green-500/40 px-3 py-1 rounded-lg border-2 border-green-400/60 flex items-center space-x-2">
                    <span className="text-lg">{getEpicLevel().emoji}</span>
                    <span className="text-sm font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                      {getEpicLevel().title}
                    </span>
                  </div>
                )}
                <div
                  className="text-sm font-bold text-white/90"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  📅 Hoy:{' '}
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeView === 'DASHBOARD' ? (
              /* Dashboard de gamificación */
              renderGamificationDashboard()
            ) : habits.length === 0 ? (
              /* Mensaje cuando no hay hábitos */
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌱</div>
                <p
                  className="text-white font-bold text-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
                >
                  No tienes hábitos configurados aún.
                </p>
                <p
                  className="text-white/90 text-base font-medium"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Crea tu primer hábito usando el botón de arriba.
                </p>
                <p
                  className="text-white/90 text-base font-medium mt-2"
                  style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
                >
                  Haz click en "Ver Dashboard" para ver estadísticas cuando tengas hábitos.
                </p>
              </div>
            ) : (
              /* Lista de hábitos individuales */
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderHabits()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <toast.ToastContainer />

      {/* Confirm Modal */}
      <confirm.ConfirmModal />

      {/* Edit Modal */}
      <editModal.EditModal />

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        type="habit"
        onTemplateSelect={handleTemplateSelect}
        onCreateFromScratch={handleCreateFromScratch}
        onCancel={closeTemplateModal}
      />

      {/* Habit Modal */}
      <EditHabitModal
        isOpen={isHabitModalOpen}
        habit={editingHabit}
        isEditing={isEditingMode}
        onConfirm={handleHabitModalConfirm}
        onCancel={closeHabitModal}
      />

      {/* Item Action Modal */}
      <ItemActionModal
        isOpen={isActionModalOpen}
        title={selectedHabit?.name || ''}
        description={selectedHabit?.description}
        type="habit"
        onEdit={handleEditFromAction}
        onDelete={handleDeleteFromAction}
        onClose={closeActionModal}
      />
    </div>
  );
}
