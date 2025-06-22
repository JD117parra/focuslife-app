'use client';

import { useEffect, useRef, useState } from 'react';

interface TransactionData {
  id?: string;
  amount?: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
  category?: string;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: TransactionData | null;
  isEditing: boolean; // true para editar, false para crear
  onConfirm: (transactionData: Partial<TransactionData>) => void;
  onCancel: () => void;
}

export default function EditTransactionModal({
  isOpen,
  transaction,
  isEditing,
  onConfirm,
  onCancel,
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos de la transacción cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      if (transaction && isEditing) {
        // Modo edición: cargar datos existentes
        setAmount(transaction.amount?.toString() || '');
        setDescription(transaction.description || '');
        setType(transaction.type || 'EXPENSE');
        setCategory(transaction.category || '');
      } else if (transaction && !isEditing) {
        // Modo creación con plantilla: usar datos de plantilla
        setAmount(''); // Dejar vacío para que usuario escriba el monto
        setDescription(transaction.description || '');
        setType(transaction.type || 'EXPENSE');
        setCategory(transaction.category || ''); // Usar la categoría de la plantilla
      } else if (!transaction && !isEditing) {
        // Modo creación limpia: resetear todo
        setAmount('');
        setDescription('');
        setType('EXPENSE');
        setCategory('');
      }
    }
  }, [transaction, isOpen, isEditing]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Focus en el input del monto cuando se abre
      setTimeout(() => {
        amountInputRef.current?.focus();
        if (isEditing) {
          amountInputRef.current?.select();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel, isEditing]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description.trim()) {
      const transactionData: Partial<TransactionData> = {
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        category: category.trim() || undefined,
      };
      onConfirm(transactionData);
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
          className="relative bg-white/25 backdrop-blur-md shadow-lg border border-white/45 rounded-lg max-w-lg w-full p-6 transform transition-all duration-300 ease-out scale-100 opacity-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/30 backdrop-blur-md border border-white/45 rounded-full flex items-center justify-center text-xl mr-4 shadow-lg">
              💰
            </div>
            <h3
              className="text-lg font-bold text-white"
              style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
            >
              {isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-2"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
              >
                Tipo *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200"
              >
                <option value="EXPENSE">💸 Gasto</option>
                <option value="INCOME">💵 Ingreso</option>
              </select>
            </div>

            {/* Monto */}
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-2"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
              >
                Monto *
              </label>
              <input
                ref={amountInputRef}
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-600"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-2"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
              >
                Descripción *
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Supermercado, Salario, Gasolina..."
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-600"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label
                className="block text-sm font-medium text-white/90 mb-2"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}
              >
                Categoría (opcional)
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ej: Alimentación, Salario, Transporte..."
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-white/30">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold border border-white/30 hover:bg-white/30 transition-all duration-150 shadow-lg"
                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600/90 text-white hover:bg-blue-700/90 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 backdrop-blur-sm shadow-sm"
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar Transacción'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
