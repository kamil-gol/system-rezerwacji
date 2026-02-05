import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { passwordSchema } from '../utils/validators';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } as jwt.SignOptions
    );
    
    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Brak tokenu' });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Użytkownik nieaktywny' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );
    
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Wylogowano pomyślnie' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    passwordSchema.parse(newPassword);
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Nieprawidłowe obecne hasło' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword }
    });
    
    res.json({ message: 'Hasło zmienione pomyślnie' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
};
