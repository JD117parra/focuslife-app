# 🎯 FocusLife App

> A complete productivity application for managing tasks, tracking habits, and monitoring personal finances.

## 📋 Overview

FocusLife is a comprehensive productivity application that helps users manage their daily tasks, build positive habits, and track their financial health. Built with modern web technologies, it provides a seamless experience across all productivity management needs.

![FocusLife Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **User registration and login** system
- **Protected routes** with middleware validation
- **Session management** with automatic redirects

### 📋 Task Management
- **CRUD operations** for tasks (Create, Read, Update, Delete)
- **Status tracking** (Pending, In Progress, Completed)
- **Real-time updates** with optimistic UI updates
- **Task statistics** and progress tracking

### 🎯 Habit Tracking
- **Custom habit creation** with frequency settings (Daily, Weekly, Monthly)
- **Progress tracking** with completion counters
- **Habit entries logging** with date and notes
- **Statistics dashboard** showing completion rates and streaks

### 💰 Financial Management
- **Income and expense tracking** with categorization
- **Transaction management** with CRUD operations
- **Financial statistics** including balance, totals, and trends
- **Monthly summaries** and reporting
- **Pre-defined categories** for quick transaction entry

### 📊 Real-time Dashboard
- **Live statistics** from all modules
- **Dynamic data visualization** 
- **Quick navigation** to all app sections
- **User-specific data** with personalized greetings

### 🎨 Modern UX/UI
- **Toast notifications** for user feedback (Success, Error, Warning, Delete)
- **Responsive design** for all screen sizes
- **Loading states** and smooth transitions
- **Intuitive navigation** with consistent design patterns

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Components** - Reusable UI components
- **Custom Hooks** - Reusable logic (useToast)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Prisma ORM** - Database toolkit and query builder
- **SQLite** - Lightweight database for development

### Security & Middleware
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

## 📁 Project Structure

```
focuslife-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Prisma configuration
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts              # Authentication routes
│   │   │   ├── tasks.ts             # Task management routes
│   │   │   ├── habits.ts            # Habit tracking routes
│   │   │   └── transactions.ts      # Financial transaction routes
│   │   ├── services/
│   │   │   ├── authService.ts       # Authentication business logic
│   │   │   ├── taskService.ts       # Task management logic
│   │   │   ├── habitService.ts      # Habit tracking logic
│   │   │   └── transactionService.ts # Financial logic
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript type definitions
│   │   ├── utils/
│   │   │   └── auth.ts              # Authentication utilities
│   │   └── server.ts                # Express server setup
│   ├── prisma/
│   │   ├── migrations/              # Database migrations
│   │   └── schema.prisma            # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/           # Main dashboard page
│   │   │   ├── tasks/               # Task management page
│   │   │   ├── habits/              # Habit tracking page
│   │   │   ├── finances/            # Financial management page
│   │   │   ├── login/               # Login page
│   │   │   └── register/            # Registration page
│   │   ├── components/
│   │   │   └── Toast.tsx            # Toast notification component
│   │   ├── hooks/
│   │   │   └── useToast.tsx         # Custom toast hook
│   │   └── services/
│   │       └── auth.ts              # Frontend authentication service
│   └── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/focuslife-app.git
cd focuslife-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Environment Configuration
Create a `.env` file in the backend directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

### 6. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### 7. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Backend Health Check: http://localhost:5000/health

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Task Management
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### Habit Tracking
- `GET /api/habits` - Get all user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `GET /api/habits/stats` - Get habit statistics
- `POST /api/habits/:id/entries` - Log habit completion

### Financial Management
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats` - Get financial statistics
- `GET /api/transactions/summary` - Get monthly summary

## 🎮 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Explore the dashboard** to see real-time statistics
3. **Create your first task** in the Task Management section
4. **Set up habits** you want to track
5. **Log financial transactions** to monitor your budget

### Key Features Usage

#### Task Management
- Create tasks with titles and descriptions
- Mark tasks as completed using checkboxes
- Delete tasks with confirmation prompts
- View real-time task statistics on dashboard

#### Habit Tracking
- Create habits with custom names and frequencies
- Set targets for daily completion goals
- Delete habits when no longer needed
- Monitor progress through statistics

#### Financial Tracking
- Log income and expenses with descriptions
- View real-time balance calculations
- Organize transactions by type
- Monitor monthly financial summaries

## 🏗️ Architecture Highlights

### Frontend Architecture
- **Component-based design** with reusable UI elements
- **Custom hooks** for shared logic (useToast)
- **Type-safe development** with TypeScript
- **Responsive design** with Tailwind CSS

### Backend Architecture
- **Layered architecture** (Routes → Services → Database)
- **Middleware-based security** with JWT authentication
- **Type-safe API** development with TypeScript
- **Database abstraction** with Prisma ORM

### Database Design
- **Normalized schema** with proper relationships
- **User isolation** - all data scoped to authenticated users
- **Referential integrity** with cascade deletes
- **Audit trails** with created/updated timestamps

## 🎯 Roadmap

### Planned Features
- [ ] **Advanced Analytics** - Charts and graphs for data visualization
- [ ] **Categories System** - Organize tasks and transactions by categories
- [ ] **Search & Filters** - Advanced filtering and search capabilities
- [ ] **Data Export** - Export data to CSV/PDF formats
- [ ] **Mobile App** - React Native mobile application
- [ ] **Team Collaboration** - Share tasks and habits with team members
- [ ] **Recurring Tasks** - Automated task creation on schedules
- [ ] **Goal Setting** - Long-term goal tracking and management

### Technical Improvements
- [ ] **Unit Testing** - Comprehensive test coverage
- [ ] **E2E Testing** - End-to-end testing with Cypress
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **Deployment** - Docker containerization and CI/CD pipeline
- [ ] **Real Database** - PostgreSQL/MySQL for production
- [ ] **Caching** - Redis implementation for improved performance

## 🤝 Contributing

We welcome contributions to FocusLife! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**JD Parra**
- GitHub: [@JD117parra](https://github.com/JD117parra)
- LinkedIn: (https://linkedin.com/in/juan-parra-2358b428b)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by productivity and personal management needs
- Thanks to the open-source community for amazing tools and libraries

---

**⭐ If you find this project helpful, please consider giving it a star!**
