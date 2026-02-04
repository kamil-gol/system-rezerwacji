import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

export const logSystemEvent = async (level: string, message: string, context?: any) => {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        message,
        context: context || {}
      }
    });
  } catch (error) {
    console.error('Failed to log system event:', error);
  }
};
