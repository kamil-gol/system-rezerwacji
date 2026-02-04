import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count({ where })
  ]);
  
  res.json({
    data: customers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      reservations: {
        include: { room: true },
        orderBy: { eventDate: 'desc' }
      }
    }
  });
  
  if (!customer) {
    return res.status(404).json({ error: 'Klient nie znaleziony' });
  }
  
  res.json(customer);
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.create({
    data: {
      ...req.body,
      createdBy: req.user!.id
    }
  });
  
  res.status(201).json(customer);
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: req.body
  });
  
  res.json(customer);
};

export const getCustomerReservations = async (req: AuthRequest, res: Response) => {
  const reservations = await prisma.reservation.findMany({
    where: { customerId: req.params.id },
    include: { room: true },
    orderBy: { eventDate: 'desc' }
  });
  
  res.json(reservations);
};
