import { z } from 'zod';

const optionalNonNegativeNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === '' || v === undefined || v === null) return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  });

export const projectStatusSchema = z.enum([
  'CONCEPT',
  'OFFERTE',
  'BEVESTIGD',
  'AFGEROND',
]);

export const clientSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  email: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined))
    .pipe(z.union([z.string().email(), z.undefined()])),
  phone: z.string().optional(),
  address: z.string().optional(),
  vatNumber: z.string().optional(),
});

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  category: z.string().optional(),
  dailyRate: z.coerce.number().positive('Dagtarief moet positief zijn'),
  stockQty: z.coerce.number().int().positive().optional().or(z.literal('')),
});

export const discountTypeSchema = z.enum(['PERCENTAGE', 'AMOUNT']);

export const projectSchema = z
  .object({
    title: z.string().min(1, 'Titel is verplicht'),
    status: projectStatusSchema,
    quoteNumber: z.string().optional(),
    clientId: z.string().min(1),
    location: z.string().optional(),
    loadIn: z.string().optional(),
    showDate: z.string().optional(),
    loadOut: z.string().optional(),
    loadInTime: z.string().optional(),
    showTime: z.string().optional(),
    loadOutTime: z.string().optional(),
    siteContact: z.string().optional(),
    parkingNotes: z.string().optional(),
    notes: z.string().optional(),
    hourlyRate: optionalNonNegativeNumber,
    transportKm: optionalNonNegativeNumber,
    transportRatePerKm: optionalNonNegativeNumber,
    discountType: z
      .string()
      .optional()
      .transform((v) => (v === 'PERCENTAGE' || v === 'AMOUNT' ? v : null)),
    discountValue: optionalNonNegativeNumber,
  })
  .superRefine((data, ctx) => {
    if (data.discountType && (data.discountValue == null || data.discountValue <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vul een kortingswaarde in',
        path: ['discountValue'],
      });
    }
    if (
      data.discountType === 'PERCENTAGE' &&
      data.discountValue != null &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage mag maximaal 100 zijn',
        path: ['discountValue'],
      });
    }
    if (!data.discountType && data.discountValue != null && data.discountValue > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kies een kortingstype',
        path: ['discountType'],
      });
    }
  })
  .transform((data) => ({
    ...data,
    discountValue: data.discountType ? data.discountValue : null,
  }));

export const crewPhaseSchema = z.enum(['OPBOUW', 'SHOW', 'AFBOUW']);

export const crewShiftSchema = z.object({
  projectId: z.string().min(1),
  phase: crewPhaseSchema,
  role: z.string().optional(),
  headcount: z.coerce.number().int().positive('Minimaal 1 persoon'),
  date: z.string().min(1, 'Datum is verplicht'),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formaat HH:MM'),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Formaat HH:MM'),
  hourlyRate: optionalNonNegativeNumber,
  staffIds: z.string().optional(),
});

export const companySettingsSchema = z.object({
  companyName: z.string().min(1, 'Bedrijfsnaam is verplicht'),
  address: z.string().min(1, 'Adres is verplicht'),
  email: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined))
    .pipe(z.union([z.string().email(), z.undefined()])),
  phone: z.string().optional(),
  kvkNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  iban: z.string().optional(),
  quoteValidityDays: z.coerce.number().int().min(1).max(365),
  defaultVatRate: z.coerce.number().min(0).max(100),
  paymentTerms: z.string().optional(),
});

export const staffSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  role: z.string().optional(),
  phone: z.string().optional(),
});

export const CREW_PHASE_LABELS: Record<z.infer<typeof crewPhaseSchema>, string> = {
  OPBOUW: 'Opbouw',
  SHOW: 'Show',
  AFBOUW: 'Afbouw',
};

export const projectLineSchema = z.object({
  projectId: z.string().min(1),
  equipmentId: z.string().min(1),
  quantity: z.coerce.number().int().positive('Aantal moet minimaal 1 zijn'),
  rentalStart: z.string().min(1, 'Startdatum is verplicht'),
  rentalEnd: z.string().min(1, 'Einddatum is verplicht'),
});

export const STATUS_LABELS: Record<
  z.infer<typeof projectStatusSchema>,
  string
> = {
  CONCEPT: 'Concept',
  OFFERTE: 'Offerte',
  BEVESTIGD: 'Bevestigd',
  AFGEROND: 'Afgerond',
};
