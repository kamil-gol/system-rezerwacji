import { z } from 'zod';

// Password validator: min 12 chars, uppercase, lowercase, digit, special char
export const passwordSchema = z.string()
  .min(12, 'Hasło musi mieć minimum 12 znaków')
  .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
  .regex(/[A-Z]/, 'Hasło musi zawierać dużą literę')
  .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
  .regex(/[^a-zA-Z0-9]/, 'Hasło musi zawierać znak specjalny');

export const emailSchema = z.string().email('Nieprawidłowy adres email');

export const phoneSchema = z.string()
  .regex(/^\+?[0-9]{9,15}$/, 'Nieprawidłowy numer telefonu');

export const dateSchema = z.string()
  .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Format daty: dd.mm.yyyy');

export const nipSchema = z.string()
  .regex(/^[0-9]{10}$/, 'NIP musi mieć 10 cyfr')
  .optional();

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Hasło jest wymagane')
});

// Customer schema
export const customerSchema = z.object({
  firstName: z.string().min(2, 'Imię musi mieć min. 2 znaki'),
  lastName: z.string().min(2, 'Nazwisko musi mieć min. 2 znaki'),
  email: emailSchema.optional(),
  phone: phoneSchema,
  company: z.string().optional(),
  nip: nipSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, 'Kod pocztowy: XX-XXX').optional(),
  notes: z.string().optional()
});

// Reservation schema
export const reservationSchema = z.object({
  customerId: z.string().cuid(),
  roomId: z.string().cuid(),
  eventType: z.enum(['WEDDING', 'BIRTHDAY', 'ANNIVERSARY', 'BUSINESS_MEETING', 'PARTY', 'CHRISTMAS', 'BAPTISM', 'COMMUNION']),
  eventDate: z.string(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format czasu: HH:mm'),
  durationHours: z.number().int().min(1).max(24),
  numberOfGuests: z.number().int().min(1),
  pricingType: z.enum(['PER_PERSON', 'TOTAL']),
  pricePerPerson: z.number().optional(),
  totalPrice: z.number().optional(),
  depositRequired: z.boolean().default(false),
  depositAmount: z.number().optional(),
  depositDueDate: z.string().optional(),
  notes: z.string().optional(),
  specialRequests: z.string().optional()
}).refine(
  (data) => {
    if (data.pricingType === 'PER_PERSON') {
      return data.pricePerPerson !== undefined;
    } else {
      return data.totalPrice !== undefined;
    }
  },
  { message: 'Wybierz typ cenowy i podaj odpowiednią cenę' }
).refine(
  (data) => {
    if (data.depositRequired) {
      return data.depositAmount !== undefined && data.depositDueDate !== undefined;
    }
    return true;
  },
  { message: 'Jeśli wymagana zaliczka, podaj kwotę i termin' }
);
