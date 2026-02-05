import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import { Prisma } from '@prisma/client';
import { generateReservationNumber, calculateFinalAmount, generateExtraHoursNote, validateDepositDate, validateRoomCapacity, parseDate } from '../utils/helpers';
import { generateReservationPDF } from '../utils/pdfGenerator';
import { sendReservationConfirmation } from '../utils/emailService';
import { addDays } from 'date-fns';

export const getReservations = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (status) where.status = status;
  
  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: true,
        room: true,
        createdByUser: { select: { firstName: true, lastName: true } }
      },
      orderBy: { eventDate: 'desc' }
    }),
    prisma.reservation.count({ where })
  ]);
  
  res.json({
    data: reservations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

export const getUpcomingReservations = async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const now = new Date();
  const future = addDays(now, days);
  
  const reservations = await prisma.reservation.findMany({
    where: {
      eventDate: {
        gte: now,
        lte: future
      },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    include: {
      customer: true,
      room: true
    },
    orderBy: { eventDate: 'asc' }
  });
  
  res.json(reservations);
};

export const getArchivedReservations = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: { in: ['COMPLETED', 'CANCELLED'] }
      },
      skip,
      take: limit,
      include: {
        customer: true,
        room: true
      },
      orderBy: { eventDate: 'desc' }
    }),
    prisma.reservation.count({
      where: { status: { in: ['COMPLETED', 'CANCELLED'] } }
    })
  ]);
  
  res.json({
    data: reservations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};

export const getReservationById = async (req: AuthRequest, res: Response) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      room: true,
      createdByUser: { select: { firstName: true, lastName: true } },
      attachments: true
    }
  });
  
  if (!reservation) {
    return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
  }
  
  res.json(reservation);
};

export const createReservation = async (req: AuthRequest, res: Response) => {
  const data = req.body;
  
  // Validate room capacity
  const room = await prisma.room.findUnique({ where: { id: data.roomId } });
  if (!room) {
    return res.status(404).json({ error: 'Sala nie znaleziona' });
  }
  
  if (!validateRoomCapacity(data.numberOfGuests, room.maxCapacity)) {
    return res.status(400).json({
      error: `Liczba gości przekracza maksymalną pojemność sali (${room.maxCapacity} osób)`
    });
  }
  
  // Parse and validate dates
  const eventDate = parseDate(data.eventDate);
  
  if (data.depositRequired && data.depositDueDate) {
    const depositDueDate = parseDate(data.depositDueDate);
    if (!validateDepositDate(depositDueDate, eventDate)) {
      return res.status(400).json({
        error: 'Termin zaliczki musi być maksymalnie dzień przed wydarzeniem'
      });
    }
  }
  
  // Calculate final amount
  const finalAmount = calculateFinalAmount({
    pricingType: data.pricingType,
    numberOfGuests: data.numberOfGuests,
    pricePerPerson: data.pricePerPerson,
    totalPrice: data.totalPrice
  });
  
  // Generate extra hours note
  const extraHoursNote = generateExtraHoursNote(data.durationHours);
  
  const reservation = await prisma.reservation.create({
    data: {
      reservationNumber: generateReservationNumber(),
      customerId: data.customerId,
      roomId: data.roomId,
      eventType: data.eventType,
      eventDate,
      startTime: data.startTime,
      durationHours: data.durationHours,
      numberOfGuests: data.numberOfGuests,
      pricingType: data.pricingType,
      pricePerPerson: data.pricePerPerson ? new Prisma.Decimal(data.pricePerPerson) : null,
      totalPrice: data.totalPrice ? new Prisma.Decimal(data.totalPrice) : null,
      finalAmount: new Prisma.Decimal(finalAmount),
      depositRequired: data.depositRequired,
      depositAmount: data.depositAmount ? new Prisma.Decimal(data.depositAmount) : null,
      depositDueDate: data.depositDueDate ? parseDate(data.depositDueDate) : null,
      depositStatus: data.depositRequired ? 'PENDING' : 'NOT_REQUIRED',
      notes: data.notes,
      specialRequests: data.specialRequests,
      autoGeneratedNotes: extraHoursNote,
      createdBy: req.user!.id
    },
    include: { customer: true, room: true }
  });
  
  // Log history
  await prisma.reservationHistory.create({
    data: {
      reservationId: reservation.id,
      changeType: 'CREATED',
      changedBy: req.user!.id,
      newValue: reservation
    }
  });
  
  res.status(201).json(reservation);
};

export const updateReservation = async (req: AuthRequest, res: Response) => {
  const { reason, ...data } = req.body;
  
  if (!reason) {
    return res.status(400).json({ error: 'Powód zmiany jest wymagany' });
  }
  
  const existing = await prisma.reservation.findUnique({
    where: { id: req.params.id }
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
  }
  
  // Recalculate if needed
  let finalAmount = existing.finalAmount;
  if (data.numberOfGuests || data.pricePerPerson || data.totalPrice) {
    const calculatedAmount = calculateFinalAmount({
      pricingType: data.pricingType || existing.pricingType,
      numberOfGuests: data.numberOfGuests || existing.numberOfGuests,
      pricePerPerson: data.pricePerPerson || existing.pricePerPerson?.toNumber(),
      totalPrice: data.totalPrice || existing.totalPrice?.toNumber()
    });
    finalAmount = new Prisma.Decimal(calculatedAmount);
  }
  
  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: {
      ...data,
      finalAmount,
      pricePerPerson: data.pricePerPerson ? new Prisma.Decimal(data.pricePerPerson) : undefined,
      totalPrice: data.totalPrice ? new Prisma.Decimal(data.totalPrice) : undefined,
      depositAmount: data.depositAmount ? new Prisma.Decimal(data.depositAmount) : undefined,
      autoGeneratedNotes: data.durationHours
        ? generateExtraHoursNote(data.durationHours)
        : existing.autoGeneratedNotes
    },
    include: { customer: true, room: true }
  });
  
  await prisma.reservationHistory.create({
    data: {
      reservationId: reservation.id,
      changeType: 'UPDATED',
      changedBy: req.user!.id,
      reason,
      previousValue: existing,
      newValue: reservation
    }
  });
  
  res.json(reservation);
};

export const cancelReservation = async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({ error: 'Powód anulowania jest wymagany' });
  }
  
  const existing = await prisma.reservation.findUnique({
    where: { id: req.params.id }
  });
  
  if (!existing) {
    return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
  }
  
  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: new Date()
    },
    include: { customer: true, room: true }
  });
  
  await prisma.reservationHistory.create({
    data: {
      reservationId: reservation.id,
      changeType: 'CANCELLED',
      changedBy: req.user!.id,
      reason,
      previousValue: existing,
      newValue: reservation
    }
  });
  
  res.json(reservation);
};

export const generatePDF = async (req: AuthRequest, res: Response) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { customer: true, room: true }
  });
  
  if (!reservation) {
    return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
  }
  
  const pdfPath = await generateReservationPDF(reservation);
  res.download(pdfPath);
};

export const sendReservationEmail = async (req: AuthRequest, res: Response) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { customer: true, room: true }
  });
  
  if (!reservation) {
    return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
  }
  
  if (!reservation.customer.email) {
    return res.status(400).json({ error: 'Klient nie ma adresu email' });
  }
  
  await sendReservationConfirmation(reservation);
  
  await prisma.emailLog.create({
    data: {
      reservationId: reservation.id,
      to: reservation.customer.email,
      subject: `Potwierdzenie rezerwacji ${reservation.reservationNumber}`,
      body: 'Email z potwierdzeniem rezerwacji',
      status: 'sent'
    }
  });
  
  res.json({ message: 'Email wysłany pomyślnie' });
};

export const getReservationHistory = async (req: AuthRequest, res: Response) => {
  const history = await prisma.reservationHistory.findMany({
    where: { reservationId: req.params.id },
    include: {
      user: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(history);
};

export const uploadAttachments = async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Brak plików' });
  }
  
  const attachments = await Promise.all(
    files.map(file =>
      prisma.attachment.create({
        data: {
          reservationId: req.params.id,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        }
      })
    )
  );
  
  res.json(attachments);
};
