export default [
  // Archivos a ignorar (reemplaza .eslintignore)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.env*',
      '*.db',
      '*.sqlite',
      'dev.db',
      'test.db',
      'prisma/migrations/**',
      'logs/**',
      '*.log',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.vscode/**',
      '.idea/**',
      '.DS_Store',
      'Thumbs.db',
      '*.tsbuildinfo',
      'coverage/**',
    ],
  },
  
  // Configuración para archivos TypeScript
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // 🔍 Variables y imports
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off', // Permitir console.log en backend
      'prefer-const': 'error',
      'no-var': 'error',

      // 📝 Código limpio
      'no-debugger': 'warn',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': 'warn',

      // 🎨 Estilo (que no interfiere con Prettier)
      'object-shorthand': 'warn',
      'prefer-template': 'warn',

      // 🔒 Seguridad
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // 🌐 Node.js específicas
      'no-process-exit': 'warn',
    },
  },
  
  // Configuración para archivos JavaScript
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',
    },
  },
];