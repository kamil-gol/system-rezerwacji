import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export const getOverview = async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));
  
  const [totalReservations, activeReservations, totalRevenue, monthlyRevenue, lastMonthRevenue, totalCustomers] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } } }),
    prisma.reservation.aggregate({ _sum: { finalAmount: true }, where: { status: { notIn: ['CANCELLED'] } } }),
    prisma.reservation.aggregate({ _sum: { finalAmount: true }, where: { createdAt: { gte: startOfCurrentMonth }, status: { notIn: ['CANCELLED'] } } }),
    prisma.reservation.aggregate({ _sum: { finalAmount: true }, where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { notIn: ['CANCELLED'] } } }),
    prisma.customer.count()
  ]);
  
  const revenueGrowth = lastMonthRevenue._sum.finalAmount?.toNumber() || 0 > 0
    ? (((monthlyRevenue._sum.finalAmount?.toNumber() || 0) - (lastMonthRevenue._sum.finalAmount?.toNumber() || 0)) / (lastMonthRevenue._sum.finalAmount?.toNumber() || 1)) * 100
    : 0;
  
  res.json({
    totalReservations,
    activeReservations,
    totalRevenue: totalRevenue._sum.finalAmount?.toNumber() || 0,
    monthlyRevenue: monthlyRevenue._sum.finalAmount?.toNumber() || 0,
    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    totalCustomers
  });
};

export const getRevenue = async (req: AuthRequest, res: Response) => {
  const period = req.query.period as string || 'monthly';
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  
  let groupBy: any;
  let dateRange: any;
  
  if (period === 'monthly') {
    dateRange = { gte: startOfYear(new Date(year, 0, 1)), lte: endOfYear(new Date(year, 11, 31)) };
    
    const reservations = await prisma.reservation.findMany({
      where: { eventDate: dateRange, status: { notIn: ['CANCELLED'] } },
      select: { eventDate: true, finalAmount: true }
    });
    
    const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0 }));
    
    reservations.forEach(r => {
      const month = r.eventDate.getMonth();
      revenueByMonth[month].revenue += r.finalAmount.toNumber();
    });
    
    return res.json(revenueByMonth);
  }
  
  res.json([]);
};

export const getPopularEvents = async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  const events = await prisma.reservation.groupBy({
    by: ['eventType'],
    _count: { eventType: true },
    _sum: { finalAmount: true },
    where: { status: { notIn: ['CANCELLED'] } },
    orderBy: { _count: { eventType: 'desc' } },
    take: limit
  });
  
  const eventTypeLabels: Record<string, string> = {
    WEDDING: 'Wesele',
    BIRTHDAY: 'Urodziny',
    ANNIVERSARY: 'Rocznica',
    BUSINESS_MEETING: 'Spotkanie biznesowe',
    PARTY: 'Przyjęcie',
    CHRISTMAS: 'Wigilia firmowa',
    BAPTISM: 'Chrzciny',
    COMMUNION: 'Komunie'
  };
  
  res.json(events.map(e => ({
    eventType: eventTypeLabels[e.eventType] || e.eventType,
    count: e._count.eventType,
    revenue: e._sum.finalAmount?.toNumber() || 0
  })));
};

export const getRoomUtilization = async (req: AuthRequest, res: Response) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : startOfMonth(new Date());
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : endOfMonth(new Date());
  
  const rooms = await prisma.room.findMany({ where: { isActive: true } });
  
  const utilization = await Promise.all(rooms.map(async room => {
    const reservations = await prisma.reservation.count({
      where: {
        roomId: room.id,
        eventDate: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] }
      }
    });
    
    const revenue = await prisma.reservation.aggregate({
      _sum: { finalAmount: true },
      where: {
        roomId: room.id,
        eventDate: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] }
      }
    });
    
    return {
      room: room.name,
      reservations,
      revenue: revenue._sum.finalAmount?.toNumber() || 0
    };
  }));
  
  res.json(utilization);
};

export const getCustomerStats = async (req: AuthRequest, res: Response) => {
  const topCustomers = await prisma.customer.findMany({
    include: {
      reservations: {
        where: { status: { notIn: ['CANCELLED'] } },
        select: { finalAmount: true }
      }
    },
    take: 10
  });
  
  const stats = topCustomers.map(customer => ({
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    reservationCount: customer.reservations.length,
    totalSpent: customer.reservations.reduce((sum, r) => sum + r.finalAmount.toNumber(), 0)
  })).sort((a, b) => b.totalSpent - a.totalSpent);
  
  res.json(stats);
};
