import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { passwordSchema } from '../utils/validators';

export const login = async (req: Request, res: Response) => {
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
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
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
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Brak tokenu' });
  }
  
  try {
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Wylogowano pomyślnie' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  passwordSchema.parse(newPassword);
  
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  });
  
  const isValid = await bcrypt.compare(currentPassword, user!.password);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Nieprawidłowe obecne hasło' });
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedPassword }
  });
  
  res.json({ message: 'Hasło zmienione pomyślnie' });
};
