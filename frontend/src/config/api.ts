/**
 * API Configuration
 * Centralized configuration for all backend API calls
 */

// Base URL for the API - uses environment variable with fallback for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// API Endpoints organized by module
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  
  // Task management endpoints
  TASKS: {
    BASE: '/api/tasks',
    STATS: '/api/tasks/stats',
    TODAY: '/api/tasks/today',
    OVERDUE: '/api/tasks/overdue', 
    WEEK: '/api/tasks/week',
    NO_DATE: '/api/tasks/no-date',
    DATE_RANGE: '/api/tasks/date-range',
    BY_ID: (id: string) => `/api/tasks/${id}`,
    COMPLETE: (id: string) => `/api/tasks/${id}/complete`,
  },
  
  // Habit tracking endpoints
  HABITS: {
    BASE: '/api/habits',
    STATS: '/api/habits/stats',
    BY_ID: (id: string) => `/api/habits/${id}`,
    TOGGLE: (id: string) => `/api/habits/${id}/toggle`,
    ENTRIES: (id: string) => `/api/habits/${id}/entries`,
    UNMARK: (habitId: string) => `/api/habits/${habitId}/unmark`,
    DELETE_ENTRY: (entryId: string) => `/api/habits/entries/${entryId}`,
  },
  
  // Financial transaction endpoints
  TRANSACTIONS: {
    BASE: '/api/transactions',
    STATS: '/api/transactions/stats',
    SUMMARY: '/api/transactions/summary',
    CATEGORIES_FINANCE: '/api/transactions/categories/finance',
    CATEGORIES_DEFAULTS: '/api/transactions/categories/defaults',
    BY_ID: (id: string) => `/api/transactions/${id}`,
  },
} as const

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

// Type-safe API URL builder for different modules
export const apiUrls = {
  // Authentication URLs
  auth: {
    login: () => buildApiUrl(API_ENDPOINTS.AUTH.LOGIN),
    register: () => buildApiUrl(API_ENDPOINTS.AUTH.REGISTER),
    me: () => buildApiUrl(API_ENDPOINTS.AUTH.ME),
  },
  
  // Task URLs
  tasks: {
    list: () => buildApiUrl(API_ENDPOINTS.TASKS.BASE),
    create: () => buildApiUrl(API_ENDPOINTS.TASKS.BASE),
    stats: () => buildApiUrl(API_ENDPOINTS.TASKS.STATS),
    today: () => buildApiUrl(API_ENDPOINTS.TASKS.TODAY),
    overdue: () => buildApiUrl(API_ENDPOINTS.TASKS.OVERDUE),
    week: () => buildApiUrl(API_ENDPOINTS.TASKS.WEEK),
    noDate: () => buildApiUrl(API_ENDPOINTS.TASKS.NO_DATE),
    dateRange: () => buildApiUrl(API_ENDPOINTS.TASKS.DATE_RANGE),
    byId: (id: string) => buildApiUrl(API_ENDPOINTS.TASKS.BY_ID(id)),
    update: (id: string) => buildApiUrl(API_ENDPOINTS.TASKS.BY_ID(id)),
    delete: (id: string) => buildApiUrl(API_ENDPOINTS.TASKS.BY_ID(id)),
    complete: (id: string) => buildApiUrl(API_ENDPOINTS.TASKS.COMPLETE(id)),
  },
  
  // Habit URLs
  habits: {
    list: () => buildApiUrl(API_ENDPOINTS.HABITS.BASE),
    create: () => buildApiUrl(API_ENDPOINTS.HABITS.BASE),
    stats: () => buildApiUrl(API_ENDPOINTS.HABITS.STATS),
    byId: (id: string) => buildApiUrl(API_ENDPOINTS.HABITS.BY_ID(id)),
    update: (id: string) => buildApiUrl(API_ENDPOINTS.HABITS.BY_ID(id)),
    delete: (id: string) => buildApiUrl(API_ENDPOINTS.HABITS.BY_ID(id)),
    toggle: (id: string) => buildApiUrl(API_ENDPOINTS.HABITS.TOGGLE(id)),
    entries: (id: string) => buildApiUrl(API_ENDPOINTS.HABITS.ENTRIES(id)),
    unmark: (habitId: string) => buildApiUrl(API_ENDPOINTS.HABITS.UNMARK(habitId)),
    deleteEntry: (entryId: string) => buildApiUrl(API_ENDPOINTS.HABITS.DELETE_ENTRY(entryId)),
  },
  
  // Transaction URLs
  transactions: {
    list: () => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.BASE),
    create: () => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.BASE),
    stats: () => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.STATS),
    summary: () => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.SUMMARY),
    categoriesFinance: () => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.CATEGORIES_FINANCE),
    categoriesDefaults: () => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.CATEGORIES_DEFAULTS),
    byId: (id: string) => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.BY_ID(id)),
    update: (id: string) => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.BY_ID(id)),
    delete: (id: string) => buildApiUrl(API_ENDPOINTS.TRANSACTIONS.BY_ID(id)),
  },
}

// Export types for better TypeScript support
export type ApiEndpoints = typeof API_ENDPOINTS
export type ApiUrls = typeof apiUrls
