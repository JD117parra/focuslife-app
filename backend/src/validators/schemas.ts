import { z } from 'zod';

// ============ AUTH SCHEMAS ============

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1).max(100).optional(),
});

// ============ TASK SCHEMAS ============

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  categoryId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.union([z.string(), z.null()]).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  categoryId: z.string().optional(),
});

// ============ HABIT SCHEMAS ============

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  target: z.number().int().min(1).optional(),
});

export const createHabitEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  count: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
});

// ============ TRANSACTION SCHEMAS ============

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().optional(),
  date: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(500).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().optional(),
  date: z.string().optional(),
});

// ============ CATEGORY SCHEMAS ============

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['TASK', 'FINANCE']),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
});

// ============ QUERY PARAM SCHEMAS ============

export const dateRangeQuerySchema = z.object({
  startDate: z.string().min(1, 'startDate is required').optional(),
  endDate: z.string().min(1, 'endDate is required').optional(),
});

export const transactionQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ============ HELPER ============

/**
 * Validates request body against a Zod schema.
 * Returns parsed data on success, or throws formatted error message.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
    throw new Error(errors);
  }
  return result.data;
}
