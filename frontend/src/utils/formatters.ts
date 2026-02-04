import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr = 'dd.MM.yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: pl });
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('48')) {
    return `+48 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

export const getEventTypeLabel = (eventType: string): string => {
  const labels: Record<string, string> = {
    WEDDING: 'Wesele',
    BIRTHDAY: 'Urodziny',
    ANNIVERSARY: 'Rocznica',
    BUSINESS_MEETING: 'Spotkanie biznesowe',
    PARTY: 'Przyjęcie',
    CHRISTMAS: 'Wigilia firmowa',
    BAPTISM: 'Chrzciny',
    COMMUNION: 'Komunie',
  };
  return labels[eventType] || eventType;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Oczekująca',
    CONFIRMED: 'Potwierdzona',
    CANCELLED: 'Anulowana',
    COMPLETED: 'Zakończona',
    IN_PROGRESS: 'W trakcie',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
