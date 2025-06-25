'use client';

import { useEffect, useRef } from 'react';

// 📋 PLANTILLAS DE TAREAS
const TASK_TEMPLATES = [
  {
    title: 'Revisar emails',
    description: 'Chequear y responder correos importantes',
    priority: 'MEDIUM' as const,
    icon: '📧',
  },
  {
    title: 'Llamar a un cliente',
    description: 'Seguimiento de proyecto o consulta',
    priority: 'HIGH' as const,
    icon: '📞',
  },
  {
    title: 'Comprar víveres',
    description: 'Lista de compras para la semana',
    priority: 'MEDIUM' as const,
    icon: '🛒',
  },
  {
    title: 'Revisar presupuesto',
    description: 'Análisis mensual de finanzas',
    priority: 'MEDIUM' as const,
    icon: '📊',
  },
  {
    title: 'Preparar presentación',
    description: 'Slides para reunión del próximo jueves',
    priority: 'HIGH' as const,
    icon: '📊',
  },
  {
    title: 'Renovar documentos',
    description: 'Licencia, seguro o trámites pendientes',
    priority: 'MEDIUM' as const,
    icon: '📝',
  },
  {
    title: 'Hacer ejercicio',
    description: 'Rutina de ejercicios o ir al gimnasio',
    priority: 'MEDIUM' as const,
    icon: '💪',
  },
  {
    title: 'Pagar facturas',
    description: 'Servicios, tarjetas y pagos pendientes',
    priority: 'HIGH' as const,
    icon: '💳',
  },
  {
    title: 'Limpiar casa',
    description: 'Tareas de limpieza y organización',
    priority: 'LOW' as const,
    icon: '🧹',
  },
  {
    title: 'Estudiar curso',
    description: 'Revisar material de estudio o capacitación',
    priority: 'MEDIUM' as const,
    icon: '📚',
  },
  {
    title: 'Backup datos',
    description: 'Respaldar archivos importantes',
    priority: 'LOW' as const,
    icon: '💾',
  },
  {
    title: 'Cita médica',
    description: 'Agendar o asistir a consulta médica',
    priority: 'HIGH' as const,
    icon: '🏥',
  },
] as const;

// 🎯 PLANTILLAS DE HÁBITOS
const HABIT_TEMPLATES = [
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

// 💸 PLANTILLAS DE GASTOS
const EXPENSE_TEMPLATES = [
  { description: 'Supermercado', type: 'EXPENSE' as const, icon: '🛒', category: 'Alimentación' },
  { description: 'Gasolina', type: 'EXPENSE' as const, icon: '⛽', category: 'Transporte' },
  { description: 'Almuerzo', type: 'EXPENSE' as const, icon: '🍽️', category: 'Alimentación' },
  { description: 'Farmacia', type: 'EXPENSE' as const, icon: '💊', category: 'Salud' },
  { description: 'Transporte público', type: 'EXPENSE' as const, icon: '🚌', category: 'Transporte' },
  { description: 'Café', type: 'EXPENSE' as const, icon: '☕', category: 'Alimentación' },
  { description: 'Restaurante', type: 'EXPENSE' as const, icon: '🍴', category: 'Alimentación' },
  { description: 'Cine', type: 'EXPENSE' as const, icon: '🎥', category: 'Entretenimiento' },
  { description: 'Gimnasio', type: 'EXPENSE' as const, icon: '🏋️', category: 'Salud' },
  { description: 'Ropa', type: 'EXPENSE' as const, icon: '👕', category: 'Vestimenta' },
  { description: 'Internet', type: 'EXPENSE' as const, icon: '📶', category: 'Servicios' },
  { description: 'Electricidad', type: 'EXPENSE' as const, icon: '⚡', category: 'Servicios' },
  { description: 'Agua', type: 'EXPENSE' as const, icon: '💧', category: 'Servicios' },
  { description: 'Teléfono', type: 'EXPENSE' as const, icon: '📱', category: 'Servicios' },
  { description: 'Taxi/Uber', type: 'EXPENSE' as const, icon: '🚕', category: 'Transporte' },
  { description: 'Libros', type: 'EXPENSE' as const, icon: '📚', category: 'Educación' },
  { description: 'Streaming', type: 'EXPENSE' as const, icon: '📺', category: 'Entretenimiento' },
  { description: 'Seguros', type: 'EXPENSE' as const, icon: '🛡️', category: 'Seguros' },
] as const;

// 💵 PLANTILLAS DE INGRESOS
const INCOME_TEMPLATES = [
  { description: 'Salario', type: 'INCOME' as const, icon: '💼', category: 'Trabajo' },
  { description: 'Freelance', type: 'INCOME' as const, icon: '💻', category: 'Trabajo' },
  { description: 'Bono', type: 'INCOME' as const, icon: '🎁', category: 'Trabajo' },
  { description: 'Venta', type: 'INCOME' as const, icon: '🏪', category: 'Negocios' },
  { description: 'Propina', type: 'INCOME' as const, icon: '💵', category: 'Trabajo' },
  { description: 'Reembolso', type: 'INCOME' as const, icon: '💳', category: 'Diversos' },
  { description: 'Consultoría', type: 'INCOME' as const, icon: '📈', category: 'Trabajo' },
  { description: 'Inversión', type: 'INCOME' as const, icon: '💰', category: 'Inversiones' },
  { description: 'Alquiler', type: 'INCOME' as const, icon: '🏠', category: 'Propiedades' },
  { description: 'Comisión', type: 'INCOME' as const, icon: '💹', category: 'Trabajo' },
  { description: 'Regalo', type: 'INCOME' as const, icon: '🎁', category: 'Diversos' },
  { description: 'Trabajo extra', type: 'INCOME' as const, icon: '⏰', category: 'Trabajo' },
] as const;

// 🔧 TIPOS DE TEMPLATE POR PÁGINA
type TemplateType = 'task' | 'habit' | 'finance';

interface TaskTemplate {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  icon: string;
}

interface HabitTemplate {
  name: string;
  description: string;
  icon: string;
}

interface FinanceTemplate {
  description: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  category: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  type: TemplateType;
  onTemplateSelect: (template: TaskTemplate | HabitTemplate | FinanceTemplate) => void;
  onCreateFromScratch: () => void;
  onCancel: () => void;
}

export default function TemplateModal({
  isOpen,
  type,
  onTemplateSelect,
  onCreateFromScratch,
  onCancel,
}: TemplateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getTitle = () => {
    switch (type) {
      case 'task':
        return '📋 Crear Nueva Tarea';
      case 'habit':
        return '🎯 Crear Nuevo Hábito';
      case 'finance':
        return '💰 Crear Nueva Transacción';
      default:
        return 'Crear Nuevo';
    }
  };

  const getEmptyButtonText = () => {
    switch (type) {
      case 'task':
        return '✨ Crear tarea desde cero';
      case 'habit':
        return '🌟 Crear hábito personalizado';
      case 'finance':
        return '💰 Crear transacción manual';
      default:
        return 'Crear desde cero';
    }
  };

  const renderTaskTemplates = () => (
    <div>
      <h4 className="text-sm font-bold text-white/90 mb-3 px-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
        📝 Plantillas de Tareas:
      </h4>
      <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
        {TASK_TEMPLATES.map((template, index) => (
          <div
            key={index}
            onClick={() => onTemplateSelect(template)}
            className="bg-white/20 border-2 border-white/30 shadow-lg rounded-lg p-2 cursor-pointer transition-all duration-200 h-16 flex flex-col items-center justify-center hover:bg-white/30 hover:scale-105"
          >
            <div className="text-sm mb-0.5">{template.icon}</div>
            <div className="text-[10px] font-bold leading-tight text-white text-center px-1 truncate w-full" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
              {template.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHabitTemplates = () => (
    <div>
      <h4 className="text-sm font-bold text-white/90 mb-3 px-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
        🌟 Hábitos Populares:
      </h4>
      <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
        {HABIT_TEMPLATES.map((template, index) => (
          <div
            key={index}
            onClick={() => onTemplateSelect(template)}
            className="bg-white/20 border-2 border-white/30 shadow-lg rounded-lg p-2 cursor-pointer transition-all duration-200 h-16 flex flex-col items-center justify-center hover:bg-white/30 hover:scale-105"
          >
            <div className="text-sm mb-0.5">{template.icon}</div>
            <div className="text-[10px] font-bold leading-tight text-white text-center px-1 truncate w-full" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
              {template.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinanceTemplates = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-white/90 mb-3 px-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
          💸 Plantillas de Gastos:
        </h4>
        <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
          {EXPENSE_TEMPLATES.map((template, index) => (
            <div
              key={index}
              onClick={() => onTemplateSelect(template)}
              className="bg-red-500/20 border-2 border-red-400/30 shadow-lg rounded-lg p-2 cursor-pointer transition-all duration-200 h-16 flex flex-col items-center justify-center hover:bg-red-500/30 hover:scale-105"
            >
              <div className="text-sm mb-0.5">{template.icon}</div>
              <div className="text-[10px] font-bold leading-tight text-white text-center px-1 truncate w-full" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {template.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white/90 mb-3 px-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
          💵 Plantillas de Ingresos:
        </h4>
        <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
          {INCOME_TEMPLATES.map((template, index) => (
            <div
              key={index}
              onClick={() => onTemplateSelect(template)}
              className="bg-green-500/20 border-2 border-green-400/30 shadow-lg rounded-lg p-2 cursor-pointer transition-all duration-200 h-16 flex flex-col items-center justify-center hover:bg-green-500/30 hover:scale-105"
            >
              <div className="text-sm mb-0.5">{template.icon}</div>
              <div className="text-[10px] font-bold leading-tight text-white text-center px-1 truncate w-full" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
                {template.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => {
    switch (type) {
      case 'task':
        return renderTaskTemplates();
      case 'habit':
        return renderHabitTemplates();
      case 'finance':
        return renderFinanceTemplates();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop con blur glassmorphism */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Contenedor centrado para el modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Modal con glassmorphism */}
        <div
          ref={modalRef}
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-5xl w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h3
                className="text-xl font-bold text-white"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
              >
                {getTitle()}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white text-2xl leading-none"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              ×
            </button>
          </div>

          {/* Botón crear desde cero */}
          <div className="mb-8 flex justify-center">
            <button
              onClick={onCreateFromScratch}
              className="bg-blue-600/70 backdrop-blur-md text-white px-6 py-3 rounded-lg font-bold border border-blue-400/70 hover:bg-blue-700/80 transition-all duration-150 shadow-lg"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
            >
              {getEmptyButtonText()}
            </button>
          </div>

          {/* Separador */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-white/30"></div>
            <div
              className="px-4 text-sm font-bold text-white/70"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              O elige una plantilla:
            </div>
            <div className="flex-1 h-px bg-white/30"></div>
          </div>

          {/* Templates */}
          <div className="space-y-6">
            {renderTemplates()}
          </div>
        </div>
      </div>
    </div>
  );
}
