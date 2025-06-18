import { prisma } from '../config/database';
import { CreateUserDto, LoginDto, UserResponse } from '../types';
import { AuthUtils, validateEmail } from '../utils/auth';

export class AuthService {
  static async register(userData: CreateUserDto): Promise<{ user: UserResponse; token: string }> {
    const { email, name, password } = userData;

    // Validar email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash de la contraseña
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generar token
    const token = AuthUtils.generateToken(user.id, user.email);

    return { user, token };
  }

  static async login(loginData: LoginDto): Promise<{ user: UserResponse; token: string }> {
    const { email, password } = loginData;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verificar contraseña
    const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generar token
    const token = AuthUtils.generateToken(user.id, user.email);

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return user;
  }
}