import { prisma } from '@/lib/db';
import type { CompanySettings } from '@/generated/prisma/client';
import { computeVatTotals } from '@/lib/vat';

export { computeVatTotals };

const DEFAULTS: Omit<CompanySettings, 'id'> = {
  companyName: '',
  address: '',
  email: null,
  phone: null,
  kvkNumber: null,
  vatNumber: null,
  iban: null,
  quoteValidityDays: 30,
  defaultVatRate: 21,
  paymentTerms: null,
};

export async function getCompanySettings(): Promise<CompanySettings> {
  const existing = await prisma.companySettings.findUnique({
    where: { id: 'default' },
  });
  if (existing) return existing;
  return prisma.companySettings.create({
    data: { id: 'default', ...DEFAULTS },
  });
}

export function isCompanyConfigured(settings: CompanySettings): boolean {
  return settings.companyName.trim().length > 0 && settings.address.trim().length > 0;
}

export function quoteValidUntil(from: Date, validityDays: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + validityDays);
  return d;
}
