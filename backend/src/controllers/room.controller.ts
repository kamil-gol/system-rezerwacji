import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import { parseDate } from '../utils/helpers';

export const getRooms = async (req: AuthRequest, res: Response) => {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });
  
  res.json(rooms);
};

export const getRoomById = async (req: AuthRequest, res: Response) => {
  const room = await prisma.room.findUnique({
    where: { id: req.params.id }
  });
  
  if (!room) {
    return res.status(404).json({ error: 'Sala nie znaleziona' });
  }
  
  res.json(room);
};

export const checkRoomAvailability = async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Data jest wymagana' });
  }
  
  const eventDate = parseDate(date as string);
  
  const reservations = await prisma.reservation.findMany({
    where: {
      roomId: req.params.id,
      eventDate,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
    }
  });
  
  res.json({
    isAvailable: reservations.length === 0,
    reservations
  });
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  const room = await prisma.room.create({
    data: req.body
  });
  
  res.status(201).json(room);
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: req.body
  });
  
  res.json(room);
};
