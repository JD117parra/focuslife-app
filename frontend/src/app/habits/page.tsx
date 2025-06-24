'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { useEditModal } from '@/hooks/useEditModal';
import { EditHabitModal, ItemActionModal } from '@/components/ui';
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
const predefinedHabits = [
  { name: 'Hacer ejercicio', icon: '🏃‍♂️', description: '30 minutos de actividad física' },
  { name: 'Leer', icon: '📚', description: 'Leer al menos 20 minutos' },
  { name: 'Meditar', icon: '🧘‍♀️', description: 'Meditación o mindfulness' },
  { name: 'Beber agua', icon: '💧', description: 'Tomar 8 vasos de agua al día' },
  { name: 'Levantarse temprano', icon: '🌅', description: 'Despertar antes de las 7 AM' },
  { name: 'Estudiar', icon: '📝', description: 'Dedicar tiempo al aprendizaje' },
  { name: 'Gratitud', icon: '🙏', description: 'Escribir 3 cosas por las que estás agradecido' },
  { name: 'Diario personal', icon: '📔', description: 'Escribir en tu diario personal' },
  { name: 'Tiempo al aire libre', icon: '🌿', description: 'Salir y respirar aire fresco' },
  { name: 'Desconexión digital', icon: '📵', description: 'Tiempo sin pantallas o dispositivos' },
  { name: 'Organizar espacio', icon: '🧹', description: 'Mantener el entorno ordenado' },
  { name: 'Tiempo creativo', icon: '🎨', description: 'Cualquier actividad creativa' },
  { name: 'Caminar diario', icon: '🚶‍♂️', description: 'Caminar al menos 30 minutos' },
  { name: 'Comer saludable', icon: '🥗', description: 'Incluir frutas y verduras en comidas' },
  { name: 'Dormir temprano', icon: '😴', description: 'Acostarse antes de las 10 PM' },
  { name: 'Hacer la cama', icon: '🛏️', description: 'Ordenar la cama al levantarse' },
  { name: 'Tomar vitaminas', icon: '💊', description: 'Suplementos diarios' },
  { name: 'Llamar a familia', icon: '📞', description: 'Contactar con seres queridos' },
  { name: 'Escuchar música', icon: '🎵', description: 'Disfrutar de música favorita' },
  { name: 'Cocinar en casa', icon: '👨‍🍳', description: 'Preparar comidas caseras' },
  { name: 'Practicar idioma', icon: '🌍', description: 'Estudiar un nuevo idioma' },
  { name: 'Hacer yoga', icon: '🧘‍♀️', description: 'Práctica de yoga o estiramientos' },
  { name: 'Ahorrar dinero', icon: '💰', description: 'Guardar dinero cada día' },
  { name: 'Sonreír más', icon: '😊', description: 'Mantener actitud positiva' },
] as const;

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
  
  // Control para evitar duplicación de notificación de bienvenida
  const welcomeShownRef = useRef(false);

  // Estado para el modal de hábitos
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // Estado para el modal de acciones
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
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

  const addPredefinedHabit = async (habitName: string) => {
    const habitExists = habits.some(habit => 
      habit.name.toLowerCase() === habitName.toLowerCase()
    );
    if (habitExists) {
      toast.warning('¡Este hábito ya existe en tu lista!');
      return;
    }

    const template = predefinedHabits.find(h => h.name === habitName);
    if (template) {
      openTemplateHabitModal(template);
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

  const openTemplateHabitModal = (template: any) => {
    const templateHabit = {
      name: template.name,
      description: template.description,
      frequency: 'DAILY',
      target: 1,
      isActive: true,
    };
    setEditingHabit(templateHabit as any);
    setIsEditingMode(false);
    setIsHabitModalOpen(true);
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
          <div className="mb-6 flex justify-center">
            <button
              onClick={openCreateHabitModal}
              className="bg-purple-600/70 backdrop-blur-md text-white px-4 py-2 rounded-lg font-bold border border-purple-400/70 hover:bg-purple-700/80 transition-all duration-150 shadow-lg text-sm"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              🌟 Crear Nuevo Hábito
            </button>
          </div>

          <h3
            className="text-xl font-bold text-white mb-4"
            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
          >
            🌟 Hábitos Populares
          </h3>

          <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
            {predefinedHabits.map((habit, index) => {
              const isAdded = habits.some(
                h => h.name.toLowerCase() === habit.name.toLowerCase()
              );

              return (
                <div
                  key={index}
                  onClick={() => !isAdded && addPredefinedHabit(habit.name)}
                  className={`w-full h-16 flex flex-col items-center justify-center px-1 py-1 rounded cursor-pointer transition-colors will-change-auto ${
                    isAdded
                      ? 'bg-green-50/80 border border-green-200'
                      : 'bg-blue-50/80 border border-blue-200 hover:bg-blue-100/90'
                  }`}
                >
                  <div className="text-sm mb-1">{habit.icon}</div>
                  <div className="text-xs font-bold leading-tight text-gray-800 text-center px-1 truncate w-full">
                    {habit.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits List */}
        <div className="bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg">
          <div className="p-6 border-b border-white/40">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-bold text-white"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                Mis Hábitos ({habits.length})
              </h2>
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

          <div className="p-6">
            {habits.length === 0 ? (
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
                  Crea tu primer hábito usando el formulario de arriba.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderHabits()}
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
