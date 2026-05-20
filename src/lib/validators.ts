import { z } from 'zod';

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

export const projectSchema = z.object({
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
});

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
