# FocusLife App

> Aplicacion de productividad para gestionar tareas, seguimiento de habitos y finanzas personales.

## Descripcion

FocusLife es una aplicacion de productividad que ayuda a los usuarios a gestionar sus tareas diarias, construir habitos positivos y controlar su salud financiera. Construida con tecnologias web modernas, ofrece una experiencia completa de gestion de productividad.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Live Demo:** [focuslife-app.vercel.app](https://focuslife-app.vercel.app)

## Tecnologias

### Frontend
- **Next.js 15** con App Router y TypeScript
- **Tailwind CSS** para estilos
- **Middleware de Next.js** para proteccion de rutas server-side

### Backend
- **Express 5** con TypeScript
- **Prisma ORM** con PostgreSQL (Supabase)
- **Zod** para validacion de schemas

### Seguridad
- **JWT** con tokens en httpOnly cookies (proteccion XSS)
- **bcryptjs** (12 rounds) para hash de passwords
- **Helmet** para security headers
- **express-rate-limit** para proteccion contra fuerza bruta
- **CSRF** proteccion via validacion de Origin header
- **Middleware server-side** para proteccion de rutas

### Despliegue
- **Vercel** - Frontend
- **Render** - Backend API
- **Supabase** - Base de datos PostgreSQL

## Estructura del Proyecto

```
focuslife-app/
├── backend/
│   ├── src/
│   │   ├── config/database.ts
│   │   ├── middleware/auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   ├── habits.ts
│   │   │   └── transactions.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── habitService.ts
│   │   │   └── transactionService.ts
│   │   ├── validators/schemas.ts
│   │   ├── types/index.ts
│   │   ├── utils/auth.ts
│   │   └── server.ts
│   └── prisma/schema.prisma
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── habits/
│   │   │   ├── finances/
│   │   │   └── register/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/auth.ts
│   │   ├── config/api.ts
│   │   └── middleware.ts
│   └── next.config.ts
└── README.md
```

## Instalacion

### Prerrequisitos
- Node.js v18+
- npm
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/JD117parra/focuslife-app.git
cd focuslife-app
```

### 2. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

Crear archivo `.env`:
```env
DATABASE_URL="tu-connection-string-postgresql"
JWT_SECRET="tu-secret-seguro-aqui"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. Frontend
```bash
cd ../frontend
npm install
```

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Iniciar
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## API Endpoints

### Autenticacion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesion |
| POST | `/api/auth/logout` | Cerrar sesion |
| GET | `/api/auth/me` | Perfil del usuario |

### Tareas
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/tasks` | Listar tareas |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/tasks/stats` | Estadisticas |

### Habitos
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/habits` | Listar habitos |
| POST | `/api/habits` | Crear habito |
| PUT | `/api/habits/:id` | Actualizar habito |
| DELETE | `/api/habits/:id` | Eliminar habito |
| GET | `/api/habits/stats` | Estadisticas |
| POST | `/api/habits/:id/entries` | Registrar completado |

### Finanzas
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar transacciones |
| POST | `/api/transactions` | Crear transaccion |
| PUT | `/api/transactions/:id` | Actualizar transaccion |
| DELETE | `/api/transactions/:id` | Eliminar transaccion |
| GET | `/api/transactions/stats` | Estadisticas |
| GET | `/api/transactions/summary` | Resumen mensual |

## Seguridad

- Tokens JWT almacenados en httpOnly cookies (no accesibles por JavaScript)
- Rate limiting: 100 req/15min global, 5 req/15min en auth
- Validacion de inputs con Zod schemas
- Password minimo 8 caracteres con mayuscula, minuscula y numero
- Proteccion CSRF via validacion de Origin header
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Proteccion de rutas server-side con Next.js middleware
- Variables de entorno validadas al iniciar el servidor

## Arquitectura

```
[Vercel - Frontend]  -->  [Render - API Express]  -->  [Supabase - PostgreSQL]
     Next.js 15              Express + Prisma              Base de datos
     Middleware               JWT + Cookies
```

## Autor

**Juan Parra J.D**
- GitHub: [@JD117parra](https://github.com/JD117parra)
- LinkedIn: [juan-parra-2358b428b](https://linkedin.com/in/juan-parra-2358b428b)

## Licencia

MIT License
