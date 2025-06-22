import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Archivos a ignorar (reemplaza .eslintignore)
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '.env*',
      '*.log',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.vscode/**',
      '.idea/**',
      '.DS_Store',
      'Thumbs.db',
      '*.tsbuildinfo',
      '.eslintcache',
      'coverage/**',
      'public/**',
    ],
  },
  
  // Configuración base de Next.js
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  
  // Reglas personalizadas más conservadoras
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // 🔍 Variables y imports
      'no-unused-vars': 'off', // Desactivar la regla base
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',

      // 🎯 TypeScript específicas (sin type information)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // 🚀 React/Next.js mejores prácticas
      'react/no-unescaped-entities': 'off', // Next.js lo maneja
      'react-hooks/exhaustive-deps': 'warn',
      'react/display-name': 'off',
      'react/prop-types': 'off', // No necesario con TypeScript

      // 📝 Código limpio
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': 'warn',

      // 🎨 Estilo (que no interfiere con Prettier)
      'object-shorthand': 'warn',
      'prefer-template': 'warn',

      // 🔒 Seguridad básica
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
];

export default eslintConfig;