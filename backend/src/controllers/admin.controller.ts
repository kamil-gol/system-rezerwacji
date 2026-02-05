import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import bcrypt from 'bcrypt';

export const getUsers = async (_req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Błąd pobierania użytkowników' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN'])
    });
    
    const data = schema.parse(req.body);
    
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Email już istnieje' });
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Nieprawidłowe dane', details: error.errors });
    }
    res.status(500).json({ error: 'Błąd tworzenia użytkownika' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const schema = z.object({
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']).optional()
    });
    
    const data = schema.parse(req.body);
    
    const updateData: any = { ...data };
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    
    const user = await prisma.user.update({
      where: { id },
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Nieprawidłowe dane', details: error.errors });
    }
    res.status(500).json({ error: 'Błąd aktualizacji użytkownika' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ message: 'Użytkownik dezaktywowany' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd usuwania użytkownika' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Simple mock logs if auditLogs table doesn't exist yet
    const logs = [
      {
        id: '1',
        level: 'info',
        message: 'System uruchomiony',
        createdAt: new Date(),
        user: null
      }
    ];
    
    res.json({
      data: logs,
      pagination: {
        total: logs.length,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd pobierania logów' });
  }
};
