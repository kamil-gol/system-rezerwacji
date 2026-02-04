import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const fileName = `backup-${timestamp}.sql`;
    const backupPath = path.join('/backup', fileName);
    
    const dbUrl = process.env.DATABASE_URL!;
    const command = `pg_dump "${dbUrl}" > ${backupPath}`;
    
    await execAsync(command);
    
    const stats = fs.statSync(backupPath);
    
    const backup = await prisma.backup.create({
      data: {
        fileName,
        size: stats.size,
        path: backupPath
      }
    });
    
    res.json({ message: 'Backup utworzony pomyślnie', backup });
  } catch (error: any) {
    res.status(500).json({ error: 'Błąd podczas tworzenia backupu', details: error.message });
  }
};

export const listBackups = async (req: AuthRequest, res: Response) => {
  const backups = await prisma.backup.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(backups);
};

export const restoreBackup = async (req: AuthRequest, res: Response) => {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: req.params.id }
    });
    
    if (!backup) {
      return res.status(404).json({ error: 'Backup nie znaleziony' });
    }
    
    const dbUrl = process.env.DATABASE_URL!;
    const command = `psql "${dbUrl}" < ${backup.path}`;
    
    await execAsync(command);
    
    res.json({ message: 'Backup przywrócony pomyślnie' });
  } catch (error: any) {
    res.status(500).json({ error: 'Błąd podczas przywracania backupu', details: error.message });
  }
};
