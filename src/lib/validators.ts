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

export const clientSchema = z
  .object({
    type: z.enum(['PARTICULIER', 'BEDRIJF']),
    name: z.string().min(1, 'Naam is verplicht'),
    email: z
      .string()
      .optional()
      .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined))
      .pipe(z.union([z.string().email(), z.undefined()])),
    phone: z.string().optional(),
    address: z.string().optional(),
    vatNumber: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    vatNumber: data.vatNumber?.trim() ? data.vatNumber.trim() : undefined,
  }));

export const equipmentCategorySchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  categoryId: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : null)),
  dailyRate: z.coerce.number().positive('Dagtarief moet positief zijn'),
  stockQty: z
    .union([z.literal(''), z.coerce.number().int().positive()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? '' : v)),
  isExternalRental: z
    .union([z.literal('on'), z.boolean(), z.null()])
    .optional()
    .transform((v) => v === 'on' || v === true),
});

export const discountTypeSchema = z.enum(['PERCENTAGE', 'AMOUNT']);

function refineDiscountFields(
  data: {
    discountType: 'PERCENTAGE' | 'AMOUNT' | null;
    discountValue: number | null;
  },
  ctx: z.RefinementCtx
) {
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
}

export const transportTypeSchema = z.enum(['PER_KM', 'FIXED']);

export const TRANSPORT_TYPE_LABELS: Record<z.infer<typeof transportTypeSchema>, string> = {
  PER_KM: 'Kilometervergoeding',
  FIXED: 'Vast tarief',
};

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
    transportType: z
      .string()
      .optional()
      .transform((v) => (v === 'FIXED' ? 'FIXED' : 'PER_KM')),
    transportKm: optionalNonNegativeNumber,
    transportRatePerKm: optionalNonNegativeNumber,
    transportFixedAmount: optionalNonNegativeNumber,
  })
  .superRefine((data, ctx) => {
    if (data.transportType === 'PER_KM') {
      const hasKm = data.transportKm != null && data.transportKm > 0;
      const hasRate = data.transportRatePerKm != null && data.transportRatePerKm > 0;
      if (hasKm !== hasRate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vul zowel afstand als vergoeding per km in',
          path: hasKm ? ['transportRatePerKm'] : ['transportKm'],
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    transportKm: data.transportType === 'PER_KM' ? data.transportKm : null,
    transportRatePerKm: data.transportType === 'PER_KM' ? data.transportRatePerKm : null,
    transportFixedAmount: data.transportType === 'FIXED' ? data.transportFixedAmount : null,
  }));

export const projectFinancialSchema = z.object({
  projectId: z.string().min(1),
  totalDiscountAmount: optionalNonNegativeNumber,
});

export const projectLineDiscountSchema = z
  .object({
    projectId: z.string().min(1),
    discountType: z
      .string()
      .optional()
      .transform((v): z.infer<typeof discountTypeSchema> | null =>
        v === 'PERCENTAGE' || v === 'AMOUNT' ? v : null
      ),
    discountValue: optionalNonNegativeNumber,
  })
  .superRefine(refineDiscountFields)
  .transform((data) => ({
    projectId: data.projectId,
    discountType: data.discountType,
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

export const projectLineSchema = z
  .object({
    projectId: z.string().min(1),
    lineType: z.enum(['catalog', 'custom']).default('catalog'),
    equipmentId: z.string().optional(),
    customName: z.string().optional(),
    customDailyRate: z.coerce.number().optional(),
    quantity: z.coerce.number().int().positive('Aantal moet minimaal 1 zijn'),
    rentalStart: z.string().min(1, 'Startdatum is verplicht'),
    rentalEnd: z.string().min(1, 'Einddatum is verplicht'),
    discountType: z
      .string()
      .optional()
      .transform((v): z.infer<typeof discountTypeSchema> | null =>
        v === 'PERCENTAGE' || v === 'AMOUNT' ? v : null
      ),
    discountValue: optionalNonNegativeNumber,
  })
  .superRefine((data, ctx) => {
    refineDiscountFields(data, ctx);
    if (data.lineType === 'catalog') {
      if (!data.equipmentId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Kies materiaal uit catalogus',
          path: ['equipmentId'],
        });
      }
    } else {
      if (!data.customName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Naam is verplicht',
          path: ['customName'],
        });
      }
      if (
        data.customDailyRate == null ||
        !Number.isFinite(data.customDailyRate) ||
        data.customDailyRate <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dagtarief moet positief zijn',
          path: ['customDailyRate'],
        });
      }
    }
  })
  .transform((data) => ({
    projectId: data.projectId,
    quantity: data.quantity,
    rentalStart: data.rentalStart,
    rentalEnd: data.rentalEnd,
    equipmentId: data.lineType === 'catalog' ? data.equipmentId!.trim() : null,
    customName: data.lineType === 'custom' ? data.customName!.trim() : null,
    customDailyRate: data.lineType === 'custom' ? data.customDailyRate! : null,
    discountType: data.discountType,
    discountValue: data.discountType ? data.discountValue : null,
  }));

export const STATUS_LABELS: Record<
  z.infer<typeof projectStatusSchema>,
  string
> = {
  CONCEPT: 'Concept',
  OFFERTE: 'Offerte',
  BEVESTIGD: 'Bevestigd',
  AFGEROND: 'Afgerond',
};
