import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    message: 'FocusLife Backend API is running!', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);




app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: /api/auth/register, /api/auth/login`);
  console.log(`📋 Task endpoints: /api/tasks (GET, POST, PUT, DELETE)`);
  console.log(`🎯 Habit endpoints: /api/habits (GET, POST, PUT, DELETE, entries)`);
  console.log(`💰 Transaction endpoints: /api/transactions (GET, POST, PUT, DELETE, stats, categories)`);

});

export default app;