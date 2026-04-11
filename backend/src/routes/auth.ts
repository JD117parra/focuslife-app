import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { registerSchema, loginSchema, validateBody } from '../validators/schemas';

const router = Router();

// Strict rate limiting for auth endpoints: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes.' },
});

// Cookie configuration for httpOnly tokens
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = validateBody(registerSchema, req.body);
    const result = await AuthService.register(userData);

    // Set httpOnly cookie with JWT token
    res.cookie('token', result.token, cookieOptions);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    const message =
      error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData = validateBody(loginSchema, req.body);
    const result = await AuthService.login(loginData);

    // Set httpOnly cookie with JWT token
    res.cookie('token', result.token, cookieOptions);

    res.json({
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ message });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get(
  '/me',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        message: 'User profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Failed to get user profile' });
    }
  }
);

export default router;
