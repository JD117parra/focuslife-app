import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
}

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const payload = { userId, email };

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  static verifyToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET || 'fallback-secret';

    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
