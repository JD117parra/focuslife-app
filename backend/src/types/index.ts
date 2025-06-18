// User types
export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  categoryId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  categoryId?: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: string;
  priority: string;
  categoryId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Habit types
export interface CreateHabitDto {
  name: string;
  description?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  target?: number; // Cuántas veces por período
}

export interface UpdateHabitDto {
  name?: string;
  description?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  target?: number;
  isActive?: boolean;
}

export interface HabitResponse {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  target: number;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHabitEntryDto {
  habitId: string;
  date: string; // ISO string
  count?: number;
  notes?: string;
}

export interface HabitEntryResponse {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  count: number;
  notes: string | null;
  createdAt: Date;
}

// Transaction types
export interface CreateTransactionDto {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  date?: string; // ISO string, default today
}

export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  date?: string;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  description: string;
  type: string;
  categoryId: string | null;
  userId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

// Category types (for finance categories)
export interface CreateCategoryDto {
  name: string;
  type: 'TASK' | 'FINANCE';
  color?: string;
  icon?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string | null;
}