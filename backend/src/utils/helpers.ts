import { format, parse, addDays, isBefore } from 'date-fns';
import { pl } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr: string = 'dd.MM.yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: pl });
};

export const parseDate = (dateStr: string, formatStr: string = 'dd.MM.yyyy'): Date => {
  return parse(dateStr, formatStr, new Date(), { locale: pl });
};

export const generateReservationNumber = (): string => {
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RES-${date}-${random}`;
};

export const calculateFinalAmount = (params: {
  pricingType: 'PER_PERSON' | 'TOTAL';
  numberOfGuests: number;
  pricePerPerson?: number;
  totalPrice?: number;
}): number => {
  if (params.pricingType === 'PER_PERSON' && params.pricePerPerson) {
    return params.numberOfGuests * params.pricePerPerson;
  }
  return params.totalPrice || 0;
};

export const generateExtraHoursNote = (hours: number): string => {
  if (hours <= 6) return '';
  const extraHours = hours - 6;
  return `Dodatkowo płatnych godzin: ${extraHours} (powyżej standardowych 6h)`;
};

export const validateDepositDate = (depositDueDate: Date, eventDate: Date): boolean => {
  const oneDayBefore = addDays(eventDate, -1);
  return isBefore(depositDueDate, oneDayBefore) || depositDueDate.getTime() === oneDayBefore.getTime();
};

export const validateRoomCapacity = (numberOfGuests: number, maxCapacity: number): boolean => {
  return numberOfGuests <= maxCapacity;
};
