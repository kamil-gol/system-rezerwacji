import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import bcrypt from 'bcryptjs';
import { passwordSchema } from '../utils/validators';

export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(users);
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;
  
  passwordSchema.parse(password);
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'Użytkownik o tym emailu już istnieje' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'EMPLOYEE'
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true
    }
  });
  
  res.status(201).json(user);
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { password, ...data } = req.body;
  
  let updateData: any = data;
  
  if (password) {
    passwordSchema.parse(password);
    updateData.password = await bcrypt.hash(password, 10);
  }
  
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true
    }
  });
  
  res.json(user);
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: 'Nie możesz usunąć własnego konta' });
  }
  
  await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });
  
  res.json({ message: 'Użytkownik dezaktywowany' });
};

export const getSystemLogs = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const level = req.query.level as string;
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (level) where.level = level;
  
  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.systemLog.count({ where })
  ]);
  
  res.json({
    data: logs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};
